-- CreateTable
CREATE TABLE "PortfolioSnapshot" (
    "id" TEXT NOT NULL,
    "portfolioId" TEXT NOT NULL,
    "totalValue" DECIMAL(18,2) NOT NULL,
    "cashBalance" DECIMAL(18,2) NOT NULL,
    "positionsValue" DECIMAL(18,2) NOT NULL,
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PortfolioSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PortfolioSnapshot_portfolioId_idx" ON "PortfolioSnapshot"("portfolioId");

-- CreateIndex
CREATE INDEX "PortfolioSnapshot_recordedAt_idx" ON "PortfolioSnapshot"("recordedAt");

-- AddForeignKey
ALTER TABLE "PortfolioSnapshot" ADD CONSTRAINT "PortfolioSnapshot_portfolioId_fkey" FOREIGN KEY ("portfolioId") REFERENCES "Portfolio"("id") ON DELETE CASCADE ON UPDATE CASCADE;
