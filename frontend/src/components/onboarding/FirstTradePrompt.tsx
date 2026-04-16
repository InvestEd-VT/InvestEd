import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export default function FirstTradePrompt() {
  const navigate = useNavigate();

  const handleTrySample = () => {
    // Open the AAPL stock page and request the page to auto-open the trade sheet
    navigate('/stock/AAPL', { state: { openTrade: true, tradeMode: 'buy' } });
  };

  return (
    <div className="max-w-2xl mx-auto py-6 px-4">
      <Card>
        <CardHeader>
          <CardTitle>Try your first trade</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Make a simple practice trade to see how orders, costs, and the payoff chart work. We'll
            prefill a sample option so you can try placing an order without real money.
          </p>
        </CardContent>
        <CardFooter className="flex justify-end gap-3">
          <Button variant="ghost" onClick={() => navigate('/learn')}>
            Learn first
          </Button>
          <Button onClick={handleTrySample}>Try a sample trade</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
