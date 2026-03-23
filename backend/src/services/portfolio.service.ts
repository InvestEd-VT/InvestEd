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
      ...(status ? { status } : {}),
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
