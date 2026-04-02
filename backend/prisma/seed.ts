import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding education modules...');

  const INTRO_TO_OPTIONS_ID = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';

  await prisma.module.upsert({
    where: { id: INTRO_TO_OPTIONS_ID },
    update: {
      title: 'Intro to Options',
      description:
        'Learn the fundamentals of options contracts, key terminology, and how options differ from stocks.',
      order: 1,
    },
    create: {
      id: INTRO_TO_OPTIONS_ID,
      title: 'Intro to Options',
      description:
        'Learn the fundamentals of options contracts, key terminology, and how options differ from stocks.',
      order: 1,
    },
  });

  console.log('✅ Modules seeded successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
