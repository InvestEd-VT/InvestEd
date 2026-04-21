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
  TrendingUp,
  BarChart3,
  Layers,
  Activity,
  Zap,
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
          The three moneyness states — in the money, at the money, and out of the money — were
          introduced in Calls &amp; Puts. This module goes deeper: how moneyness determines premium
          cost, how it connects to Delta, the leverage tradeoff involved in choosing a strike, and
          how moneyness is shown in the options chain.
        </p>
      </div>
    </div>
  );
}

// ── Spectrum data ─────────────────────────────────────────────────────────────
type StrikeRow = {
  value: number;
  label: string;
  state: string;
  premium: number;
  intrinsic: number;
  time: number;
  delta: number;
  stateText: string;
  stateBg: string;
};

const CALL_STRIKES: StrikeRow[] = [
  {
    value: 185,
    label: 'Deep ITM',
    state: 'Deep In the Money',
    premium: 17.5,
    intrinsic: 15.0,
    time: 2.5,
    delta: 0.9,
    stateText: 'text-emerald-600',
    stateBg: 'bg-emerald-500/10',
  },
  {
    value: 195,
    label: 'ITM',
    state: 'In the Money',
    premium: 8.2,
    intrinsic: 5.0,
    time: 3.2,
    delta: 0.68,
    stateText: 'text-emerald-600',
    stateBg: 'bg-emerald-500/10',
  },
  {
    value: 200,
    label: 'ATM',
    state: 'At the Money',
    premium: 4.8,
    intrinsic: 0.0,
    time: 4.8,
    delta: 0.5,
    stateText: 'text-blue-500',
    stateBg: 'bg-blue-500/10',
  },
  {
    value: 205,
    label: 'OTM',
    state: 'Out of the Money',
    premium: 2.5,
    intrinsic: 0.0,
    time: 2.5,
    delta: 0.35,
    stateText: 'text-destructive',
    stateBg: 'bg-destructive/10',
  },
  {
    value: 215,
    label: 'Deep OTM',
    state: 'Deep Out of the Money',
    premium: 0.65,
    intrinsic: 0.0,
    time: 0.65,
    delta: 0.12,
    stateText: 'text-destructive',
    stateBg: 'bg-destructive/10',
  },
];

const PUT_STRIKES: StrikeRow[] = [
  {
    value: 185,
    label: 'Deep OTM',
    state: 'Deep Out of the Money',
    premium: 0.65,
    intrinsic: 0.0,
    time: 0.65,
    delta: -0.12,
    stateText: 'text-destructive',
    stateBg: 'bg-destructive/10',
  },
  {
    value: 195,
    label: 'OTM',
    state: 'Out of the Money',
    premium: 2.5,
    intrinsic: 0.0,
    time: 2.5,
    delta: -0.35,
    stateText: 'text-destructive',
    stateBg: 'bg-destructive/10',
  },
  {
    value: 200,
    label: 'ATM',
    state: 'At the Money',
    premium: 4.8,
    intrinsic: 0.0,
    time: 4.8,
    delta: -0.5,
    stateText: 'text-blue-500',
    stateBg: 'bg-blue-500/10',
  },
  {
    value: 205,
    label: 'ITM',
    state: 'In the Money',
    premium: 8.2,
    intrinsic: 5.0,
    time: 3.2,
    delta: -0.68,
    stateText: 'text-emerald-600',
    stateBg: 'bg-emerald-500/10',
  },
  {
    value: 215,
    label: 'Deep ITM',
    state: 'Deep In the Money',
    premium: 17.5,
    intrinsic: 15.0,
    time: 2.5,
    delta: -0.9,
    stateText: 'text-emerald-600',
    stateBg: 'bg-emerald-500/10',
  },
];

// ── Interactive moneyness spectrum ────────────────────────────────────────────
function MoneynessSpectrum() {
  const [type, setType] = useState<'call' | 'put'>('call');
  const [idx, setIdx] = useState(2);
  const strikes = type === 'call' ? CALL_STRIKES : PUT_STRIKES;
  const s = strikes[idx];
  const intrinsicPct = s.premium > 0 ? (s.intrinsic / s.premium) * 100 : 0;
  const timePct = s.premium > 0 ? (s.time / s.premium) * 100 : 0;

  return (
    <div className="rounded-xl border bg-card p-5 my-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
        AAPL Options — Stock at $200
      </p>

      {/* Call / Put toggle */}
      <div className="flex gap-2 mb-4">
        {(['call', 'put'] as const).map((t) => (
          <button
            key={t}
            onClick={() => {
              setType(t);
              setIdx(2);
            }}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
              type === t
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:text-foreground'
            }`}
          >
            {t === 'call' ? 'Call Option' : 'Put Option'}
          </button>
        ))}
      </div>

      {/* Strike buttons */}
      <div className="flex gap-2 flex-wrap mb-5">
        {strikes.map((str, i) => (
          <button
            key={str.value}
            onClick={() => setIdx(i)}
            className={`flex-1 min-w-0 px-2 py-2 rounded-lg text-xs font-semibold transition-colors text-center ${
              idx === i
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:text-foreground'
            }`}
          >
            <div className="opacity-70 mb-0.5">${str.value}</div>
            <div>{str.label}</div>
          </button>
        ))}
      </div>

      {/* State badge */}
      <div
        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold mb-4 ${s.stateBg} ${s.stateText}`}
      >
        {s.state}
      </div>

      {/* Composition bar */}
      <div className="flex rounded-lg overflow-hidden h-8 mb-3">
        {s.intrinsic > 0 && (
          <div
            style={{ width: `${intrinsicPct}%` }}
            className="bg-emerald-500/20 flex items-center justify-center text-xs font-semibold text-emerald-600 transition-all duration-500"
          >
            {intrinsicPct >= 10 ? `Intrinsic $${s.intrinsic.toFixed(2)}` : ''}
          </div>
        )}
        <div
          style={{ width: `${timePct}%` }}
          className="bg-primary/20 flex items-center justify-center text-xs font-semibold text-primary transition-all duration-500"
        >
          {timePct >= 10 ? `Time Value $${s.time.toFixed(2)}` : ''}
        </div>
      </div>

      {/* Data grid */}
      <div className="grid grid-cols-4 gap-2 text-center text-sm">
        <div className="rounded-lg bg-muted/40 p-2.5">
          <p className="text-xs text-muted-foreground mb-1">Premium</p>
          <p className="font-semibold">${s.premium.toFixed(2)}</p>
        </div>
        <div className="rounded-lg bg-emerald-500/5 p-2.5">
          <p className="text-xs text-muted-foreground mb-1">Intrinsic</p>
          <p className="font-semibold text-emerald-600">${s.intrinsic.toFixed(2)}</p>
        </div>
        <div className="rounded-lg bg-primary/5 p-2.5">
          <p className="text-xs text-muted-foreground mb-1">Time Val</p>
          <p className="font-semibold text-primary">${s.time.toFixed(2)}</p>
        </div>
        <div className="rounded-lg bg-muted/40 p-2.5">
          <p className="text-xs text-muted-foreground mb-1">Delta</p>
          <p className="font-semibold">
            {s.delta > 0 ? '+' : ''}
            {s.delta.toFixed(2)}
          </p>
        </div>
      </div>

      <p className="text-xs text-muted-foreground mt-3">
        Hypothetical values only. All contracts assume the same expiration date with the underlying
        stock at $200. Note how moneyness flips between calls and puts at the same strike.
      </p>
    </div>
  );
}

// ── Delta by moneyness rows ───────────────────────────────────────────────────
const DELTA_ROWS = [
  {
    state: 'Deep ITM',
    delta: '~0.90–1.00',
    desc: 'The option moves nearly dollar-for-dollar with the stock. Behaves closest to owning shares directly.',
    bg: 'bg-emerald-500/5',
    text: 'text-emerald-600',
  },
  {
    state: 'ITM',
    delta: '~0.60–0.90',
    desc: 'High sensitivity to stock movement. A significant portion of each dollar move in the stock is captured by the option.',
    bg: 'bg-emerald-500/5',
    text: 'text-emerald-600',
  },
  {
    state: 'ATM',
    delta: '~0.50',
    desc: 'The option captures roughly half of each dollar move. The most balanced sensitivity point on the chain.',
    bg: 'bg-blue-500/5',
    text: 'text-blue-500',
  },
  {
    state: 'OTM',
    delta: '~0.20–0.50',
    desc: 'Lower sensitivity. The option gains or loses less per dollar of stock movement.',
    bg: 'bg-destructive/5',
    text: 'text-destructive',
  },
  {
    state: 'Deep OTM',
    delta: '~0.00–0.20',
    desc: 'Very little sensitivity to stock movement. The option price barely responds unless a large move occurs.',
    bg: 'bg-destructive/5',
    text: 'text-destructive',
  },
];

// ── Tradeoff comparison ───────────────────────────────────────────────────────
const TRADEOFF = [
  {
    label: 'In the Money',
    short: 'ITM',
    border: 'border-emerald-500/20',
    bg: 'bg-emerald-500/5',
    text: 'text-emerald-600',
    rows: [
      { label: 'Cost', value: 'Higher premium' },
      { label: 'Intrinsic value', value: 'Yes — built in' },
      { label: 'Time value portion', value: 'Smaller' },
      { label: 'Delta', value: '> 0.50' },
      { label: 'Leverage', value: 'Lower' },
      { label: 'Likelihood of expiring ITM', value: 'Higher' },
    ],
  },
  {
    label: 'At the Money',
    short: 'ATM',
    border: 'border-blue-500/20',
    bg: 'bg-blue-500/5',
    text: 'text-blue-500',
    rows: [
      { label: 'Cost', value: 'Moderate premium' },
      { label: 'Intrinsic value', value: 'None (at threshold)' },
      { label: 'Time value portion', value: 'Maximum' },
      { label: 'Delta', value: '≈ 0.50' },
      { label: 'Leverage', value: 'Moderate' },
      { label: 'Likelihood of expiring ITM', value: 'Roughly even' },
    ],
  },
  {
    label: 'Out of the Money',
    short: 'OTM',
    border: 'border-destructive/20',
    bg: 'bg-destructive/5',
    text: 'text-destructive',
    rows: [
      { label: 'Cost', value: 'Lower premium' },
      { label: 'Intrinsic value', value: 'None' },
      { label: 'Time value portion', value: 'All of the premium' },
      { label: 'Delta', value: '< 0.50' },
      { label: 'Leverage', value: 'Higher' },
      { label: 'Likelihood of expiring ITM', value: 'Lower' },
    ],
  },
];

function TradeoffComparison() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-4">
      {TRADEOFF.map((col) => (
        <div key={col.short} className={`rounded-lg border ${col.border} ${col.bg} p-4`}>
          <p className={`text-xs font-semibold uppercase tracking-wider ${col.text} mb-3`}>
            {col.label}
          </p>
          <div className="space-y-2.5">
            {col.rows.map((row) => (
              <div key={row.label}>
                <p className="text-xs text-muted-foreground">{row.label}</p>
                <p className="text-sm font-medium text-foreground">{row.value}</p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Chain divider callout ─────────────────────────────────────────────────────
const CHAIN_ROWS = [
  {
    strike: '$198.75',
    premium: '$6.45',
    totalCost: '$645.00',
    delta: '+0.58',
    iv: '34.9%',
    dte: '8d',
    itm: true,
  },
  {
    strike: '$199.25',
    premium: '$5.97',
    totalCost: '$597.00',
    delta: '+0.56',
    iv: '34.9%',
    dte: '8d',
    itm: true,
  },
  {
    strike: '$199.75',
    premium: '$5.51',
    totalCost: '$551.00',
    delta: '+0.54',
    iv: '34.9%',
    dte: '8d',
    itm: true,
  },
  {
    strike: '$200.25',
    premium: '$5.06',
    totalCost: '$506.00',
    delta: '+0.52',
    iv: '34.9%',
    dte: '8d',
    itm: false,
  },
  {
    strike: '$200.75',
    premium: '$4.62',
    totalCost: '$462.00',
    delta: '+0.50',
    iv: '34.8%',
    dte: '8d',
    itm: false,
  },
  {
    strike: '$201.25',
    premium: '$4.19',
    totalCost: '$419.00',
    delta: '+0.48',
    iv: '34.8%',
    dte: '8d',
    itm: false,
  },
];

function ChainDividerCallout() {
  return (
    <div className="rounded-xl border bg-card overflow-hidden my-4">
      <div className="px-4 py-2.5 bg-muted text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Options Chain — AAPL Calls, 8 DTE
      </div>
      <div className="overflow-x-auto">
        <div className="min-w-[520px]">
          <div className="grid grid-cols-6 text-xs font-semibold uppercase tracking-wider text-muted-foreground border-b">
            <div className="px-4 py-2">Strike</div>
            <div className="px-4 py-2 border-l">Premium</div>
            <div className="px-4 py-2 border-l">Total Cost</div>
            <div className="px-4 py-2 border-l">Delta</div>
            <div className="px-4 py-2 border-l">IV</div>
            <div className="px-4 py-2 border-l">DTE</div>
          </div>
          {CHAIN_ROWS.map((row, i) => (
            <div key={i}>
              {i === 3 && (
                <div className="relative flex items-center px-4 py-1.5">
                  <div className="flex-1 border-t border-dashed border-blue-400" />
                  <div className="mx-2 px-2.5 py-0.5 bg-blue-500 text-white text-xs font-semibold rounded-full shrink-0">
                    → Current: $200.00
                  </div>
                  <div className="flex-1 border-t border-dashed border-blue-400" />
                </div>
              )}
              <div
                className={`grid grid-cols-6 text-sm ${i % 2 === 0 ? 'bg-card' : 'bg-muted/20'}`}
              >
                <div
                  className={`px-4 py-2.5 font-medium ${row.itm ? 'text-blue-500' : 'text-foreground'}`}
                >
                  {row.strike}
                </div>
                <div className="px-4 py-2.5 border-l text-emerald-600 font-medium">
                  {row.premium}
                </div>
                <div className="px-4 py-2.5 border-l text-muted-foreground">{row.totalCost}</div>
                <div className="px-4 py-2.5 border-l text-muted-foreground">{row.delta}</div>
                <div className="px-4 py-2.5 border-l text-muted-foreground">{row.iv}</div>
                <div className="px-4 py-2.5 border-l text-muted-foreground">{row.dte}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="px-4 py-3 border-t bg-muted/20 space-y-1.5 text-xs text-muted-foreground">
        <p>
          Strikes above the divider are <strong className="text-blue-500">in the money</strong> —
          the stock price has already passed the strike. They appear in blue.
        </p>
        <p>
          Strikes below the divider are{' '}
          <strong className="text-foreground">out of the money</strong> — the stock has not yet
          reached the strike. The divider updates in real time as the stock price moves.
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
        <p className="text-sm font-semibold text-primary">Up Next: Delta</p>
        <p className="text-sm text-muted-foreground mt-0.5">
          The next module takes a deep look at Delta — how it measures an option's sensitivity to
          stock price movement, how it changes with moneyness, and how to use it when evaluating
          contracts.
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
          href="https://www.optionseducation.org/advancedconcepts/delta"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-foreground transition-colors"
        >
          Delta
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
export default function Moneyness() {
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
              Module 07
            </span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            In the Money, At the Money, Out of the Money
          </h1>
          <p className="text-muted-foreground mt-2">
            How moneyness determines what you pay, how your option responds to stock movement, and
            the tradeoffs involved in choosing a strike.
          </p>
        </div>

        <ScopeCallout />

        {/* ── Moneyness and Premium ────────────────────────────────────────── */}
        <Section icon={<Layers className="size-4" />} title="Moneyness and Premium">
          <p className="text-sm text-muted-foreground leading-relaxed">
            You've seen these three terms — and that moneyness describes the relationship between
            the stock price and the strike price. What matters here is how that relationship
            directly determines how much you pay for a contract and what you're paying for.
          </p>

          <Term
            word="Moneyness"
            definition="A term describing the relationship between the current price of the underlying stock and an option's strike price. It determines whether an option has intrinsic value, and drives how the premium is distributed between intrinsic value and time value."
          />

          <p className="text-sm text-muted-foreground leading-relaxed mt-2">
            An ITM option carries intrinsic value — part of what you're paying for already exists.
            An OTM option has no intrinsic value — the entire premium is time value, representing
            the possibility the stock moves in your favor before expiration. ATM options sit right
            at the threshold: no intrinsic value, but maximum time value because the outcome is most
            uncertain.
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed mt-3">
            Note that moneyness flips between calls and puts at the same strike — toggle between the
            two below to see the difference.
          </p>

          <MoneynessSpectrum />

          <p className="text-sm text-muted-foreground leading-relaxed">
            As you move deeper ITM, intrinsic value grows and makes up a larger share of the
            premium. As you move deeper OTM, the premium shrinks and becomes entirely time value —
            which will evaporate if the stock doesn't move enough before expiration.
          </p>
        </Section>

        {/* ── Moneyness and Delta ──────────────────────────────────────────── */}
        <Section icon={<TrendingUp className="size-4" />} title="Moneyness and Delta">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Delta moves in lockstep with moneyness. As an option goes deeper ITM, Delta approaches
            1.00. At the money, Delta is approximately 0.50. As an option goes deeper OTM, Delta
            approaches 0. This is visible in the spectrum above — the Delta value shifts predictably
            as you change the strike.
          </p>

          <div className="rounded-lg border bg-card p-4 my-4 space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              Delta by Moneyness State
            </p>
            {DELTA_ROWS.map((row) => (
              <div key={row.state} className={`rounded-lg p-3 ${row.bg} flex items-start gap-3`}>
                <div className="shrink-0 w-24">
                  <p className={`text-xs font-semibold ${row.text}`}>{row.state}</p>
                  <p className="text-sm font-bold text-foreground mt-0.5">{row.delta}</p>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">{row.desc}</p>
              </div>
            ))}
          </div>

          <p className="text-sm text-muted-foreground leading-relaxed">
            Delta is also used as a rough guide to the likelihood of an option expiring in the
            money. An ATM option with a Delta of 0.50 is sometimes read as roughly a 50% chance of
            expiring ITM. A deep OTM option with a Delta of 0.12 suggests a much lower likelihood.
            This is an approximation, not a precise probability — but it's a useful shorthand when
            comparing contracts.
          </p>
        </Section>

        {/* ── The Tradeoff ─────────────────────────────────────────────────── */}
        <Section icon={<Activity className="size-4" />} title="The Tradeoff">
          <p className="text-sm text-muted-foreground leading-relaxed mb-1">
            Choosing a moneyness level is a tradeoff between cost, sensitivity to stock movement,
            and the likelihood of the option expiring with value.
          </p>

          <TradeoffComparison />

          <p className="text-sm text-muted-foreground leading-relaxed mt-2">
            A deeper ITM option costs more but is more likely to retain value at expiration — a
            larger share of the premium is intrinsic rather than time value at risk of eroding. A
            deeper OTM option is cheaper and offers more leverage on a large move, but the entire
            premium is time value. If the stock doesn't move far enough before expiration, that
            premium goes to zero.
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed mt-3">
            ATM options sit in between — maximum time value, highest sensitivity to both time decay
            and volatility, and roughly even odds of expiring ITM or OTM.
          </p>
        </Section>

        {/* ── Moneyness and Leverage ───────────────────────────────────────── */}
        <Section icon={<Zap className="size-4" />} title="Moneyness and Leverage">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Options provide leverage — a buyer pays a relatively small premium for exposure to a
            contract representing 100 shares. This means a favorable move in the stock can produce a
            large percentage gain relative to the premium paid. But leverage works in both
            directions: if the stock doesn't move as expected, the same dynamic magnifies the
            percentage loss, and an option that expires worthless results in a total loss of the
            premium.
          </p>

          <p className="text-sm text-muted-foreground leading-relaxed mt-3">
            Moneyness determines how much leverage a contract carries. An OTM option has the
            smallest premium, so a given dollar move in the stock represents a larger percentage
            gain — maximum leverage. An ITM option costs more because part of the premium is
            intrinsic value, so the leverage is lower. It behaves more like holding stock directly,
            with Delta near 1.00 for deep ITM contracts.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 mb-4">
            <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600 mb-2">
                ITM
              </p>
              <p className="text-sm text-muted-foreground">
                Lower leverage. Higher premium, high Delta. Behaves closer to owning shares. Less at
                risk of expiring worthless.
              </p>
            </div>
            <div className="rounded-lg border border-blue-500/20 bg-blue-500/5 p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-blue-500 mb-2">
                ATM
              </p>
              <p className="text-sm text-muted-foreground">
                Moderate leverage. Maximum time value and sensitivity to time decay and volatility.
                Roughly even odds of expiring ITM.
              </p>
            </div>
            <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-destructive mb-2">
                OTM
              </p>
              <p className="text-sm text-muted-foreground">
                Highest leverage. Lowest premium, all time value. Requires a larger stock move — if
                it doesn't happen, the full premium is lost.
              </p>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-muted/40 px-4 py-3 flex items-start gap-3">
            <Info className="size-4 text-muted-foreground mt-0.5 shrink-0" />
            <p className="text-sm text-muted-foreground">
              On InvestEd, all contracts are 0–14 DTE. With very little time remaining, an OTM
              option needs a meaningful move in a short window — the leverage is at its highest, and
              so is the risk of the premium going to zero.
            </p>
          </div>
        </Section>

        {/* ── Moneyness in the Chain ───────────────────────────────────────── */}
        <Section icon={<BarChart3 className="size-4" />} title="Moneyness in the Options Chain">
          <p className="text-sm text-muted-foreground leading-relaxed">
            InvestEd's options chain makes moneyness visible at a glance. A dashed blue divider line
            marks where the current stock price sits among the available strikes, clearly separating
            ITM from OTM contracts.
          </p>

          <ChainDividerCallout />

          <p className="text-sm text-muted-foreground leading-relaxed">
            ITM strikes appear in blue above the divider. OTM strikes appear in the default text
            color below it. Notice how Delta decreases steadily as you move down through the OTM
            strikes — a direct reflection of the moneyness relationship described in this module.
          </p>
        </Section>

        {/* Summary */}
        <div className="rounded-xl border bg-card p-5 mb-8">
          <h3 className="font-semibold mb-3">Summary</h3>
          <ul className="space-y-1.5 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="size-4 text-primary mt-0.5 shrink-0" />
              Moneyness describes the relationship between stock price and strike — and is the
              primary driver of how premium splits between intrinsic and time value
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="size-4 text-primary mt-0.5 shrink-0" />
              ITM options carry intrinsic value; OTM options are entirely time value; ATM sits at
              the threshold with maximum time value
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="size-4 text-primary mt-0.5 shrink-0" />
              Moneyness flips between calls and puts — a strike that is ITM for a call is OTM for a
              put at the same stock price
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="size-4 text-primary mt-0.5 shrink-0" />
              Delta increases as an option goes deeper ITM — approaching 1.00 for deep ITM and 0 for
              deep OTM
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="size-4 text-primary mt-0.5 shrink-0" />
              OTM options offer the most leverage — but require a larger move and carry the highest
              risk of expiring worthless
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="size-4 text-primary mt-0.5 shrink-0" />
              ITM options cost more but behave closer to holding stock, with a higher likelihood of
              retaining value at expiration
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="size-4 text-primary mt-0.5 shrink-0" />
              In the InvestEd chain, a dashed blue divider marks the current stock price — ITM
              strikes above it appear in blue
            </li>
          </ul>
        </div>

        <NextModuleCallout />
        <ModuleNavigation moduleId={moduleId ?? ''} />
        <Attribution />
      </div>
    </div>
  );
}
