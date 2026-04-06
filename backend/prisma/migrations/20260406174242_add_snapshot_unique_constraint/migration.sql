/*
  Warnings:

  - A unique constraint covering the columns `[portfolioId,recordedAt]` on the table `PortfolioSnapshot` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "PortfolioSnapshot_portfolioId_recordedAt_key" ON "PortfolioSnapshot"("portfolioId", "recordedAt");
