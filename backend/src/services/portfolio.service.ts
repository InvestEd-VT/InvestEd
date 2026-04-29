import { Prisma, Transaction } from '@prisma/client';
import prisma from '../config/database.js';
import { AppError } from '../utils/AppError.js';
import { getStockPriceWithCache } from './priceCache.service.js';

type PrismaClientOrTransaction = typeof prisma | Prisma.TransactionClient;

const DEFAULT_PORTFOLIO_NAME = 'My Portfolio';
const DEFAULT_PORTFOLIO_CASH_BALANCE = 10000;

/**
 * Creates a default portfolio with $10,000 starting balance
 * Called automatically during user registration
 */
export const createDefaultPortfolio = async (
  userId: string,
  db: PrismaClientOrTransaction = prisma
) => {
  return db.portfolio.create({
    data: {
      name: DEFAULT_PORTFOLIO_NAME,
      userId,
      cashBalance: DEFAULT_PORTFOLIO_CASH_BALANCE,
    },
  });
};

/**
 * Builds a cost basis map keyed by contractSymbol or symbol from BUY transactions
 * Tracks total cost and total quantity separately to calculate average cost per unit
 * This allows proportional cost basis calculation when closing partial positions
 */
const buildCostBasisMap = (
  buyTransactions: Transaction[]
): Map<string, { totalCost: number; totalQty: number }> => {
  const costBasisMap = new Map<string, { totalCost: number; totalQty: number }>();
  for (const tx of buyTransactions) {
    const key = tx.contractSymbol ?? tx.symbol;
    const multiplier = tx.positionType === 'OPTION' ? 100 : 1;
    const cost = Number(tx.price) * Number(tx.quantity) * multiplier;
    const qty = Number(tx.quantity);
    const existing = costBasisMap.get(key) ?? { totalCost: 0, totalQty: 0 };
    costBasisMap.set(key, {
      totalCost: existing.totalCost + cost,
      totalQty: existing.totalQty + qty,
    });
  }
  return costBasisMap;
};

/**
 * Calculate realized P&L from closed transactions
 * Proceeds minus cost basis for SELL and EXERCISE transactions
 * Full premium lost for EXPIRED_WORTHLESS transactions
 * Accepts pre-fetched transactions to avoid duplicate DB calls
 */
const calculateRealizedPnL = (
  closedTransactions: Transaction[],
  buyTransactions: Transaction[]
): number => {
  const costBasisMap = buildCostBasisMap(buyTransactions);

  return closedTransactions.reduce((total, tx) => {
    const quantity = Number(tx.quantity);
    const price = Number(tx.price);
    const multiplier = tx.positionType === 'OPTION' ? 100 : 1;
    const key = tx.contractSymbol ?? tx.symbol;
    const entry = costBasisMap.get(key);

    // Calculate proportional cost basis for the quantity being closed
    // avgCostPerUnit * closedQuantity gives only the cost of what was actually closed
    const avgCostPerUnit = entry ? entry.totalCost / entry.totalQty : 0;
    const proportionalCost = avgCostPerUnit * quantity;

    if (tx.type === 'SELL' || tx.type === 'EXERCISE') {
      // Realized P&L = proceeds - proportional cost of closed contracts
      return total + price * quantity * multiplier - proportionalCost;
    } else {
      // EXPIRED_WORTHLESS: proportional cost of expired contracts is lost
      return total - proportionalCost;
    }
  }, 0);
};

/**
 * Calculate win rate from closed trades
 * A win is a SELL or EXERCISE transaction where proceeds exceeded cost basis
 * EXPIRED_WORTHLESS transactions always count as losses
 * Returns null if no closed trades exist
 * Accepts pre-fetched transactions to avoid duplicate DB calls
 */
const calculateWinRate = (
  closedTransactions: Transaction[],
  buyTransactions: Transaction[]
): number | null => {
  if (closedTransactions.length === 0) return null;

  const costBasisMap = buildCostBasisMap(buyTransactions);

  let wins = 0;
  for (const tx of closedTransactions) {
    if (tx.type === 'EXPIRED_WORTHLESS') continue;

    const key = tx.contractSymbol ?? tx.symbol;
    const entry = costBasisMap.get(key);
    const avgCostPerUnit = entry ? entry.totalCost / entry.totalQty : 0;
    const proportionalCost = avgCostPerUnit * Number(tx.quantity);
    const proceeds =
      Number(tx.price) * Number(tx.quantity) * (tx.positionType === 'OPTION' ? 100 : 1);

    if (proceeds > proportionalCost) wins++;
  }

  return Math.round((wins / closedTransactions.length) * 100);
};

/**
 * Calculate P&L breakdown by underlying symbol
 * Combines realized P&L from closed transactions and unrealized P&L from open positions
 * Ordered by absolute total P&L descending for display in the bar chart
 * Accepts pre-fetched transactions to avoid duplicate DB calls
 */
const calculatePnLBySymbol = (
  closedTransactions: Transaction[],
  buyTransactions: Transaction[],
  openPositions: Array<{ symbol: string; unrealizedPnL: number }>
): Array<{ symbol: string; realizedPnL: number; unrealizedPnL: number; totalPnL: number }> => {
  const costBasisMap = buildCostBasisMap(buyTransactions);
  const realizedBySymbol = new Map<string, number>();

  for (const tx of closedTransactions) {
    const symbol = tx.symbol;
    const multiplier = tx.positionType === 'OPTION' ? 100 : 1;
    const key = tx.contractSymbol ?? tx.symbol;
    const entry = costBasisMap.get(key);

    // Proportional cost basis for quantity being closed
    const avgCostPerUnit = entry ? entry.totalCost / entry.totalQty : 0;
    const proportionalCost = avgCostPerUnit * Number(tx.quantity);
    let pnl = 0;

    if (tx.type === 'SELL' || tx.type === 'EXERCISE') {
      // Realized P&L = proceeds - proportional cost basis
      pnl = Number(tx.price) * Number(tx.quantity) * multiplier - proportionalCost;
    } else {
      // EXPIRED_WORTHLESS: proportional cost of expired position lost
      pnl = -proportionalCost;
    }

    realizedBySymbol.set(symbol, (realizedBySymbol.get(symbol) ?? 0) + pnl);
  }

  const unrealizedBySymbol = new Map<string, number>();
  for (const pos of openPositions) {
    unrealizedBySymbol.set(
      pos.symbol,
      (unrealizedBySymbol.get(pos.symbol) ?? 0) + pos.unrealizedPnL
    );
  }

  const allSymbols = new Set([...realizedBySymbol.keys(), ...unrealizedBySymbol.keys()]);

  const result = Array.from(allSymbols).map((symbol) => {
    const realizedPnL = realizedBySymbol.get(symbol) ?? 0;
    const unrealizedPnL = unrealizedBySymbol.get(symbol) ?? 0;
    return { symbol, realizedPnL, unrealizedPnL, totalPnL: realizedPnL + unrealizedPnL };
  });

  return result.sort((a, b) => Math.abs(b.totalPnL) - Math.abs(a.totalPnL));
};

/**
 * Returns portfolio summary including:
 * - realizedPnL: locked-in profit/loss from closed trades
 * - winRate: percentage of closed trades that were profitable (null if no closed trades)
 * - pnlBySymbol: P&L breakdown per underlying for bar chart display
 * - positions: open positions with unrealized P&L
 * Fetches BUY and closed transactions once and passes them to sub-calculations
 * to avoid redundant DB calls
 */
export const getPortfolio = async (userId: string) => {
  const portfolio = await prisma.portfolio.findFirst({
    where: { userId },
    include: {
      positions: {
        where: { status: 'OPEN' },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!portfolio) {
    throw new AppError('Portfolio not found', 404);
  }

  const { totalPositionsValue, totalPnL, positionsWithPnL } = await calculatePortfolioValue(
    portfolio.positions
  );

  // Fetch BUY and closed transactions once, shared across all three P&L calculations
  // to avoid three separate DB round trips for the same data
  const [buyTransactions, closedTransactions] = await Promise.all([
    prisma.transaction.findMany({
      where: { portfolioId: portfolio.id, type: 'BUY' },
    }),
    prisma.transaction.findMany({
      where: {
        portfolioId: portfolio.id,
        type: { in: ['SELL', 'EXERCISE', 'EXPIRED_WORTHLESS'] },
      },
    }),
  ]);

  const realizedPnL = calculateRealizedPnL(closedTransactions, buyTransactions);
  const winRate = calculateWinRate(closedTransactions, buyTransactions);
  const pnlBySymbol = calculatePnLBySymbol(closedTransactions, buyTransactions, positionsWithPnL);

  return {
    id: portfolio.id,
    name: portfolio.name,
    cashBalance: portfolio.cashBalance,
    positionsValue: totalPositionsValue,
    totalValue: portfolio.cashBalance + totalPositionsValue,
    // totalPnL is unrealized only, open positions valued at avgCost until live prices are added
    totalPnL,
    totalPnLPercent:
      DEFAULT_PORTFOLIO_CASH_BALANCE > 0
        ? ((portfolio.cashBalance + totalPositionsValue - DEFAULT_PORTFOLIO_CASH_BALANCE) /
            DEFAULT_PORTFOLIO_CASH_BALANCE) *
          100
        : 0,
    realizedPnL,
    winRate,
    pnlBySymbol,
    positions: positionsWithPnL,
    createdAt: portfolio.createdAt,
    updatedAt: portfolio.updatedAt,
  };
};

/**
 * Gets all positions for a portfolio
 * Defaults to OPEN positions, pass status param to filter by other states
 */
export const getPositions = async (
  userId: string,
  status?: 'OPEN' | 'CLOSED' | 'EXPIRED' | 'EXERCISED'
) => {
  const portfolio = await prisma.portfolio.findFirst({
    where: { userId },
  });

  if (!portfolio) {
    throw new AppError('Portfolio not found', 404);
  }

  const positions = await prisma.position.findMany({
    where: {
      portfolioId: portfolio.id,
      status: status || 'OPEN',
    },
    orderBy: { createdAt: 'desc' },
  });

  return positions;
};

/**
 * Gets transaction history for a portfolio with optional filtering and sorting
 * Supports filtering by type, symbol, positionType, and date range
 * Supports sorting by executedAt asc or desc (defaults to desc)
 */
export const getTransactions = async (
  userId: string,
  filters: {
    type?: string;
    symbol?: string;
    positionType?: string;
    from?: string;
    to?: string;
    limit?: number;
    offset?: number;
    sort?: 'asc' | 'desc';
  } = {}
) => {
  const portfolio = await prisma.portfolio.findFirst({ where: { userId } });
  if (!portfolio) throw new AppError('Portfolio not found', 404);

  const where: Record<string, unknown> = { portfolioId: portfolio.id };
  if (filters.type) where.type = filters.type;
  if (filters.symbol) where.symbol = filters.symbol;
  if (filters.positionType) where.positionType = filters.positionType;
  if (filters.from || filters.to) {
    where.executedAt = {};
    if (filters.from) (where.executedAt as Record<string, unknown>).gte = new Date(filters.from);
    if (filters.to) (where.executedAt as Record<string, unknown>).lte = new Date(filters.to);
  }

  const [transactions, total] = await Promise.all([
    prisma.transaction.findMany({
      where,
      orderBy: { executedAt: filters.sort === 'asc' ? 'asc' : 'desc' },
      take: Math.min(filters.limit || 50, 200),
      skip: filters.offset || 0,
    }),
    prisma.transaction.count({ where }),
  ]);

  const effectiveLimit = Math.min(filters.limit || 50, 200);
  return { transactions, total, limit: effectiveLimit, offset: filters.offset || 0 };
};

/**
 * Resets a portfolio back to $10,000 with no positions
 * Deletes all transactions and snapshots so history starts fresh
 * Closes all open positions rather than deleting them to preserve audit trail
 */
export const resetPortfolio = async (userId: string) => {
  const portfolio = await prisma.portfolio.findFirst({
    where: { userId },
    include: { positions: true },
  });

  if (!portfolio) throw new AppError('Portfolio not found', 404);

  await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    // Close all open positions
    await tx.position.updateMany({
      where: { portfolioId: portfolio.id, status: 'OPEN' },
      data: { status: 'CLOSED' },
    });

    // Delete all transactions
    await tx.transaction.deleteMany({
      where: { portfolioId: portfolio.id },
    });

    // Delete all snapshots
    await tx.portfolioSnapshot.deleteMany({
      where: { portfolioId: portfolio.id },
    });

    // Reset cash balance
    await tx.portfolio.update({
      where: { id: portfolio.id },
      data: { cashBalance: DEFAULT_PORTFOLIO_CASH_BALANCE },
    });
  });

  return { message: 'Portfolio reset to $10,000', cashBalance: DEFAULT_PORTFOLIO_CASH_BALANCE };
};

/**
 * Gets portfolio value history for charting
 * Returns daily snapshots taken by the portfolio snapshot cron job
 * Supports period filtering: 7d, 30d, 90d, 1y, all
 */
export const getPortfolioHistory = async (userId: string, period: string = '30d') => {
  const portfolio = await prisma.portfolio.findFirst({ where: { userId } });
  if (!portfolio) throw new AppError('Portfolio not found', 404);

  const periodDays: Record<string, number> = {
    '7d': 7,
    '30d': 30,
    '90d': 90,
    '1y': 365,
    all: 3650,
  };

  const days = periodDays[period] || 30;
  const since = new Date();
  since.setDate(since.getDate() - days);

  const snapshots = await prisma.portfolioSnapshot.findMany({
    where: {
      portfolioId: portfolio.id,
      recordedAt: { gte: since },
    },
    orderBy: { recordedAt: 'asc' },
    select: {
      recordedAt: true,
      totalValue: true,
      cashBalance: true,
      positionsValue: true,
    },
  });

  const history = snapshots.map(
    (s: {
      recordedAt: Date;
      totalValue: Prisma.Decimal;
      cashBalance: Prisma.Decimal;
      positionsValue: Prisma.Decimal;
    }) => ({
      date: s.recordedAt,
      totalValue: Number(s.totalValue),
      cashBalance: Number(s.cashBalance),
      positionsValue: Number(s.positionsValue),
    })
  );

  return { history, currentCash: portfolio.cashBalance };
};

/**
 * Calculates total value and unrealized P&L for a set of open positions.
 * Fetches live stock prices from cache/API for accurate market valuations.
 * INVESTED-337: Replaced hardcoded avgCost with live Massive API prices.
 */
const calculatePortfolioValue = async (
  positions: Array<{
    symbol: string;
    quantity: Prisma.Decimal;
    avgCost: Prisma.Decimal;
    positionType: string;
    optionType: string | null;
    strikePrice: Prisma.Decimal | null;
  }>
) => {
  let totalPositionsValue = 0;
  let totalPnL = 0;

  // Fetch live prices for all unique symbols
  const uniqueSymbols = [...new Set(positions.map((p) => p.symbol))];
  const priceMap = new Map<string, number>();
  await Promise.all(
    uniqueSymbols.map(async (symbol) => {
      try {
        const data = await getStockPriceWithCache(symbol);
        priceMap.set(symbol, data.price);
      } catch {
        // If price fetch fails, we'll fall back to avgCost below
      }
    })
  );

  const positionsWithPnL = positions.map((position) => {
    const quantity = Number(position.quantity);
    const avgCost = Number(position.avgCost);
    const multiplier = position.positionType === 'OPTION' ? 100 : 1;

    // Use live price if available, fall back to avgCost
    const currentPrice = priceMap.get(position.symbol) ?? avgCost;
    const marketValue = currentPrice * quantity * multiplier;
    const costBasis = avgCost * quantity * multiplier;
    const unrealizedPnL = marketValue - costBasis;
    const unrealizedPnLPercent = costBasis > 0 ? (unrealizedPnL / costBasis) * 100 : 0;

    totalPositionsValue += marketValue;
    totalPnL += unrealizedPnL;

    return {
      ...position,
      quantity: Number(position.quantity),
      avgCost: Number(position.avgCost),
      strikePrice: position.strikePrice ? Number(position.strikePrice) : null,
      currentPrice,
      marketValue,
      costBasis,
      unrealizedPnL,
      unrealizedPnLPercent,
    };
  });

  return { totalPositionsValue, totalPnL, positionsWithPnL };
};
