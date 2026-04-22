import prisma from '../config/database.js';

const STARTING_BALANCE = 10000;

export interface LeaderboardEntry {
  rank: number;
  firstName: string;
  lastName: string;
  userId: string;
  pnl: number;
  pnlPercent: number;
}

/**
 * Returns the top 20 users ranked by portfolio P&L descending.
 * P&L is calculated as (cashBalance - $10,000 starting balance).
 * Email is intentionally excluded for privacy.
 */
export const getLeaderboard = async (): Promise<LeaderboardEntry[]> => {
  // Fetch all users that have a portfolio, including their portfolio cashBalance
  const users = await prisma.user.findMany({
    where: {
      portfolios: { some: {} },
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      portfolios: {
        select: {
          cashBalance: true,
        },
        take: 1,
      },
    },
  });

  // Calculate P&L for each user and sort
  const entries = users
    .map((user) => {
      const cashBalance = user.portfolios[0]?.cashBalance ?? STARTING_BALANCE;
      const pnl = cashBalance - STARTING_BALANCE;
      const pnlPercent = (pnl / STARTING_BALANCE) * 100;

      return {
        userId: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        pnl,
        pnlPercent,
        rank: 0,
      };
    })
    .sort((a, b) => b.pnl - a.pnl)
    .slice(0, 20);

  // Assign ranks after sorting
  entries.forEach((entry, index) => {
    entry.rank = index + 1;
  });

  return entries;
};
