import prisma from '../config/database.js';
import { AppError } from '../utils/AppError.js';
import * as massiveService from './massive.service.js';

/**
 * Buys an options contract
 * INVESTED-182: tradeService.buyOption()
 * INVESTED-183: Validate sufficient cash balance
 * INVESTED-184: Update options position and deduct cash
 */
export const buyOption = async (
  userId: string,
  data: {
    symbol: string;
    contractSymbol: string;
    optionType: 'CALL' | 'PUT';
    strikePrice: number;
    expirationDate: string;
    quantity: number;
    price: number;
  }
) => {
  const portfolio = await prisma.portfolio.findFirst({
    where: { userId },
  });

  if (!portfolio) {
    throw new AppError('Portfolio not found', 404);
  }

  const contractMultiplier = 100;
  const totalCost = data.price * data.quantity * contractMultiplier;

  // INVESTED-183: Validate sufficient cash balance
  if (portfolio.cashBalance < totalCost) {
    throw new AppError(
      `Insufficient funds. Required: $${totalCost.toFixed(2)}, Available: $${portfolio.cashBalance.toFixed(2)}`,
      400
    );
  }

  // INVESTED-184: Update position and deduct cash in a transaction
  const result = await prisma.$transaction(async (tx) => {
    // Deduct cash
    const updatedPortfolio = await tx.portfolio.update({
      where: { id: portfolio.id },
      data: { cashBalance: { decrement: totalCost } },
    });

    // Create or update position
    const existingPosition = await tx.position.findFirst({
      where: {
        portfolioId: portfolio.id,
        symbol: data.symbol,
        positionType: 'OPTION',
        strikePrice: data.strikePrice,
        expirationDate: new Date(data.expirationDate),
        status: 'OPEN',
      },
    });

    let position;
    if (existingPosition) {
      const existingQty = Number(existingPosition.quantity);
      const existingCost = Number(existingPosition.avgCost);
      const newAvgCost =
        (existingCost * existingQty + data.price * data.quantity) /
        (existingQty + data.quantity);

      position = await tx.position.update({
        where: { id: existingPosition.id },
        data: {
          quantity: { increment: data.quantity },
          avgCost: newAvgCost,
        },
      });
    } else {
      position = await tx.position.create({
        data: {
          symbol: data.symbol,
          quantity: data.quantity,
          avgCost: data.price,
          positionType: 'OPTION',
          optionType: data.optionType,
          strikePrice: data.strikePrice,
          expirationDate: new Date(data.expirationDate),
          contractSymbol: data.contractSymbol,
          status: 'OPEN',
          portfolioId: portfolio.id,
        },
      });
    }

    // Record transaction
    const transaction = await tx.transaction.create({
      data: {
        type: 'BUY',
        symbol: data.symbol,
        quantity: data.quantity,
        price: data.price,
        positionType: 'OPTION',
        optionType: data.optionType,
        strikePrice: data.strikePrice,
        expirationDate: new Date(data.expirationDate),
        contractSymbol: data.contractSymbol,
        portfolioId: portfolio.id,
      },
    });

    return { position, transaction, cashBalance: updatedPortfolio.cashBalance };
  });

  return result;
};

/**
 * Sells an options contract
 * INVESTED-189: tradeService.sellOption()
 * INVESTED-190: Validate sufficient options position
 * INVESTED-191: Update options position and add cash
 */
export const sellOption = async (
  userId: string,
  data: {
    symbol: string;
    contractSymbol: string;
    optionType: 'CALL' | 'PUT';
    strikePrice: number;
    expirationDate: string;
    quantity: number;
    price: number;
  }
) => {
  const portfolio = await prisma.portfolio.findFirst({
    where: { userId },
  });

  if (!portfolio) {
    throw new AppError('Portfolio not found', 404);
  }

  // INVESTED-190: Validate sufficient position
  const existingPosition = await prisma.position.findFirst({
    where: {
      portfolioId: portfolio.id,
      symbol: data.symbol,
      positionType: 'OPTION',
      strikePrice: data.strikePrice,
      expirationDate: new Date(data.expirationDate),
      status: 'OPEN',
    },
  });

  if (!existingPosition) {
    throw new AppError('No open position found for this contract', 404);
  }

  if (Number(existingPosition.quantity) < data.quantity) {
    throw new AppError(
      `Insufficient position. Have: ${existingPosition.quantity}, Selling: ${data.quantity}`,
      400
    );
  }

  const contractMultiplier = 100;
  const totalProceeds = data.price * data.quantity * contractMultiplier;

  // INVESTED-191: Update position and add cash
  const result = await prisma.$transaction(async (tx) => {
    // Add cash
    const updatedPortfolio = await tx.portfolio.update({
      where: { id: portfolio.id },
      data: { cashBalance: { increment: totalProceeds } },
    });

    const remainingQty = Number(existingPosition.quantity) - data.quantity;
    let position;

    if (remainingQty === 0) {
      position = await tx.position.update({
        where: { id: existingPosition.id },
        data: { status: 'CLOSED', quantity: 0 },
      });
    } else {
      position = await tx.position.update({
        where: { id: existingPosition.id },
        data: { quantity: remainingQty },
      });
    }

    // Record transaction
    const transaction = await tx.transaction.create({
      data: {
        type: 'SELL',
        symbol: data.symbol,
        quantity: data.quantity,
        price: data.price,
        positionType: 'OPTION',
        optionType: data.optionType,
        strikePrice: data.strikePrice,
        expirationDate: new Date(data.expirationDate),
        contractSymbol: data.contractSymbol,
        portfolioId: portfolio.id,
      },
    });

    return { position, transaction, cashBalance: updatedPortfolio.cashBalance };
  });

  return result;
};
