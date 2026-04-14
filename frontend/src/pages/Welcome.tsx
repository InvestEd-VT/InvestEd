import { useNavigate } from 'react-router-dom';
import { PageShell } from '@/components/layout/PageShell';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircleIcon } from 'lucide-react';
import PlatformTour from '@/components/tour/PlatformTour';
import { useState } from 'react';
import FirstTradePrompt from '@/components/onboarding/FirstTradePrompt';

export default function Welcome() {
  const navigate = useNavigate();
  const WELCOME_KEY = 'invested_welcome_v1';

  const handleGetStarted = () => {
    try {
      localStorage.setItem(WELCOME_KEY, '1');
    } catch {
      /* ignore */
    }
    // Best-effort: tell server the welcome was seen so it won't show again on
    // other devices. Backend may ignore this if not supported.
    try {
      // import at top would create cycle; use dynamic import to avoid issues
      import('@/services').then(({ authService }) => authService.setWelcomeSeen());
    } catch {
      /* ignore */
    }
    navigate('/dashboard');
  };

  const handleSkip = () => {
    try {
      localStorage.setItem(WELCOME_KEY, '1');
    } catch {
      /* ignore */
    }
    try {
      import('@/services').then(({ authService }) => authService.setWelcomeSeen());
    } catch {
      /* ignore */
    }
    navigate('/dashboard');
  };

  const [tourOpen, setTourOpen] = useState(false);

  const startTour = () => setTourOpen(true);

  const finishTour = () => {
    try {
      localStorage.setItem(WELCOME_KEY, '1');
    } catch {
      /* ignore */
    }
    try {
      import('@/services').then(({ authService }) => authService.setWelcomeSeen());
    } catch {
      /* ignore */
    }
    setTourOpen(false);
    navigate('/dashboard');
  };

  return (
    <PageShell>
      <div className="max-w-2xl mx-auto py-20 px-4">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <CheckCircleIcon className="size-8 text-emerald-600" />
              <CardTitle>Welcome to InvestEd</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Thanks for joining — here are a few places to get started:
            </p>

            <ul className="list-disc pl-5 space-y-2 text-sm">
              <li>
                View your portfolio to see cash and open positions — <strong>Portfolio</strong>.
              </li>
              <li>
                Learn about options and trading in the <strong>Learn</strong> section.
              </li>
              <li>
                Open a stock and try trading options using the <strong>Trade</strong> flow.
              </li>
            </ul>
          </CardContent>
          <CardFooter className="flex gap-3 justify-end">
            <Button variant="ghost" onClick={handleSkip}>
              Skip
            </Button>
            <Button variant="outline" onClick={startTour}>
              Take a quick tour
            </Button>
            <Button onClick={handleGetStarted}>Get started</Button>
          </CardFooter>
        </Card>
          <FirstTradePrompt />
        <PlatformTour open={tourOpen} onClose={() => setTourOpen(false)} onFinish={finishTour} />
      </div>
    </PageShell>
  );
}
