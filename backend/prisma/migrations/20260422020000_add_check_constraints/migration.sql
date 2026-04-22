-- Add CHECK constraints for financial data integrity
ALTER TABLE "Portfolio" ADD CONSTRAINT "portfolio_cash_balance_non_negative" CHECK ("cashBalance" >= 0);
ALTER TABLE "Position" ADD CONSTRAINT "position_quantity_non_negative" CHECK ("quantity" >= 0);
ALTER TABLE "Position" ADD CONSTRAINT "position_avg_cost_positive" CHECK ("avgCost" > 0);
ALTER TABLE "Transaction" ADD CONSTRAINT "transaction_quantity_positive" CHECK ("quantity" > 0);
ALTER TABLE "Transaction" ADD CONSTRAINT "transaction_price_positive" CHECK ("price" > 0);
