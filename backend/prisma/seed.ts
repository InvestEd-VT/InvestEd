import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding education modules...');

  const INTRO_TO_OPTIONS_ID = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
  const INTRO_TO_SELLING_ID = 'b2c3d4e5-f6a7-8901-bcde-f12345678901';
  const CALLS_AND_PUTS_ID = 'c3d4e5f6-a7b8-9012-cdef-123456789012';

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

  await prisma.module.upsert({
    where: { id: INTRO_TO_SELLING_ID },
    update: {
      title: 'Intro to Selling Options',
      description:
        "Understand the seller's role in options contracts — obligations, assignment, and how the four basic positions fit together.",
      order: 2,
    },
    create: {
      id: INTRO_TO_SELLING_ID,
      title: 'Intro to Selling Options',
      description:
        "Understand the seller's role in options contracts — obligations, assignment, and how the four basic positions fit together.",
      order: 2,
    },
  });

  await prisma.module.upsert({
    where: { id: CALLS_AND_PUTS_ID },
    update: {
      title: 'Calls & Puts',
      description:
        'Explore call and put options in depth — how they work, when to use each, and key concepts like in the money and out of the money.',
      order: 3,
    },
    create: {
      id: CALLS_AND_PUTS_ID,
      title: 'Calls & Puts',
      description:
        'A deeper look at the two types of options contracts — how they work, when to use them, and what it means for an option to be in the money, at the money, or out of the money.',
      order: 3,
    },
  });

  console.log('✅ Modules seeded successfully');
  console.log('   → Order 1: Intro to Options');
  console.log('   → Order 2: Intro to Selling Options');
  console.log('   → Order 3: Calls & Puts');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
