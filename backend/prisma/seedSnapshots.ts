import prisma from '../src/config/database';

const seedSnapshots = async () => {
  const portfolios = await prisma.portfolio.findMany({
    include: { positions: true },
  });

  console.log(`Seeding snapshots for ${portfolios.length} portfolio(s)...`);

  for (const portfolio of portfolios) {
    const positionsValue = portfolio.positions.reduce((sum, p) => {
      return sum + Number(p.quantity) * Number(p.avgCost);
    }, 0);

    const baseTotal = Number(portfolio.cashBalance) + positionsValue;

    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);

      // gentle oscillation around real current value
      const variance = Math.sin(i / 4) * 150 + (Math.random() - 0.5) * 80;
      const totalValue = Math.max(0, baseTotal + variance);
      const snapshotPositionsValue = Math.max(0, positionsValue + variance * 0.6);
      const cashBalance = totalValue - snapshotPositionsValue;

      await prisma.portfolioSnapshot.upsert({
        where: {
          portfolioId_recordedAt: {
            portfolioId: portfolio.id,
            recordedAt: date,
          },
        },
        update: {},
        create: {
          portfolioId: portfolio.id,
          totalValue,
          cashBalance,
          positionsValue: snapshotPositionsValue,
          recordedAt: date,
        },
      });
    }

    console.log(`✓ Seeded 30 snapshots for portfolio ${portfolio.id}`);
  }

  console.log('Done.');
  await prisma.$disconnect();
};

seedSnapshots().catch((e) => {
  console.error(e);
  process.exit(1);
});
