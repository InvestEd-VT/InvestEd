/*
  Warnings:

  - A unique constraint covering the columns `[portfolioId,symbol,positionType,strikePrice,expirationDate]` on the table `Position` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "PositionType" AS ENUM ('STOCK', 'OPTION');

-- CreateEnum
CREATE TYPE "OptionType" AS ENUM ('CALL', 'PUT');

-- CreateEnum
CREATE TYPE "PositionStatus" AS ENUM ('OPEN', 'CLOSED', 'EXPIRED', 'EXERCISED');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "TransactionType" ADD VALUE 'EXERCISE';
ALTER TYPE "TransactionType" ADD VALUE 'EXPIRED_WORTHLESS';
ALTER TYPE "TransactionType" ADD VALUE 'EXPIRATION';

-- DropIndex
DROP INDEX "Position_portfolioId_symbol_key";

-- AlterTable
ALTER TABLE "Position" ADD COLUMN     "contractSymbol" TEXT,
ADD COLUMN     "expirationDate" TIMESTAMP(3),
ADD COLUMN     "optionType" "OptionType",
ADD COLUMN     "positionType" "PositionType" NOT NULL DEFAULT 'STOCK',
ADD COLUMN     "status" "PositionStatus" NOT NULL DEFAULT 'OPEN',
ADD COLUMN     "strikePrice" DECIMAL(18,2);

-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "contractSymbol" TEXT,
ADD COLUMN     "expirationDate" TIMESTAMP(3),
ADD COLUMN     "optionType" "OptionType",
ADD COLUMN     "positionType" "PositionType" NOT NULL DEFAULT 'STOCK',
ADD COLUMN     "strikePrice" DECIMAL(18,2);

-- CreateIndex
CREATE INDEX "Position_expirationDate_idx" ON "Position"("expirationDate");

-- CreateIndex
CREATE INDEX "Position_status_idx" ON "Position"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Position_portfolioId_symbol_positionType_strikePrice_expira_key" ON "Position"("portfolioId", "symbol", "positionType", "strikePrice", "expirationDate");

-- CreateIndex
CREATE INDEX "Transaction_positionType_idx" ON "Transaction"("positionType");
