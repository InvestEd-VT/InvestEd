import prisma from '../config/database.js';
import { AppError } from '../utils/AppError.js';

export const getWatchlist = async (userId: string) => {
  return prisma.watchlist.findMany({
    where: { userId },
    orderBy: { addedAt: 'desc' },
  });
};

export const addToWatchlist = async (userId: string, symbol: string) => {
  const existing = await prisma.watchlist.findUnique({
    where: { userId_symbol: { userId, symbol: symbol.toUpperCase() } },
  });

  if (existing) {
    throw new AppError('Symbol already in watchlist', 409);
  }

  return prisma.watchlist.create({
    data: { userId, symbol: symbol.toUpperCase() },
  });
};

export const removeFromWatchlist = async (userId: string, symbol: string) => {
  const existing = await prisma.watchlist.findUnique({
    where: { userId_symbol: { userId, symbol: symbol.toUpperCase() } },
  });

  if (!existing) {
    throw new AppError('Symbol not in watchlist', 404);
  }

  return prisma.watchlist.delete({
    where: { userId_symbol: { userId, symbol: symbol.toUpperCase() } },
  });
};
