import { useEffect } from 'react';
import {
  BookOpenIcon,
  TrendingUpIcon,
  ShieldCheckIcon,
  BarChart3Icon,
  GraduationCapIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import FirstTradePrompt from '@/components/onboarding/FirstTradePrompt';

interface WelcomeModalProps {
  open: boolean;
  onGetStarted: () => void;
  onTour: () => void;
}

export function WelcomeModal({ open, onGetStarted, onTour }: WelcomeModalProps) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Blurred backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onGetStarted} />

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center p-4 pointer-events-none">
        <div className="pointer-events-auto w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-xl bg-background shadow-2xl border">
          {/* Header */}
          <div className="text-center px-6 pt-8 pb-4">
            <div className="inline-flex items-center justify-center size-16 rounded-full bg-primary/10 mb-4">
              <GraduationCapIcon className="size-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Welcome to InvestEd</h1>
            <p className="text-muted-foreground mt-2 text-base">
              Your risk-free environment for learning how options trading works.
            </p>
          </div>

          <div className="px-6 pb-6 space-y-4">
            {/* Disclaimer */}
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 flex items-start gap-3">
              <ShieldCheckIcon className="size-4 text-amber-600 mt-0.5 shrink-0" />
              <p className="text-sm text-amber-800 dark:text-amber-400 leading-relaxed">
                <span className="font-semibold">For educational purposes only.</span> InvestEd uses
                paper trading — no real money is ever involved. Nothing on this platform constitutes
                financial or investment advice.
              </p>
            </div>

            {/* Feature cards horizontal row */}
            <div className="grid grid-cols-3 gap-3">
              <Card className="p-4">
                <div className="flex flex-col gap-2">
                  <div className="p-2 rounded-md bg-primary/10 w-fit">
                    <TrendingUpIcon className="size-4 text-primary" />
                  </div>
                  <p className="text-sm font-semibold">Paper Trading</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Practice with $10,000 in virtual cash. No real money, no real risk.
                  </p>
                </div>
              </Card>
              <Card className="p-4">
                <div className="flex flex-col gap-2">
                  <div className="p-2 rounded-md bg-primary/10 w-fit">
                    <BookOpenIcon className="size-4 text-primary" />
                  </div>
                  <p className="text-sm font-semibold">Guided Learning</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Structured modules covering options basics, Greeks, and strategies.
                  </p>
                </div>
              </Card>
              <Card className="p-4">
                <div className="flex flex-col gap-2">
                  <div className="p-2 rounded-md bg-primary/10 w-fit">
                    <BarChart3Icon className="size-4 text-primary" />
                  </div>
                  <p className="text-sm font-semibold">Track Performance</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Monitor P&L and transaction history as you practice.
                  </p>
                </div>
              </Card>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              {/* Left — getting started */}
              <div className="flex-1 rounded-lg border bg-card p-4 space-y-3">
                <p className="text-sm font-semibold">Here is what you can do on InvestEd:</p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">→</span>
                    <span>
                      Search for a stock and open the options chain to place your first paper trade.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">→</span>
                    <span>
                      Visit <strong className="text-foreground">Portfolio</strong> to track
                      positions, cash balance, and performance.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">→</span>
                    <span>
                      Head to <strong className="text-foreground">Learn</strong> to work through
                      modules on options fundamentals and strategy.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">→</span>
                    <span>
                      Check <strong className="text-foreground">Transactions</strong> to review your
                      full trade history.
                    </span>
                  </li>
                </ul>
                <div className="pt-1">
                  <FirstTradePrompt />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 justify-end pt-2">
              <Button variant="outline" onClick={onTour}>
                Take a quick tour
              </Button>
              <Button onClick={onGetStarted}>Get started</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
