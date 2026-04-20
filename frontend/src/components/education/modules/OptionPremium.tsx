import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ModuleNavigation from '@/components/education/ModuleNavigation';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Info,
  ExternalLink,
  DollarSign,
  TrendingUp,
  BarChart3,
  Layers,
  Activity,
  ArrowLeftRight,
} from 'lucide-react';

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
          This module explains how an option's premium is actually quoted in the market —
          introducing the bid and ask, the spread between them, and how to read a premium in the
          options chain. It also covers what causes the bid and ask to move during the trading day.
        </p>
      </div>
    </div>
  );
}

// ── Platform note ─────────────────────────────────────────────────────────────
function PlatformNote() {
  return (
    <div className="rounded-lg border border-border bg-muted/40 px-4 py-3 mb-8 flex items-start gap-3">
      <Info className="size-4 text-muted-foreground mt-0.5 shrink-0" />
      <p className="text-sm text-muted-foreground">
        On most brokerages, options are quoted with a separate bid and ask price. InvestEd displays
        a single mid-market premium — the midpoint between the two sides — which is what you pay or
        receive when you trade on the platform.
      </p>
    </div>
  );
}

// ── Bid / ask diagram ─────────────────────────────────────────────────────────
function BidAskDiagram() {
  return (
    <div className="rounded-xl border bg-card p-5 my-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">
        How a Premium Is Quoted
      </p>
      <div className="flex items-stretch rounded-lg overflow-hidden border">
        <div className="flex-1 bg-emerald-500/10 p-4 flex flex-col items-center justify-center text-center">
          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600 mb-1">
            Bid
          </p>
          <p className="text-2xl font-bold text-foreground">$2.85</p>
          <p className="text-xs text-muted-foreground mt-1">
            Highest price a buyer
            <br />
            is willing to pay
          </p>
        </div>
        <div className="flex items-center justify-center px-3 bg-muted/50 border-x">
          <div className="text-center">
            <ArrowLeftRight className="size-4 text-muted-foreground mx-auto" />
            <p className="text-xs text-muted-foreground mt-1 font-medium">
              $0.25
              <br />
              spread
            </p>
          </div>
        </div>
        <div className="flex-1 bg-blue-500/10 p-4 flex flex-col items-center justify-center text-center">
          <p className="text-xs font-semibold uppercase tracking-wider text-blue-500 mb-1">Ask</p>
          <p className="text-2xl font-bold text-foreground">$3.10</p>
          <p className="text-xs text-muted-foreground mt-1">
            Lowest price a seller
            <br />
            is willing to accept
          </p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 mt-3 text-xs text-muted-foreground">
        <div className="flex items-start gap-2">
          <span className="text-emerald-600 font-bold mt-0.5">→</span>
          <span>
            When you <strong className="text-foreground">buy</strong> an option, you pay near the{' '}
            <strong className="text-foreground">ask</strong>
          </span>
        </div>
        <div className="flex items-start gap-2">
          <span className="text-blue-500 font-bold mt-0.5">→</span>
          <span>
            When you <strong className="text-foreground">sell</strong> an option, you receive near
            the <strong className="text-foreground">bid</strong>
          </span>
        </div>
      </div>
    </div>
  );
}

// ── Premium composition visual ────────────────────────────────────────────────
function PremiumCompositionVisual() {
  const [mode, setMode] = useState<'otm' | 'itm'>('otm');

  const otm = { bid: 2.85, ask: 3.1, intrinsic: 0, time: 3.1, stock: 195 };
  const itm = { bid: 5.6, ask: 5.85, intrinsic: 5.0, time: 0.85, stock: 205 };
  const d = mode === 'otm' ? otm : itm;
  const intrinsicPct = (d.intrinsic / d.ask) * 100;
  const timePct = (d.time / d.ask) * 100;

  return (
    <div className="rounded-xl border bg-card p-5 my-4">
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          $200 Strike Call — Premium Composition
        </p>
        <div className="flex gap-1.5">
          {(['otm', 'itm'] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                mode === m
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              Stock at ${m === 'otm' ? '195' : '205'}
            </button>
          ))}
        </div>
      </div>

      <div className="flex rounded-lg overflow-hidden h-10 mb-3">
        {d.intrinsic > 0 && (
          <div
            style={{ width: `${intrinsicPct}%` }}
            className="bg-emerald-500/20 flex items-center justify-center text-xs font-semibold text-emerald-600 transition-all duration-500"
          >
            {intrinsicPct >= 15 ? `Intrinsic $${d.intrinsic.toFixed(2)}` : ''}
          </div>
        )}
        <div
          style={{ width: `${timePct}%` }}
          className="bg-primary/20 flex items-center justify-center text-xs font-semibold text-primary transition-all duration-500"
        >
          {timePct >= 15 ? `Time Value $${d.time.toFixed(2)}` : ''}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 text-center text-sm mb-2">
        <div className="rounded-lg bg-emerald-500/10 p-3">
          <p className="text-xs text-muted-foreground mb-1">Bid</p>
          <p className="font-semibold text-emerald-600">${d.bid.toFixed(2)}</p>
        </div>
        <div className="rounded-lg bg-blue-500/10 p-3">
          <p className="text-xs text-muted-foreground mb-1">Ask</p>
          <p className="font-semibold text-blue-500">${d.ask.toFixed(2)}</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 text-center text-sm mb-3">
        <div className="rounded-lg bg-emerald-500/5 p-3">
          <p className="text-xs text-muted-foreground mb-1">Intrinsic Value</p>
          <p className="font-semibold text-emerald-600">${d.intrinsic.toFixed(2)}</p>
        </div>
        <div className="rounded-lg bg-primary/5 p-3">
          <p className="text-xs text-muted-foreground mb-1">Time Value</p>
          <p className="font-semibold text-primary">${d.time.toFixed(2)}</p>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        {mode === 'otm'
          ? 'Stock is $5 below the $200 strike — the option is out of the money and has no intrinsic value. The entire premium is time value. The spread between bid and ask stays roughly constant.'
          : 'Stock is $5 above the $200 strike — the option is in the money. Both the bid and ask have shifted up to reflect $5.00 of intrinsic value, with $0.85 of time value remaining. The spread stays roughly constant.'}
      </p>
    </div>
  );
}

// ── Chain row example ─────────────────────────────────────────────────────────
function ChainRowExample() {
  return (
    <div className="rounded-xl border bg-card overflow-hidden my-4">
      <div className="px-4 py-2.5 bg-muted text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Sample Options Chain Row — AAPL $200 Call, 7 DTE
      </div>
      <div className="overflow-x-auto">
        <div className="min-w-[480px]">
          <div className="grid grid-cols-6 text-xs font-semibold uppercase tracking-wider text-muted-foreground border-b">
            <div className="px-4 py-2">Strike</div>
            <div className="px-4 py-2 border-l bg-emerald-500/5 text-emerald-600">Bid</div>
            <div className="px-4 py-2 border-l bg-blue-500/5 text-blue-500">Ask</div>
            <div className="px-4 py-2 border-l">Last</div>
            <div className="px-4 py-2 border-l">Intrinsic</div>
            <div className="px-4 py-2 border-l">Time Val</div>
          </div>
          <div className="grid grid-cols-6 text-sm">
            <div className="px-4 py-3 font-semibold">$200</div>
            <div className="px-4 py-3 border-l bg-emerald-500/5 font-medium text-emerald-600">
              $2.85
            </div>
            <div className="px-4 py-3 border-l bg-blue-500/5 font-medium text-blue-500">$3.10</div>
            <div className="px-4 py-3 border-l text-muted-foreground">$2.95</div>
            <div className="px-4 py-3 border-l text-muted-foreground">$0.00</div>
            <div className="px-4 py-3 border-l text-muted-foreground">$3.10</div>
          </div>
        </div>
      </div>
      <div className="px-4 py-3 border-t bg-muted/20 space-y-1.5 text-xs text-muted-foreground">
        <p>
          <strong className="text-foreground">Buying this contract</strong> — you pay the ask: $3.10
          per share × 100 = <strong className="text-foreground">$310 total cost</strong>
        </p>
        <p>
          <strong className="text-foreground">Selling this contract</strong> — you receive the bid:
          $2.85 per share × 100 = <strong className="text-foreground">$285 total received</strong>
        </p>
        <p>
          <strong className="text-foreground">Last</strong> — the most recent transaction price. It
          may differ from the current bid/ask if time has passed since the last trade.
        </p>
      </div>
    </div>
  );
}

// ── Next module callout ───────────────────────────────────────────────────────
function NextModuleCallout() {
  return (
    <div className="rounded-lg border border-primary/20 bg-primary/5 px-4 py-4 mb-8 flex items-start gap-3">
      <ArrowRight className="size-4 text-primary mt-0.5 shrink-0" />
      <div>
        <p className="text-sm font-semibold text-primary">
          Up Next: In the Money, At the Money, Out of the Money
        </p>
        <p className="text-sm text-muted-foreground mt-0.5">
          The next module takes a deeper look at moneyness — how the relationship between stock
          price and strike price determines whether an option has intrinsic value, and what that
          means for the premium you see in the chain.
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
          href="https://www.optionseducation.org/optionsoverview/options-pricing"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-foreground transition-colors"
        >
          Options Pricing
        </a>{' '}
        and{' '}
        <a
          href="https://www.optionseducation.org/optionsoverview/options-basics"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-foreground transition-colors"
        >
          Options Basics
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
export default function OptionPremium() {
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
              Module 06
            </span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Option Premium Explained</h1>
          <p className="text-muted-foreground mt-2">
            How an option's premium is quoted in the market, what bid and ask mean, and what causes
            the price you see to change.
          </p>
        </div>

        {/* Scope callout */}
        <ScopeCallout />

        {/* Platform note */}
        <PlatformNote />

        {/* ── Bid and Ask ──────────────────────────────────────────────────── */}
        <Section icon={<DollarSign className="size-4" />} title="Bid and Ask">
          <p className="text-sm text-muted-foreground leading-relaxed">
            When you look at an option in the chain, the premium isn't displayed as a single price —
            it's quoted as two numbers: a <strong className="text-foreground">bid</strong> and an{' '}
            <strong className="text-foreground">ask</strong>. Options trade in a continuous auction
            market where buyers and sellers set prices, and the bid and ask represent where the two
            sides currently stand.
          </p>

          <BidAskDiagram />

          <Term
            word="Bid"
            definition="The highest price a buyer is currently willing to pay for the contract. When you sell an option to open or close a position, your order fills near the bid."
          />
          <Term
            word="Ask"
            definition="The lowest price a seller is currently willing to accept for the contract. When you buy an option to open or close a position, your order fills near the ask."
          />

          <p className="text-sm text-muted-foreground leading-relaxed mt-3">
            The bid and ask update continuously throughout the trading day. As the underlying stock
            price moves, time passes, and implied volatility shifts, both sides of the quote adjust
            to reflect the current market. The premium you see at 10:00 AM may look meaningfully
            different by 2:00 PM even if you haven't touched the position.
          </p>
        </Section>

        {/* ── The Bid-Ask Spread ───────────────────────────────────────────── */}
        <Section icon={<ArrowLeftRight className="size-4" />} title="The Bid-Ask Spread">
          <p className="text-sm text-muted-foreground leading-relaxed">
            The gap between the bid and the ask is called the{' '}
            <strong className="text-foreground">spread</strong>. It represents the distance between
            what buyers are willing to pay and what sellers are willing to accept at any given
            moment.
          </p>

          <Term
            word="Bid-Ask Spread"
            definition="The difference between the bid price and the ask price for a contract. A tighter spread indicates a more actively traded, liquid contract. A wider spread indicates thinner liquidity and a higher implied cost to enter or exit a position."
          />

          <p className="text-sm text-muted-foreground leading-relaxed mt-2">
            The spread matters because it represents an immediate cost of trading. If you buy at the
            ask and immediately sell at the bid — with nothing else changing — you realize a loss
            equal to the spread. For a contract quoted $2.85 bid / $3.10 ask, that's $0.25 per
            share, or $25 per contract.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
            <div className="rounded-lg border bg-card p-4">
              <p className="text-sm font-semibold mb-1">Tight Spread</p>
              <p className="text-xs text-muted-foreground mb-2">
                e.g. $2.85 bid / $2.90 ask → $0.05 spread
              </p>
              <p className="text-sm text-muted-foreground">
                Common on heavily traded contracts — near-the-money strikes on high-volume
                underlyings like SPY or QQQ. Easier and cheaper to enter and exit positions.
              </p>
            </div>
            <div className="rounded-lg border bg-card p-4">
              <p className="text-sm font-semibold mb-1">Wide Spread</p>
              <p className="text-xs text-muted-foreground mb-2">
                e.g. $1.50 bid / $2.10 ask → $0.60 spread
              </p>
              <p className="text-sm text-muted-foreground">
                Common on less liquid contracts — deep OTM strikes, very short-dated options with
                little open interest, or lower-volume underlyings. Each trade costs more to enter
                and exit.
              </p>
            </div>
          </div>
        </Section>

        {/* ── Reading a Premium Quote ──────────────────────────────────────── */}
        <Section icon={<BarChart3 className="size-4" />} title="Reading a Premium Quote">
          <p className="text-sm text-muted-foreground leading-relaxed">
            An options chain row gives you everything you need to evaluate a contract before placing
            a trade. The bid and ask sit alongside the last traded price, and the intrinsic and time
            value breakdown covered in the previous module.
          </p>

          <ChainRowExample />

          <p className="text-sm text-muted-foreground leading-relaxed">
            Because premiums are quoted per share, always multiply by 100 for the actual dollar
            amount. The ask is your entry cost as a buyer. The bid is what you'd receive as a
            seller. The last price tells you where the most recent transaction happened, but it may
            be stale — always check the live bid and ask before deciding.
          </p>

          <p className="text-sm text-muted-foreground leading-relaxed mt-4 mb-2">
            The ask price you pay is made up of intrinsic value and time value. Toggling the stock
            price below shows how the composition of that premium shifts when the stock moves
            relative to the strike.
          </p>

          <PremiumCompositionVisual />
        </Section>

        {/* ── What Moves the Bid and Ask ───────────────────────────────────── */}
        <Section icon={<Activity className="size-4" />} title="What Moves the Bid and Ask">
          <p className="text-sm text-muted-foreground leading-relaxed">
            The bid and ask you see in the chain are a live reflection of the pricing inputs
            introduced in the Greeks Overview — constantly updating as market conditions change.
          </p>

          <div className="space-y-2 mt-4">
            <div className="rounded-lg border bg-card p-3 flex items-start gap-3">
              <TrendingUp className="size-4 text-primary mt-0.5 shrink-0" />
              <p className="text-sm text-muted-foreground">
                <strong className="text-foreground">Stock price moves</strong> — directly changes
                the intrinsic value of in-the-money options and shifts the bid and ask immediately.
                A call's bid and ask rise when the stock rises; a put's bid and ask rise when the
                stock falls.
              </p>
            </div>
            <div className="rounded-lg border bg-card p-3 flex items-start gap-3">
              <Layers className="size-4 text-primary mt-0.5 shrink-0" />
              <p className="text-sm text-muted-foreground">
                <strong className="text-foreground">Time passes</strong> — erodes the time value
                component of the premium each day, even if the stock doesn't move. The bid and ask
                drift lower from time decay alone. This is the effect measured by Theta.
              </p>
            </div>
            <div className="rounded-lg border bg-card p-3 flex items-start gap-3">
              <Activity className="size-4 text-primary mt-0.5 shrink-0" />
              <p className="text-sm text-muted-foreground">
                <strong className="text-foreground">Implied volatility changes</strong> — when the
                market expects larger price swings, premiums expand across the chain. When
                expectations calm, premiums contract. This is the effect measured by Vega.
              </p>
            </div>
          </div>

          <p className="text-sm text-muted-foreground leading-relaxed mt-4">
            These forces often work simultaneously and in opposite directions — a call might gain
            intrinsic value from a stock move while losing time value overnight. The bid and ask at
            any moment reflect all of them combined.
          </p>
        </Section>

        {/* Summary */}
        <div className="rounded-xl border bg-card p-5 mb-8">
          <h3 className="font-semibold mb-3">Summary</h3>
          <ul className="space-y-1.5 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="size-4 text-primary mt-0.5 shrink-0" />
              An option's premium is quoted as two prices — the bid (buyer's side) and the ask
              (seller's side)
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="size-4 text-primary mt-0.5 shrink-0" />
              Buyers pay near the ask to open or close a position; sellers receive near the bid
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="size-4 text-primary mt-0.5 shrink-0" />
              The spread is the gap between bid and ask — a cost to transact and a signal of
              liquidity
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="size-4 text-primary mt-0.5 shrink-0" />
              Premiums are quoted per share — multiply by 100 for the total contract cost
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="size-4 text-primary mt-0.5 shrink-0" />
              The last traded price may be stale — always check the live bid and ask before trading
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="size-4 text-primary mt-0.5 shrink-0" />
              The bid and ask reflect stock price movement, time decay (Theta), and implied
              volatility (Vega) — all updating continuously
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
