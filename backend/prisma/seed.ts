import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding education modules...');

  const INTRO_TO_OPTIONS_ID = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
  const INTRO_TO_SELLING_ID = 'b2c3d4e5-f6a7-8901-bcde-f12345678901';
  const CALLS_AND_PUTS_ID = 'c3d4e5f6-a7b8-9012-cdef-123456789012';
  const GREEKS_OVERVIEW_ID = 'd4e5f6a7-b8c9-0123-defa-234567890123';
  const STRIKE_PRICE_EXPIRATION_ID = 'e5f6a7b8-c9d0-1234-efab-345678901234';
  const OPTION_PREMIUM_ID = 'f6a7b8c9-d0e1-2345-fabc-456789012345';
  const MONEYNESS_ID = 'a7b8c9d0-e1f2-3456-abcd-567890123456';

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

  await prisma.module.upsert({
    where: { id: GREEKS_OVERVIEW_ID },
    update: {
      title: 'Greeks Overview',
      description:
        'An introduction to Delta, Gamma, Theta, and Vega — the key metrics for evaluating options contracts.',
      order: 4,
    },
    create: {
      id: GREEKS_OVERVIEW_ID,
      title: 'Greeks Overview',
      description:
        'An introduction to Delta, Gamma, Theta, and Vega — the key metrics for evaluating options contracts.',
      order: 4,
    },
  });

  await prisma.module.upsert({
    where: { id: STRIKE_PRICE_EXPIRATION_ID },
    update: {
      title: 'Strike Price & Expiration',
      description:
        "How strike price and expiration date shape an option's value, and how to read an options chain.",
      order: 5,
    },
    create: {
      id: STRIKE_PRICE_EXPIRATION_ID,
      title: 'Strike Price & Expiration',
      description:
        "How strike price and expiration date shape an option's value, and how to read an options chain.",
      order: 5,
    },
  });
  await prisma.module.upsert({
    where: { id: OPTION_PREMIUM_ID },
    update: {
      title: 'Option Premium Explained',
      description:
        "How an option's premium is quoted, what bid and ask mean, and how to read a price in the chain.",
      order: 6,
    },
    create: {
      id: OPTION_PREMIUM_ID,
      title: 'Option Premium Explained',
      description:
        "How an option's premium is quoted, what bid and ask mean, and how to read a price in the chain.",
      order: 6,
    },
  });
  await prisma.module.upsert({
    where: { id: MONEYNESS_ID },
    update: {
      title: 'In the Money, At the Money, Out of the Money',
      description:
        'How ITM, ATM, and OTM affect premium cost, Delta, and the tradeoff between price and probability.',
      order: 7,
    },
    create: {
      id: MONEYNESS_ID,
      title: 'In the Money, At the Money, Out of the Money',
      description:
        'How ITM, ATM, and OTM affect premium cost, Delta, and the tradeoff between price and probability.',
      order: 7,
    },
  });

  console.log('✅ Modules seeded successfully');
  console.log('   → Order 1: Intro to Options');
  console.log('   → Order 2: Intro to Selling Options');
  console.log('   → Order 3: Calls & Puts');
  console.log('   → Order 4: Greeks Overview');
  console.log('   → Order 5: Strike Price & Expiration');
  console.log('   → Order 6: Option Premium Explained');
  console.log('   → Order 7: In the Money, At the Money, Out of the Money');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
