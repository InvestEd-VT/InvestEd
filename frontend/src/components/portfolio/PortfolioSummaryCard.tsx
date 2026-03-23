// React import not required with the automatic JSX runtime
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'

export interface PortfolioSummaryProps {
  totalValue?: number
  cashBalance?: number
  currency?: string
}

export function PortfolioSummaryCard({
  totalValue = 12500.5,
  cashBalance = 2500.25,
  currency = 'USD',
}: PortfolioSummaryProps) {
  return (
    <Card className="@container/card">
      <CardHeader>
        <CardDescription>Portfolio</CardDescription>
        <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
          {formatCurrency(totalValue, currency)}
        </CardTitle>
      </CardHeader>
      <CardFooter className="flex-col items-start gap-1.5 text-sm">
        <div className="flex w-full items-center justify-between">
          <div className="text-sm text-muted-foreground">Cash balance</div>
          <div className="font-medium tabular-nums">{formatCurrency(cashBalance, currency)}</div>
        </div>
        <div className="text-muted-foreground">Total value includes holdings and cash</div>
      </CardFooter>
    </Card>
  )
}

export default PortfolioSummaryCard
