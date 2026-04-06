import { useState } from 'react';
import { useParams } from 'react-router-dom';
import ModuleNavigation from '@/components/education/ModuleNavigation';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  BookOpen,
  TrendingUp,
  TrendingDown,
  Shield,
  Info,
  AlertTriangle,
  ExternalLink,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// ── Key term callout ──────────────────────────────────────────────────────────
function Term({ word, definition }: { word: string; definition: string }) {
  return (
    <div className="rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 my-3">
      <span className="font-semibold text-primary text-sm">{word}</span>
      <p className="text-sm text-muted-foreground mt-0.5">{definition}</p>
    </div>
  );
}

// ── Section wrapper ───────────────────────────────────────────────────────────
function Section({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-10">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-1.5 rounded-md bg-primary/10 text-primary">{icon}</div>
        <h2 className="text-lg font-semibold">{title}</h2>
      </div>
      {children}
    </section>
  );
}

// ── Scope callout ─────────────────────────────────────────────────────────────
function ScopeCallout() {
  return (
    <div className="rounded-lg border border-blue-500/20 bg-blue-500/5 px-4 py-3 mb-8 flex items-start gap-3">
      <Info className="size-4 text-blue-500 mt-0.5 shrink-0" />
      <div>
        <p className="text-sm font-semibold text-blue-500">What This Module Covers</p>
        <p className="text-sm text-muted-foreground mt-0.5">
          This module takes a deeper look at the two types of options contracts — calls and puts —
          covering both buying and selling each type. It also introduces what it means for an option
          to be in the money, at the money, or out of the money. Strategic use of these concepts
          will be explored in later modules.
        </p>
      </div>
    </div>
  );
}

// ── Disclaimer ────────────────────────────────────────────────────────────────
function Disclaimer() {
  return (
    <div className="rounded-lg border border-yellow-500/20 bg-yellow-500/5 px-3 py-2 my-3 flex items-start gap-2">
      <AlertTriangle className="size-3.5 text-yellow-500 mt-0.5 shrink-0" />
      <p className="text-xs text-muted-foreground">
        The following example uses AAPL for illustrative purposes only. It is not investment advice
        and does not reflect actual market conditions.
      </p>
    </div>
  );
}

// ── Call vs Put comparison ────────────────────────────────────────────────────
function CallPutComparison() {
  const rows = [
    { feature: 'Right to', call: 'Buy 100 shares', put: 'Sell 100 shares' },
    {
      feature: 'Buyer profits when',
      call: 'Stock rises above strike',
      put: 'Stock falls below strike',
    },
    {
      feature: 'Seller profits when',
      call: 'Stock stays below strike',
      put: 'Stock stays above strike',
    },
    { feature: 'Buyer max loss', call: 'Premium paid', put: 'Premium paid' },
    { feature: 'Seller max gain', call: 'Premium received', put: 'Premium received' },
    { feature: 'Bullish or Bearish', call: 'Bullish', put: 'Bearish' },
  ];

  return (
    <div className="rounded-xl border overflow-hidden my-4">
      <div className="grid grid-cols-3 bg-muted text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        <div className="px-4 py-2">Feature</div>
        <div className="px-4 py-2 border-l">Call</div>
        <div className="px-4 py-2 border-l">Put</div>
      </div>
      {rows.map((row, i) => (
        <div
          key={i}
          className={`grid grid-cols-3 text-sm ${i % 2 === 0 ? 'bg-card' : 'bg-muted/30'}`}
        >
          <div className="px-4 py-3 font-medium">{row.feature}</div>
          <div className="px-4 py-3 border-l text-muted-foreground">{row.call}</div>
          <div className="px-4 py-3 border-l text-muted-foreground">{row.put}</div>
        </div>
      ))}
    </div>
  );
}

// ── ITM/ATM/OTM price line diagram ────────────────────────────────────────────
function MoneynessDiagram({ type }: { type: 'call' | 'put' }) {
  const isCall = type === 'call';

  return (
    <div className="rounded-xl border bg-card p-5 my-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">
        {isCall ? 'Call Option' : 'Put Option'} — Strike Price: $150
      </p>

      <div className="relative mb-6">
        <div className="flex h-8 rounded-lg overflow-hidden">
          <div
            className={`flex-1 flex items-center justify-center text-xs font-semibold ${
              isCall ? 'bg-destructive/15 text-destructive' : 'bg-emerald-500/15 text-emerald-600'
            }`}
          >
            {isCall ? 'OTM' : 'ITM'}
          </div>
          <div className="w-px bg-border" />
          <div className="flex items-center justify-center px-3 text-xs font-semibold bg-muted text-muted-foreground">
            ATM
          </div>
          <div className="w-px bg-border" />
          <div
            className={`flex-1 flex items-center justify-center text-xs font-semibold ${
              isCall ? 'bg-emerald-500/15 text-emerald-600' : 'bg-destructive/15 text-destructive'
            }`}
          >
            {isCall ? 'ITM' : 'OTM'}
          </div>
        </div>

        <div className="flex justify-between mt-2 text-xs text-muted-foreground">
          <span>Stock below $150</span>
          <span className="font-medium text-foreground">$150 strike</span>
          <span>Stock above $150</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 text-xs">
        <div className={`rounded-lg p-2.5 ${isCall ? 'bg-destructive/5' : 'bg-emerald-500/5'}`}>
          <p className="font-semibold mb-1">{isCall ? 'Out of the Money' : 'In the Money'}</p>
          <p className="text-muted-foreground">
            {isCall
              ? 'Stock price is below the strike. The call has no intrinsic value.'
              : 'Stock price is below the strike. The put has intrinsic value — you can sell shares above market price.'}
          </p>
        </div>
        <div className="rounded-lg p-2.5 bg-muted/50">
          <p className="font-semibold mb-1">At the Money</p>
          <p className="text-muted-foreground">
            Stock price equals the strike price. The option sits right at the threshold.
          </p>
        </div>
        <div className={`rounded-lg p-2.5 ${isCall ? 'bg-emerald-500/5' : 'bg-destructive/5'}`}>
          <p className="font-semibold mb-1">{isCall ? 'In the Money' : 'Out of the Money'}</p>
          <p className="text-muted-foreground">
            {isCall
              ? 'Stock price is above the strike. The call has intrinsic value — you can buy shares below market price.'
              : 'Stock price is above the strike. The put has no intrinsic value.'}
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Toggle for call/put moneyness diagram ─────────────────────────────────────
function MoneynessSection() {
  const [active, setActive] = useState<'call' | 'put'>('call');

  return (
    <div>
      <div className="flex gap-2 mb-2">
        <button
          onClick={() => setActive('call')}
          className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
            active === 'call'
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground hover:text-foreground'
          }`}
        >
          Call Option
        </button>
        <button
          onClick={() => setActive('put')}
          className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
            active === 'put'
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground hover:text-foreground'
          }`}
        >
          Put Option
        </button>
      </div>
      <MoneynessDiagram type={active} />
    </div>
  );
}

// ── Next module callout ───────────────────────────────────────────────────────
function NextModuleCallout() {
  return (
    <div className="rounded-lg border border-primary/20 bg-primary/5 px-4 py-4 mb-8 flex items-start gap-3">
      <ArrowRight className="size-4 text-primary mt-0.5 shrink-0" />
      <div>
        <p className="text-sm font-semibold text-primary">Up Next: The Greeks Overview</p>
        <p className="text-sm text-muted-foreground mt-0.5">
          In the next module we'll introduce the Greeks — Delta, Gamma, Theta, and Vega — a set of
          measures that help traders understand how an option's price is likely to behave, and why
          they matter when selecting contracts.
        </p>
      </div>
    </div>
  );
}

// ── Attribution footer ────────────────────────────────────────────────────────
function Attribution() {
  return (
    <div className="rounded-lg border border-border bg-muted/30 px-4 py-3 mt-10 flex items-start gap-3">
      <ExternalLink className="size-4 text-muted-foreground mt-0.5 shrink-0" />
      <p className="text-xs text-muted-foreground leading-relaxed">
        Content adapted from{' '}
        <a
          href="https://www.optionseducation.org/optionsoverview/what-is-an-option"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-foreground transition-colors"
        >
          What is an Option?
        </a>
        ,{' '}
        <a
          href="https://www.optionseducation.org/optionsoverview/options-basics"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-foreground transition-colors"
        >
          Options Basics
        </a>
        ,{' '}
        <a
          href="https://www.optionseducation.org/optionsoverview/leverage-risk"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-foreground transition-colors"
        >
          Leverage &amp; Risk
        </a>
        , and{' '}
        <a
          href="https://www.optionseducation.org/optionsoverview/what-are-the-benefits-risks"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-foreground transition-colors"
        >
          What are the Benefits &amp; Risks?
        </a>{' '}
        by{' '}
        <a
          href="https://www.optionseducation.org"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-foreground transition-colors"
        >
          The Options Industry Council (OIC)
        </a>
        . Used for educational purposes.
      </p>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function CallsAndPuts() {
  const navigate = useNavigate();
  const { id: moduleId } = useParams<{ id: string }>();

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-6 py-8">
        {/* Back nav */}
        <button
          onClick={() => navigate('/learn')}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="size-4" />
          Back to Learn
        </button>

        {/* Title */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-1">
            <BookOpen className="size-5 text-primary" />
            <span className="text-xs text-muted-foreground font-mono uppercase tracking-wider">
              Module 03
            </span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Calls &amp; Puts</h1>
          <p className="text-muted-foreground mt-2">
            Explore call and put options in depth — how they work, when to use each, and key
            concepts like in the money and out of the money.
          </p>
        </div>

        {/* Scope callout */}
        <ScopeCallout />

        {/* Call Options */}
        <Section icon={<TrendingUp className="size-4" />} title="Call Options">
          <p className="text-sm text-muted-foreground leading-relaxed">
            A <strong className="text-foreground">call option</strong> gives the holder the right to{' '}
            <strong className="text-foreground">buy</strong> 100 shares of the underlying stock at
            the strike price, at any time before expiration. Call options are generally used when
            you expect the stock price to <strong className="text-foreground">rise</strong>.
          </p>

          <div className="rounded-lg border bg-card p-4 mt-4 mb-3">
            <p className="text-sm font-semibold mb-2">Buying a Call</p>
            <p className="text-sm text-muted-foreground">
              When you buy a call you pay the premium and gain the right to buy shares at the strike
              price. If the stock rises above the strike price before expiration, you can buy shares
              below the current market price — that difference is where profit comes from. If the
              stock never rises above the strike price, the option expires worthless and your only
              loss is the premium paid.
            </p>
          </div>

          <div className="rounded-lg border bg-card p-4 mb-4">
            <p className="text-sm font-semibold mb-2">Selling a Call</p>
            <p className="text-sm text-muted-foreground">
              When you sell a call you collect the premium upfront and take on the obligation to
              sell 100 shares at the strike price if the buyer exercises. Your maximum gain is the
              premium received. If the stock rises significantly above the strike price and the
              buyer exercises, you must sell shares at the lower strike price regardless of the
              current market price — this is where seller risk comes from.
            </p>
          </div>

          <div className="rounded-lg border border-border bg-muted/20 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              Example — AAPL Call
            </p>
            <Disclaimer />
            <div className="mt-3 space-y-2 text-sm text-muted-foreground">
              <p>
                Suppose AAPL is trading at{' '}
                <strong className="text-foreground">$190 per share</strong>. You buy a call option
                with a <strong className="text-foreground">$200 strike price</strong> expiring in 30
                days, paying a premium of{' '}
                <strong className="text-foreground">$3.00 per share</strong> ($300 total for the
                contract).
              </p>
              <p className="mt-2">
                <strong className="text-foreground">If AAPL rises to $215:</strong> You can buy 100
                shares at $200 while the market price is $215 — a $15 per share advantage. Your
                profit is $15 − $3 (premium) ={' '}
                <strong className="text-foreground">$12 per share</strong> ($1,200 total).
              </p>
              <p>
                <strong className="text-foreground">If AAPL stays below $200:</strong> The option
                expires worthless. Your total loss is the{' '}
                <strong className="text-foreground">$300 premium paid</strong> — nothing more.
              </p>
            </div>
          </div>
        </Section>

        {/* Put Options */}
        <Section icon={<TrendingDown className="size-4" />} title="Put Options">
          <p className="text-sm text-muted-foreground leading-relaxed">
            A <strong className="text-foreground">put option</strong> gives the holder the right to{' '}
            <strong className="text-foreground">sell</strong> 100 shares of the underlying stock at
            the strike price, at any time before expiration. Put options are generally used when you
            expect the stock price to <strong className="text-foreground">fall</strong>.
          </p>

          <div className="rounded-lg border bg-card p-4 mt-4 mb-3">
            <p className="text-sm font-semibold mb-2">Buying a Put</p>
            <p className="text-sm text-muted-foreground">
              When you buy a put you pay the premium and gain the right to sell shares at the strike
              price. If the stock falls below the strike price before expiration, you can sell
              shares above the current market price — that difference is where profit comes from. If
              the stock never falls below the strike price, the option expires worthless and your
              only loss is the premium paid.
            </p>
          </div>

          <div className="rounded-lg border bg-card p-4 mb-4">
            <p className="text-sm font-semibold mb-2">Selling a Put</p>
            <p className="text-sm text-muted-foreground">
              When you sell a put you collect the premium upfront and take on the obligation to buy
              100 shares at the strike price if the buyer exercises. Your maximum gain is the
              premium received. If the stock falls significantly below the strike price and the
              buyer exercises, you must buy shares at the higher strike price regardless of the
              current market price — this is where seller risk comes from.
            </p>
          </div>

          <div className="rounded-lg border border-border bg-muted/20 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              Example — AAPL Put
            </p>
            <Disclaimer />
            <div className="mt-3 space-y-2 text-sm text-muted-foreground">
              <p>
                Suppose AAPL is trading at{' '}
                <strong className="text-foreground">$190 per share</strong>. You buy a put option
                with a <strong className="text-foreground">$180 strike price</strong> expiring in 30
                days, paying a premium of{' '}
                <strong className="text-foreground">$2.50 per share</strong> ($250 total for the
                contract).
              </p>
              <p className="mt-2">
                <strong className="text-foreground">If AAPL falls to $165:</strong> You can sell 100
                shares at $180 while the market price is $165 — a $15 per share advantage. Your
                profit is $15 − $2.50 (premium) ={' '}
                <strong className="text-foreground">$12.50 per share</strong> ($1,250 total).
              </p>
              <p>
                <strong className="text-foreground">If AAPL stays above $180:</strong> The option
                expires worthless. Your total loss is the{' '}
                <strong className="text-foreground">$250 premium paid</strong> — nothing more.
              </p>
            </div>
          </div>
        </Section>

        {/* Call vs Put Comparison */}
        <Section icon={<BookOpen className="size-4" />} title="Calls vs. Puts at a Glance">
          <p className="text-sm text-muted-foreground leading-relaxed mb-2">
            Here's how the two contract types compare across buying and selling:
          </p>
          <CallPutComparison />
        </Section>

        {/* When to use each */}
        <Section icon={<Shield className="size-4" />} title="When to Use Each">
          <p className="text-sm text-muted-foreground leading-relaxed mb-4">
            The simplest way to think about which contract to use:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="rounded-lg border bg-card p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="size-4 text-emerald-500" />
                <p className="text-sm font-semibold">Bullish on the stock?</p>
              </div>
              <p className="text-sm text-muted-foreground">
                Buy a <strong className="text-foreground">call</strong> — you profit if the stock
                rises above the strike price before expiration.
              </p>
            </div>
            <div className="rounded-lg border bg-card p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingDown className="size-4 text-destructive" />
                <p className="text-sm font-semibold">Bearish on the stock?</p>
              </div>
              <p className="text-sm text-muted-foreground">
                Buy a <strong className="text-foreground">put</strong> — you profit if the stock
                falls below the strike price before expiration.
              </p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed mt-4">
            Selling calls and puts involves a different motivation — typically collecting premium
            income — and carries a different risk profile. This will be explored in depth in later
            modules.
          </p>
        </Section>

        {/* ITM / ATM / OTM */}
        <Section
          icon={<TrendingUp className="size-4" />}
          title="In the Money, At the Money, Out of the Money"
        >
          <p className="text-sm text-muted-foreground leading-relaxed mb-4">
            These terms describe the relationship between the stock's current price and the option's
            strike price. They apply to both calls and puts, but the meaning flips depending on the
            contract type.
          </p>

          <MoneynessSection />

          <div className="mt-4 space-y-2">
            <Term
              word="In the Money (ITM)"
              definition="A call is ITM when the stock price is above the strike price. A put is ITM when the stock price is below the strike price. An ITM option has intrinsic value."
            />
            <Term
              word="At the Money (ATM)"
              definition="The stock price equals the strike price. Applies to both calls and puts. An ATM option has no intrinsic value but may still have time value."
            />
            <Term
              word="Out of the Money (OTM)"
              definition="A call is OTM when the stock price is below the strike price. A put is OTM when the stock price is above the strike price. An OTM option has no intrinsic value."
            />
          </div>
        </Section>

        {/* Summary */}
        <div className="rounded-xl border bg-card p-5 mb-8">
          <h3 className="font-semibold mb-3">Summary</h3>
          <ul className="space-y-1.5 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="size-4 text-primary mt-0.5 shrink-0" />A call gives the right
              to buy shares — used when you expect the stock to rise
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="size-4 text-primary mt-0.5 shrink-0" />A put gives the right
              to sell shares — used when you expect the stock to fall
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="size-4 text-primary mt-0.5 shrink-0" />
              Buying either contract limits your max loss to the premium paid
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="size-4 text-primary mt-0.5 shrink-0" />
              Selling either contract earns the premium upfront but introduces obligation and
              greater risk
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="size-4 text-primary mt-0.5 shrink-0" />
              ITM means the option has intrinsic value; OTM means it does not; ATM sits at the
              threshold
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="size-4 text-primary mt-0.5 shrink-0" />
              Key terms: call, put, in the money, at the money, out of the money
            </li>
          </ul>
        </div>

        {/* Next module callout */}
        <NextModuleCallout />

        {/* Module navigation */}
        <ModuleNavigation moduleId={moduleId ?? ''} />

        {/* Attribution */}
        <Attribution />
      </div>
    </div>
  );
}
