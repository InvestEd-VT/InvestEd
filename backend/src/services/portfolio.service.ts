import { Prisma } from '@prisma/client';
import prisma from '../config/database.js';
import { AppError } from '../utils/AppError.js';

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
 * Gets a user's portfolio with positions and calculates total value and P&L
 * Returns portfolio summary including cash balance, positions value, and total value
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

  const { totalPositionsValue, totalPnL, positionsWithPnL } = calculatePortfolioValue(portfolio.positions);

  return {
    id: portfolio.id,
    name: portfolio.name,
    cashBalance: portfolio.cashBalance,
    positionsValue: totalPositionsValue,
    totalValue: portfolio.cashBalance + totalPositionsValue,
    totalPnL,
    totalPnLPercent: DEFAULT_PORTFOLIO_CASH_BALANCE > 0
      ? ((portfolio.cashBalance + totalPositionsValue - DEFAULT_PORTFOLIO_CASH_BALANCE) / DEFAULT_PORTFOLIO_CASH_BALANCE) * 100
      : 0,
    positions: positionsWithPnL,
    createdAt: portfolio.createdAt,
    updatedAt: portfolio.updatedAt,
  };
};

/**
 * Gets all positions for a portfolio (open positions only by default)
 */
export const getPositions = async (userId: string, status?: 'OPEN' | 'CLOSED' | 'EXPIRED' | 'EXERCISED') => {
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
 * Calculates total value and P&L for a set of positions
 * Note: Uses avgCost as current value placeholder until Massive API integration (INVESTED-150)
 * Once live prices are available, this will fetch real-time prices per position
 */
/**
 * Gets transaction history for a portfolio
 * INVESTED-146: transactionService.getTransactions()
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
      orderBy: { executedAt: 'desc' },
      take: filters.limit || 50,
      skip: filters.offset || 0,
    }),
    prisma.transaction.count({ where }),
  ]);

  return { transactions, total, limit: filters.limit || 50, offset: filters.offset || 0 };
};

/**
 * Resets a portfolio back to $10,000 with no positions
 * INVESTED-265: POST /api/v1/portfolio/reset
 */
export const resetPortfolio = async (userId: string) => {
  const portfolio = await prisma.portfolio.findFirst({
    where: { userId },
    include: { positions: true },
  });

  if (!portfolio) throw new AppError('Portfolio not found', 404);

  await prisma.$transaction(async (tx) => {
    // Close all open positions
    await tx.position.updateMany({
      where: { portfolioId: portfolio.id, status: 'OPEN' },
      data: { status: 'CLOSED' },
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
 * INVESTED-292: GET /api/v1/portfolio/history
 * Note: Returns transaction-based history until daily snapshots (INVESTED-291) are implemented
 */
export const getPortfolioHistory = async (userId: string, period: string = '30d') => {
  const portfolio = await prisma.portfolio.findFirst({ where: { userId } });
  if (!portfolio) throw new AppError('Portfolio not found', 404);

  const periodDays: Record<string, number> = {
    '7d': 7, '30d': 30, '90d': 90, '1y': 365, 'all': 3650,
  };
  const days = periodDays[period] || 30;
  const since = new Date();
  since.setDate(since.getDate() - days);

  const transactions = await prisma.transaction.findMany({
    where: {
      portfolioId: portfolio.id,
      executedAt: { gte: since },
    },
    orderBy: { executedAt: 'asc' },
  });

  // Build a simple history from transactions
  let runningCash = DEFAULT_PORTFOLIO_CASH_BALANCE;
  const history = transactions.map((tx) => {
    const amount = Number(tx.price) * Number(tx.quantity) * (tx.positionType === 'OPTION' ? 100 : 1);
    if (tx.type === 'BUY') runningCash -= amount;
    else if (tx.type === 'SELL') runningCash += amount;

    return {
      date: tx.executedAt,
      cashBalance: runningCash,
      type: tx.type,
      symbol: tx.symbol,
    };
  });

  return { history, currentCash: portfolio.cashBalance };
};

const calculatePortfolioValue = (positions: Array<{
  symbol: string;
  quantity: Prisma.Decimal;
  avgCost: Prisma.Decimal;
  positionType: string;
  optionType: string | null;
  strikePrice: Prisma.Decimal | null;
}>) => {
  let totalPositionsValue = 0;
  let totalPnL = 0;

  const positionsWithPnL = positions.map((position) => {
    const quantity = Number(position.quantity);
    const avgCost = Number(position.avgCost);
    const multiplier = position.positionType === 'OPTION' ? 100 : 1;

    // TODO: Replace with live price from Massive API (INVESTED-150)
    const currentPrice = avgCost;
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
