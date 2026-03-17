import { Prisma } from '@prisma/client';
import prisma from '../config/database.js';

type PrismaClientOrTransaction = typeof prisma | Prisma.TransactionClient;

const DEFAULT_PORTFOLIO_NAME = 'My Portfolio';
const DEFAULT_PORTFOLIO_CASH_BALANCE = 10000;

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
