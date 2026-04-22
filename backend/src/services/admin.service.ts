import prisma from '../config/database.js';

export const getAdminStats = async () => {
  const [userCount, tradeCount, activeToday, totalVolume] = await Promise.all([
    prisma.user.count(),
    prisma.transaction.count(),
    prisma.user.count({
      where: { updatedAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
    }),
    prisma.transaction.aggregate({
      _sum: { price: true },
    }),
  ]);

  const recentTrades = await prisma.transaction.findMany({
    orderBy: { executedAt: 'desc' },
    take: 20,
    include: {
      portfolio: {
        include: {
          user: { select: { firstName: true, lastName: true, email: true } },
        },
      },
    },
  });

  const userGrowth = await prisma.user.groupBy({
    by: ['createdAt'],
    _count: true,
    orderBy: { createdAt: 'desc' },
    take: 30,
  });

  return {
    overview: {
      totalUsers: userCount,
      totalTrades: tradeCount,
      activeToday,
      totalVolume: totalVolume._sum.price ? Number(totalVolume._sum.price) : 0,
    },
    recentTrades: recentTrades.map((t) => ({
      id: t.id,
      type: t.type,
      symbol: t.symbol,
      quantity: Number(t.quantity),
      price: Number(t.price),
      optionType: t.optionType,
      executedAt: t.executedAt,
      user: `${t.portfolio.user.firstName} ${t.portfolio.user.lastName}`,
    })),
    userGrowth: userGrowth.map((g) => ({
      date: g.createdAt,
      count: g._count,
    })),
  };
};
