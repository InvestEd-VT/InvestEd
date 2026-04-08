import prisma from '../config/database.js';
import { getStockPrice } from './massive.service.js';
import { AppError } from '../utils/AppError.js';

/**
 * Calculate settlement value for an expiring option
 * Returns intrinsic value per share and total settlement cash
 */
export const calculateSettlement = (
  optionType: string,
  strikePrice: number,
  stockPrice: number,
  quantity: number
): { intrinsicValue: number; settlementValue: number; isITM: boolean } => {
  let intrinsicValue = 0;

  if (optionType === 'CALL') {
    intrinsicValue = Math.max(0, stockPrice - strikePrice);
  } else if (optionType === 'PUT') {
    intrinsicValue = Math.max(0, strikePrice - stockPrice);
  }

  const settlementValue = intrinsicValue * quantity * 100;
  const isITM = intrinsicValue > 0;

  return { intrinsicValue, settlementValue, isITM };
};

/**
 * Options exercise service
 * Handles a single position expiration — ITM exercise or OTM worthless expiry
 */
export const processPositionExpiration = async (positionId: string): Promise<void> => {
  const position = await prisma.position.findUnique({
    where: { id: positionId },
  });

  if (!position) throw new AppError('Position not found', 404);
  if (position.status !== 'OPEN') throw new AppError('Position is not open', 400);
  if (!position.expirationDate) throw new AppError('Position has no expiration date', 400);

  if (!position.optionType) {
    throw new AppError(
      `Position ${positionId} has null optionType — cannot calculate settlement`,
      400
    );
  }

  const quantity = Number(position.quantity);
  const avgCost = Number(position.avgCost);
  const strikePrice = Number(position.strikePrice ?? 0);
  const costBasis = avgCost * quantity * 100;
  const optionType = position.optionType;

  let stockPrice: number;
  try {
    const priceData = await getStockPrice(position.symbol);
    stockPrice = priceData.close;
  } catch {
    throw new AppError(
      `Failed to fetch price for ${position.symbol} — position will be retried on next run`,
      503
    );
  }

  const { intrinsicValue, settlementValue, isITM } = calculateSettlement(
    optionType,
    strikePrice,
    stockPrice,
    quantity
  );

  const pnl = settlementValue - costBasis;
  const transactionType = isITM ? 'EXERCISE' : 'EXPIRED_WORTHLESS';
  const newStatus = isITM ? 'EXERCISED' : 'EXPIRED';

  await prisma.$transaction(async (tx) => {
    const updated = await tx.position.updateMany({
      where: { id: position.id, status: 'OPEN' },
      data: { status: newStatus },
    });

    if (updated.count === 0) throw new AppError('Position already processed', 409);

    if (settlementValue > 0) {
      await tx.portfolio.update({
        where: { id: position.portfolioId },
        data: { cashBalance: { increment: settlementValue } },
      });
    }

    // Record expiration/exercise transaction
    await tx.transaction.create({
      data: {
        type: transactionType,
        symbol: position.symbol,
        quantity: position.quantity,
        price: isITM ? intrinsicValue : avgCost,
        positionType: 'OPTION',
        optionType: position.optionType,
        strikePrice: position.strikePrice,
        expirationDate: position.expirationDate,
        contractSymbol: position.contractSymbol,
        portfolioId: position.portfolioId,
      },
    });
  });

  console.log(
    `[exercise] ${position.symbol} ${optionType} $${strikePrice} — ${newStatus} — P&L: $${pnl.toFixed(2)}`
  );
};
