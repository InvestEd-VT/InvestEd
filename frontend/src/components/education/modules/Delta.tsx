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
  Activity,
  Clock,
  Layers,
} from 'lucide-react';

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
          Delta was introduced in the Greeks Overview and connected to moneyness in the previous
          module. This module goes deeper — put Delta with worked examples, the short options sign
          flip, how Delta shifts as time passes and implied volatility changes, and how to use Delta
          when selecting contracts.
        </p>
      </div>
    </div>
  );
}

// ── Delta range line ──────────────────────────────────────────────────────────
function DeltaRangeLine() {
  const callMarkers = [
    { val: '0', label: 'Deep OTM', align: 'text-left', atm: false },
    { val: '0.25', label: 'OTM', align: 'text-center', atm: false },
    { val: '0.50', label: 'ATM', align: 'text-center', atm: true },
    { val: '0.75', label: 'ITM', align: 'text-center', atm: false },
    { val: '1.00', label: 'Deep ITM', align: 'text-right', atm: false },
  ];
  const putMarkers = [
    { val: '−1.00', label: 'Deep ITM', align: 'text-left', atm: false },
    { val: '−0.75', label: 'ITM', align: 'text-center', atm: false },
    { val: '−0.50', label: 'ATM', align: 'text-center', atm: true },
    { val: '−0.25', label: 'OTM', align: 'text-center', atm: false },
    { val: '0', label: 'Deep OTM', align: 'text-right', atm: false },
  ];

  return (
    <div className="rounded-xl border bg-card p-5 my-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-5">
        Delta Range — Calls and Puts
      </p>

      {/* Call Delta */}
      <div className="mb-7">
        <p className="text-xs font-semibold text-emerald-600 mb-2">Call Delta (positive)</p>
        <div className="h-5 rounded-full bg-gradient-to-r from-emerald-500/10 via-emerald-500/25 to-emerald-500/50 relative border border-emerald-500/20">
          <div className="absolute top-0 bottom-0 w-px bg-emerald-600/50" style={{ left: '50%' }} />
        </div>
        <div className="grid grid-cols-5 mt-1.5">
          {callMarkers.map((m) => (
            <div key={m.val} className={m.align}>
              <p className="text-xs font-semibold text-foreground">{m.val}</p>
              <p
                className={`text-xs ${m.atm ? 'text-emerald-600 font-semibold' : 'text-muted-foreground'}`}
              >
                {m.label}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Put Delta */}
      <div>
        <p className="text-xs font-semibold text-destructive mb-2">Put Delta (negative)</p>
        <div className="h-5 rounded-full bg-gradient-to-r from-destructive/50 via-destructive/25 to-destructive/10 relative border border-destructive/20">
          <div className="absolute top-0 bottom-0 w-px bg-destructive/50" style={{ left: '50%' }} />
        </div>
        <div className="grid grid-cols-5 mt-1.5">
          {putMarkers.map((m) => (
            <div key={m.val} className={m.align}>
              <p className="text-xs font-semibold text-foreground">{m.val}</p>
              <p
                className={`text-xs ${m.atm ? 'text-destructive font-semibold' : 'text-muted-foreground'}`}
              >
                {m.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Short options sign table ──────────────────────────────────────────────────
function SignTable() {
  const rows = [
    { position: 'Buy', option: 'Call', sign: 'Positive (+)', color: 'text-emerald-600' },
    { position: 'Buy', option: 'Put', sign: 'Negative (−)', color: 'text-destructive' },
    { position: 'Sell', option: 'Call', sign: 'Negative (−)', color: 'text-destructive' },
    { position: 'Sell', option: 'Put', sign: 'Positive (+)', color: 'text-emerald-600' },
  ];
  return (
    <div className="rounded-xl border overflow-hidden my-4">
      <div className="grid grid-cols-3 bg-muted text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        <div className="px-4 py-2">Position</div>
        <div className="px-4 py-2 border-l">Option</div>
        <div className="px-4 py-2 border-l">Delta Sign</div>
      </div>
      {rows.map((row, i) => (
        <div
          key={i}
          className={`grid grid-cols-3 text-sm ${i % 2 === 0 ? 'bg-card' : 'bg-muted/30'}`}
        >
          <div className="px-4 py-3 font-medium">{row.position}</div>
          <div className="px-4 py-3 border-l text-muted-foreground">{row.option}</div>
          <div className={`px-4 py-3 border-l font-medium ${row.color}`}>{row.sign}</div>
        </div>
      ))}
    </div>
  );
}

// ── Delta calculator ──────────────────────────────────────────────────────────
const MOVE_OPTIONS = [-5, -2, -1, 1, 2, 5];

function DeltaCalculator() {
  const [type, setType] = useState<'call' | 'put'>('call');
  const [delta, setDelta] = useState(50);
  const [move, setMove] = useState(1);

  const d = delta / 100;
  const effectiveDelta = type === 'call' ? d : -d;
  const change = effectiveDelta * move;
  const contractChange = change * 100;
  const isGain = change > 0;

  return (
    <div className="rounded-xl border bg-card p-5 my-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
        Interactive — Estimated Premium Change
      </p>

      <div className="flex gap-2 mb-5">
        {(['call', 'put'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setType(t)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
              type === t
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:text-foreground'
            }`}
          >
            {t === 'call' ? 'Call' : 'Put'}
          </button>
        ))}
      </div>

      {/* Delta slider */}
      <div className="mb-5">
        <div className="flex justify-between items-center mb-2">
          <p className="text-xs text-muted-foreground">Delta</p>
          <p className="text-sm font-semibold">
            {type === 'call' ? '+' : '−'}
            {d.toFixed(2)}
          </p>
        </div>
        <input
          type="range"
          min={10}
          max={90}
          step={5}
          value={delta}
          onChange={(e) => setDelta(Number(e.target.value))}
          className="w-full accent-primary cursor-pointer"
        />
        <div className="flex justify-between text-xs text-muted-foreground mt-1">
          <span>{type === 'call' ? '+' : '−'}0.10</span>
          <span>ATM ≈ {type === 'call' ? '+' : '−'}0.50</span>
          <span>{type === 'call' ? '+' : '−'}0.90</span>
        </div>
      </div>

      {/* Stock move */}
      <div className="mb-5">
        <p className="text-xs text-muted-foreground mb-2">
          Stock move:{' '}
          <span className="font-semibold text-foreground">
            {move > 0 ? '+' : ''}${move}
          </span>
        </p>
        <div className="flex gap-1.5">
          {MOVE_OPTIONS.map((m) => (
            <button
              key={m}
              onClick={() => setMove(m)}
              className={`flex-1 py-1.5 rounded text-xs font-semibold transition-colors ${
                move === m
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              {m > 0 ? '+' : ''}${m}
            </button>
          ))}
        </div>
      </div>

      {/* Result */}
      <div
        className={`rounded-lg p-4 border ${
          isGain
            ? 'bg-emerald-500/10 border-emerald-500/20'
            : 'bg-destructive/10 border-destructive/20'
        }`}
      >
        <div className="flex items-start justify-between mb-1">
          <p className="text-xs text-muted-foreground">Estimated premium change</p>
          <p className={`text-xl font-bold ${isGain ? 'text-emerald-600' : 'text-destructive'}`}>
            {change > 0 ? '+' : ''}${change.toFixed(2)}
            <span className="text-xs font-normal text-muted-foreground ml-1">per share</span>
          </p>
        </div>
        <p
          className={`text-sm font-semibold mb-2 ${isGain ? 'text-emerald-600' : 'text-destructive'}`}
        >
          {contractChange > 0 ? '+' : ''}${contractChange.toFixed(0)} per contract
        </p>
        <p className="text-xs text-muted-foreground">
          {type === 'call' ? '+' : '−'}
          {d.toFixed(2)} Delta × {move > 0 ? '+' : ''}${move} stock move = {change > 0 ? '+' : ''}$
          {change.toFixed(2)}
        </p>
      </div>

      <p className="text-xs text-muted-foreground mt-3">
        Theoretical estimate assuming all other pricing inputs remain constant. Delta itself changes
        as the stock moves, so actual results will differ — particularly for larger moves.
      </p>
      <div className="rounded-lg bg-muted/40 px-3 py-2.5 mt-3 space-y-1.5 text-xs text-muted-foreground">
        <p className="font-semibold text-foreground">How to use this</p>
        <p>
          Sliding to a <strong className="text-foreground">lower Delta</strong> simulates either
          selecting a further OTM strike or a contract with less time remaining. OTM options lose
          Delta as expiration nears — the window for the stock to reach the strike is shrinking, so
          a $1 move has less impact on the premium.
        </p>
        <p>
          Sliding to a <strong className="text-foreground">higher Delta</strong> simulates selecting
          an ITM strike or a contract with more time remaining. More time gives the stock more
          opportunity to stay in or move into the money, which is reflected in a higher Delta and a
          larger estimated premium change for the same $1 move.
        </p>
        <p>
          Try setting a low Delta with a large stock move, then a high Delta with the same move —
          the difference in estimated impact shows why strike selection and time remaining both
          matter when evaluating a contract.
        </p>
      </div>
    </div>
  );
}

// ── Time and IV cards ─────────────────────────────────────────────────────────
function TimeIVCards() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-4">
      <div className="rounded-lg border bg-card p-4">
        <div className="flex items-center gap-2 mb-3">
          <Clock className="size-4 text-primary" />
          <p className="text-sm font-semibold">Time to Expiration</p>
        </div>
        <p className="text-xs text-muted-foreground mb-3">
          As expiration approaches, Deltas become more decisive:
        </p>
        <div className="space-y-2">
          {[
            {
              state: 'ITM',
              desc: 'Converges toward 1.00 (or −1.00 for puts)',
              color: 'text-emerald-600',
              bg: 'bg-emerald-500/5',
            },
            {
              state: 'ATM',
              desc: 'Stays near 0.50 regardless of time remaining',
              color: 'text-blue-500',
              bg: 'bg-blue-500/5',
            },
            {
              state: 'OTM',
              desc: 'Converges toward 0',
              color: 'text-destructive',
              bg: 'bg-destructive/5',
            },
          ].map((r) => (
            <div key={r.state} className={`rounded-md p-2 ${r.bg} flex gap-2 items-start`}>
              <span className={`text-xs font-semibold shrink-0 w-8 ${r.color}`}>{r.state}</span>
              <span className="text-xs text-muted-foreground">{r.desc}</span>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
          An OTM option with more time remaining has a{' '}
          <strong className="text-foreground">higher</strong> Delta than the same strike closer to
          expiration — more time means more opportunity to move into the money.
        </p>
      </div>

      <div className="rounded-lg border bg-card p-4">
        <div className="flex items-center gap-2 mb-3">
          <Activity className="size-4 text-primary" />
          <p className="text-sm font-semibold">Implied Volatility</p>
        </div>
        <p className="text-xs text-muted-foreground mb-3">
          IV shifts how Deltas are distributed across the chain:
        </p>
        <div className="space-y-2">
          <div className="rounded-md bg-muted/40 p-2.5">
            <p className="text-xs font-semibold text-foreground mb-1">High IV</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Deltas gravitate toward 0.50 — the market expects larger moves, so more strikes are
              considered realistic possibilities for landing ITM.
            </p>
          </div>
          <div className="rounded-md bg-muted/40 p-2.5">
            <p className="text-xs font-semibold text-foreground mb-1">Low IV</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              ITM options have higher Delta and OTM options have lower Delta — smaller expected
              moves mean fewer strikes are considered in play.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Selection tiers ───────────────────────────────────────────────────────────
const TIERS = [
  {
    range: '0.10 – 0.30',
    label: 'Low Delta',
    border: 'border-destructive/20',
    bg: 'bg-destructive/5',
    text: 'text-destructive',
    when: 'Strongly bullish on a call (or strongly bearish on a put) expecting a large, decisive move. Accepts higher risk of expiration worthless in exchange for maximum leverage.',
    points: [
      'Cheapest entry — all time value',
      'Needs a significant stock move to pay off',
      'Highest percentage gain if the move happens',
      'Lowest probability of expiring ITM',
    ],
  },
  {
    range: '0.40 – 0.60',
    label: 'Mid Delta',
    border: 'border-blue-500/20',
    bg: 'bg-blue-500/5',
    text: 'text-blue-500',
    when: 'Bullish on a call (or bearish on a put) expecting a move but uncertain about the magnitude. Balanced cost and sensitivity.',
    points: [
      'Moderate premium — mostly time value',
      'Most sensitive to time decay and volatility',
      'Roughly even probability of expiring ITM',
      'Captures about half of each $1 stock move',
    ],
  },
  {
    range: '0.70 – 0.90',
    label: 'High Delta',
    border: 'border-emerald-500/20',
    bg: 'bg-emerald-500/5',
    text: 'text-emerald-600',
    when: 'Bullish on a call (or bearish on a put) wanting stock-like exposure with defined downside. Less speculative, more directional.',
    points: [
      'Higher premium — includes intrinsic value',
      'Moves nearly dollar-for-dollar with the stock',
      'Higher probability of expiring ITM',
      'Lower leverage but lower risk of total loss',
    ],
  },
];

function SelectionTiers() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-4">
      {TIERS.map((t) => (
        <div key={t.label} className={`rounded-lg border ${t.border} ${t.bg} p-4`}>
          <p className={`text-xs font-semibold uppercase tracking-wider ${t.text} mb-1`}>
            {t.label}
          </p>
          <p className="text-sm font-semibold text-foreground mb-2">Delta {t.range}</p>
          <p className="text-xs text-muted-foreground mb-3 leading-relaxed">{t.when}</p>
          <ul className="space-y-1">
            {t.points.map((p) => (
              <li key={p} className="text-xs text-muted-foreground flex gap-1.5 items-start">
                <span className={`shrink-0 mt-0.5 ${t.text}`}>·</span>
                {p}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

// ── Chain callout ─────────────────────────────────────────────────────────────
const CHAIN_ROWS = [
  {
    strike: '$197.50',
    premium: '$7.23',
    totalCost: '$723.00',
    delta: '+0.65',
    iv: '34.3%',
    dte: '7d',
    itm: true,
  },
  {
    strike: '$198.75',
    premium: '$6.11',
    totalCost: '$611.00',
    delta: '+0.57',
    iv: '34.6%',
    dte: '7d',
    itm: true,
  },
  {
    strike: '$199.75',
    premium: '$5.32',
    totalCost: '$532.00',
    delta: '+0.52',
    iv: '34.8%',
    dte: '7d',
    itm: true,
  },
  {
    strike: '$200.25',
    premium: '$5.07',
    totalCost: '$507.00',
    delta: '+0.48',
    iv: '34.9%',
    dte: '7d',
    itm: false,
  },
  {
    strike: '$201.25',
    premium: '$4.21',
    totalCost: '$421.00',
    delta: '+0.43',
    iv: '35.1%',
    dte: '7d',
    itm: false,
  },
  {
    strike: '$202.50',
    premium: '$3.18',
    totalCost: '$318.00',
    delta: '+0.37',
    iv: '35.3%',
    dte: '7d',
    itm: false,
  },
  {
    strike: '$205.00',
    premium: '$1.97',
    totalCost: '$197.00',
    delta: '+0.26',
    iv: '35.6%',
    dte: '7d',
    itm: false,
  },
  {
    strike: '$207.50',
    premium: '$1.18',
    totalCost: '$118.00',
    delta: '+0.17',
    iv: '35.9%',
    dte: '7d',
    itm: false,
  },
];

function ChainCallout() {
  return (
    <div className="rounded-xl border bg-card overflow-hidden my-4">
      <div className="px-4 py-2.5 bg-muted text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Options Chain — AAPL Calls, 7 DTE, Stock at $200.00
      </div>
      <div className="overflow-x-auto">
        <div className="min-w-[520px]">
          <div className="grid grid-cols-6 text-xs font-semibold uppercase tracking-wider text-muted-foreground border-b">
            <div className="px-4 py-2">Strike</div>
            <div className="px-4 py-2 border-l">Premium</div>
            <div className="px-4 py-2 border-l">Total Cost</div>
            <div className="px-4 py-2 border-l bg-primary/5 text-primary">Delta</div>
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
                <div className="px-4 py-2.5 border-l bg-primary/5 font-medium text-foreground">
                  {row.delta}
                </div>
                <div className="px-4 py-2.5 border-l text-muted-foreground">{row.iv}</div>
                <div className="px-4 py-2.5 border-l text-muted-foreground">{row.dte}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="px-4 py-3 border-t bg-muted/20 text-xs text-muted-foreground">
        Delta is highlighted above. Notice how it decreases steadily as strikes move further OTM
        below the divider, and increases toward 1.00 as strikes move deeper ITM above it. A quick
        scan of this column tells you the sensitivity and approximate probability of each contract
        at a glance.
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
        <p className="text-sm font-semibold text-primary">Up Next: Gamma</p>
        <p className="text-sm text-muted-foreground mt-0.5">
          The next module covers Gamma — the rate at which Delta itself changes as the stock moves.
          Understanding Gamma explains why Delta is a snapshot rather than a constant, and why it
          matters most for short-dated contracts.
        </p>
      </div>
    </div>
  );
}

// ── Attribution ───────────────────────────────────────────────────────────────
function Attribution() {
  return (
    <div className="rounded-lg border border-border bg-muted/30 px-4 py-3 mt-10 flex items-start gap-3">
      <ExternalLink className="size-4 text-muted-foreground mt-0.5 shrink-0" />
      <p className="text-xs text-muted-foreground leading-relaxed">
        Content adapted from{' '}
        <a
          href="https://www.optionseducation.org/advancedconcepts/delta"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-foreground transition-colors"
        >
          Delta
        </a>{' '}
        and{' '}
        <a
          href="https://www.optionseducation.org/advancedconcepts/understanding-options-greeks"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-foreground transition-colors"
        >
          Understanding Options Greeks
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
export default function Delta() {
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
              Module 08
            </span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Delta</h1>
          <p className="text-muted-foreground mt-2">
            A deep dive into Delta — how it measures price sensitivity for calls and puts, how it
            shifts with time and volatility, and how to use it when selecting contracts.
          </p>
        </div>

        <ScopeCallout />

        {/* ── Delta for Calls and Puts ─────────────────────────────────────── */}
        <Section icon={<TrendingUp className="size-4" />} title="Delta for Calls and Puts">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Delta measures how much an option's premium is expected to change for a $1 move in the
            underlying stock. Call Delta is positive (0 to +1.00) — the premium rises as the stock
            rises. Put Delta is negative (0 to −1.00) — the premium rises as the stock falls. An
            at-the-money option typically has a Delta near 0.50.
          </p>

          <DeltaRangeLine />

          <p className="text-sm text-muted-foreground leading-relaxed">
            The put side works as a mirror of the call side. A put with a Delta of −0.50 is expected
            to gain about $0.50 in premium if the stock falls $1, and lose about $0.50 if the stock
            rises $1. A deep ITM put with a Delta of −0.90 moves almost dollar-for-dollar with the
            stock, gaining value as the stock falls.
          </p>

          <div className="rounded-lg border border-border bg-muted/20 p-4 mt-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              Put Delta Example
            </p>
            <div className="space-y-1.5 text-sm text-muted-foreground">
              <p>
                A put option with a <strong className="text-foreground">Delta of −0.40</strong> and
                a current premium of <strong className="text-foreground">$2.50</strong>:
              </p>
              <p className="mt-2">
                <strong className="text-foreground">Stock falls $2:</strong> −0.40 × −$2 ={' '}
                <strong className="text-emerald-600">+$0.80</strong> estimated gain → new premium ≈
                $3.30
              </p>
              <p>
                <strong className="text-foreground">Stock rises $2:</strong> −0.40 × +$2 ={' '}
                <strong className="text-destructive">−$0.80</strong> estimated loss → new premium ≈
                $1.70
              </p>
            </div>
          </div>

          <p className="text-sm text-muted-foreground leading-relaxed mt-4 mb-2">
            Delta also flips sign when you sell an option rather than buy it. A short position is
            effectively a negative quantity of contracts, which reverses the directional exposure.
          </p>

          <SignTable />

          <p className="text-sm text-muted-foreground leading-relaxed">
            Selling a put gives you positive Delta — the position gains value when the stock rises,
            like a long call. Selling a call gives you negative Delta — the position gains value
            when the stock falls, like a long put.
          </p>
        </Section>

        {/* ── Delta is Dynamic ─────────────────────────────────────────────── */}
        <Section icon={<Activity className="size-4" />} title="Delta is Dynamic">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Delta is a theoretical estimate at a single moment in time — not a fixed number. It
            changes continuously as the stock price moves, as time passes, and as implied volatility
            shifts. The calculation assumes all other inputs stay constant, which in practice they
            don't. Use Delta as a directional guide, not a precise prediction.
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed mt-3">
            The calculator below shows the estimated premium change for a given Delta and stock
            move. Notice how larger moves produce proportionally larger estimates — but keep in mind
            that Delta itself changes as the stock moves, so the actual result will differ.
          </p>

          <DeltaCalculator />

          <p className="text-sm text-muted-foreground leading-relaxed">
            The rate at which Delta changes as the stock moves is measured by{' '}
            <strong className="text-foreground">Gamma</strong> — covered in the next module.
            Understanding Gamma is what turns Delta from a static number into a complete picture of
            how a position behaves.
          </p>
        </Section>

        {/* ── Time and Volatility ──────────────────────────────────────────── */}
        <Section icon={<Clock className="size-4" />} title="How Time and Volatility Affect Delta">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Two inputs cause Delta to shift without the stock price moving at all: time remaining
            until expiration and implied volatility.
          </p>

          <TimeIVCards />

          <div className="rounded-lg border border-border bg-muted/40 px-4 py-3 flex items-start gap-3 mt-2">
            <Info className="size-4 text-muted-foreground mt-0.5 shrink-0" />
            <p className="text-sm text-muted-foreground">
              On InvestEd, all contracts are 0–14 DTE. With so little time remaining, ITM Deltas are
              already converging toward 1.00 and OTM Deltas are already converging toward 0 — the
              values you see in the chain are more decisive than they would be on longer-dated
              contracts.
            </p>
          </div>
        </Section>

        {/* ── Using Delta to Select Contracts ─────────────────────────────── */}
        <Section icon={<Layers className="size-4" />} title="Using Delta to Select Contracts">
          <p className="text-sm text-muted-foreground leading-relaxed mb-1">
            Delta gives you a practical handle on a contract's risk profile before you buy it.
            Different Delta ranges suit different outlooks and risk tolerances.
          </p>

          <SelectionTiers />

          <p className="text-sm text-muted-foreground leading-relaxed mt-2">
            There is no universally correct Delta to choose — it depends on how strongly you expect
            a move, how large you expect it to be, and how much premium you're willing to risk. A
            0.10 Delta contract expiring in 3 days needs a very large move very quickly. A 0.80
            Delta contract gives meaningful exposure to a modest move with a higher probability of
            retaining value.
          </p>
        </Section>

        {/* ── Delta in the Chain ───────────────────────────────────────────── */}
        <Section icon={<BarChart3 className="size-4" />} title="Delta in the Options Chain">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Delta appears as a column in InvestEd's options chain alongside every contract, updating
            continuously as the stock price moves.
          </p>

          <ChainCallout />

          <p className="text-sm text-muted-foreground leading-relaxed">
            When scanning the chain, the Delta column lets you quickly compare sensitivity and
            implied probability across strikes without calculating anything manually. It's one of
            the most useful columns for understanding what you're buying before you trade.
          </p>
        </Section>

        {/* Summary */}
        <div className="rounded-xl border bg-card p-5 mb-8">
          <h3 className="font-semibold mb-3">Summary</h3>
          <ul className="space-y-1.5 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="size-4 text-primary mt-0.5 shrink-0" />
              Call Delta is positive (0 to +1.00) — rises with the stock. Put Delta is negative (0
              to −1.00) — rises as the stock falls.
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="size-4 text-primary mt-0.5 shrink-0" />
              Selling an option reverses the sign — short calls have negative Delta, short puts have
              positive Delta
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="size-4 text-primary mt-0.5 shrink-0" />
              Delta is a snapshot — it changes continuously as the stock moves, time passes, and
              implied volatility shifts
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="size-4 text-primary mt-0.5 shrink-0" />
              As expiration nears, ITM Deltas converge toward 1.00 and OTM Deltas converge toward 0
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="size-4 text-primary mt-0.5 shrink-0" />
              Higher IV pushes all Deltas toward 0.50 — more strikes are considered in play
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="size-4 text-primary mt-0.5 shrink-0" />
              Low Delta (0.10–0.30): maximum leverage, needs a large move, highest risk of expiring
              worthless
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="size-4 text-primary mt-0.5 shrink-0" />
              Mid Delta (0.40–0.60): balanced sensitivity, roughly even probability of expiring ITM
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="size-4 text-primary mt-0.5 shrink-0" />
              High Delta (0.70–0.90): stock-like behavior, highest probability of retaining value at
              expiration
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
