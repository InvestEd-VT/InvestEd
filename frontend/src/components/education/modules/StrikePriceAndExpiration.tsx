import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ModuleNavigation from '@/components/education/ModuleNavigation';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  DollarSign,
  TrendingUp,
  Clock,
  Layers,
  BarChart3,
  Info,
  CheckCircle2,
  ExternalLink,
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
          This module explores how strike price and expiration date influence an option's value. It
          covers strike price intervals, the relationship between strike price and intrinsic value,
          how time remaining affects the premium, and how to read an options chain.
        </p>
      </div>
    </div>
  );
}

// ── Strike interval visual example ────────────────────────────────────────────
function StrikeIntervalExample() {
  return (
    <div className="rounded-xl border bg-card p-5 my-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">
        Strike Intervals — Same Stock, Different Spacing
      </p>

      <div className="space-y-5">
        <div>
          <p className="text-sm font-semibold mb-2">
            $2.50 interval{' '}
            <span className="font-normal text-muted-foreground">— strikes listed every $2.50</span>
          </p>
          <div className="flex flex-wrap gap-2">
            {[140, 142.5, 145, 147.5, 150, 152.5, 155, 157.5, 160].map((s) => (
              <div
                key={s}
                className={`px-2.5 py-1.5 rounded-md text-xs font-medium ${
                  s === 150
                    ? 'bg-muted text-foreground ring-2 ring-primary ring-offset-1'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                ${s % 1 === 0 ? s.toFixed(0) : s.toFixed(2)}
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-1.5">
            Typical for stocks in the $25–$200 range. More choices near the current price.
          </p>
        </div>

        <div>
          <p className="text-sm font-semibold mb-2">
            $5 interval{' '}
            <span className="font-normal text-muted-foreground">— strikes listed every $5</span>
          </p>
          <div className="flex flex-wrap gap-2">
            {[130, 135, 140, 145, 150, 155, 160, 165, 170].map((s) => (
              <div
                key={s}
                className={`px-2.5 py-1.5 rounded-md text-xs font-medium ${
                  s === 150
                    ? 'bg-muted text-foreground ring-2 ring-primary ring-offset-1'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                ${s}
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-1.5">
            Wider spacing — fewer choices, but each strike is further from the next.
          </p>
        </div>
      </div>

      <p className="text-xs text-muted-foreground mt-4">
        <span className="inline-block size-2.5 rounded ring-2 ring-primary mr-1.5 align-middle" />
        Outlined strike represents the at-the-money level (closest to the current stock price).
      </p>
    </div>
  );
}

// ── Strike interval reference table ───────────────────────────────────────────
function StrikeIntervalTable() {
  const rows = [
    { range: 'Under $25', interval: '$0.50 or $1' },
    { range: '$25 – $200', interval: '$1, $2.50, or $5' },
    { range: 'Over $200', interval: '$5 or $10' },
  ];

  return (
    <div className="rounded-xl border overflow-hidden my-4">
      <div className="grid grid-cols-2 bg-muted text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        <div className="px-4 py-2">Underlying Price Level</div>
        <div className="px-4 py-2 border-l">Typical Strike Intervals</div>
      </div>
      {rows.map((row, i) => (
        <div
          key={i}
          className={`grid grid-cols-2 text-sm ${i % 2 === 0 ? 'bg-card' : 'bg-muted/30'}`}
        >
          <div className="px-4 py-3 font-medium">{row.range}</div>
          <div className="px-4 py-3 border-l text-muted-foreground">{row.interval}</div>
        </div>
      ))}
    </div>
  );
}

// ── Interactive strike price selector ─────────────────────────────────────────
function StrikePriceSelector() {
  const stockPrice = 150;
  const strikes = [140, 145, 148, 150, 152, 155, 160];
  const [selected, setSelected] = useState<number>(150);

  const getMoneyness = (strike: number, type: 'call' | 'put') => {
    if (strike === stockPrice) return 'ATM';
    if (type === 'call') return strike < stockPrice ? 'ITM' : 'OTM';
    return strike > stockPrice ? 'ITM' : 'OTM';
  };

  const getIntrinsic = (strike: number, type: 'call' | 'put') => {
    if (type === 'call') return Math.max(stockPrice - strike, 0);
    return Math.max(strike - stockPrice, 0);
  };

  const moneynessColor = (m: string) => {
    if (m === 'ITM') return 'text-emerald-600 bg-emerald-500/10';
    if (m === 'OTM') return 'text-destructive bg-destructive/10';
    return 'text-muted-foreground bg-muted';
  };

  return (
    <div className="rounded-xl border bg-card p-5 my-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">
        Hypothetical Stock — Current Price: ${stockPrice}
      </p>

      <div className="flex flex-wrap gap-2 mb-5">
        {strikes.map((s) => (
          <button
            key={s}
            onClick={() => setSelected(s)}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              selected === s
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:text-foreground'
            }`}
          >
            ${s}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {(['call', 'put'] as const).map((type) => {
          const m = getMoneyness(selected, type);
          const iv = getIntrinsic(selected, type);
          return (
            <div key={type} className="rounded-lg border p-3">
              <p className="text-sm font-semibold mb-2">
                {type === 'call' ? 'Call' : 'Put'} — ${selected} Strike
              </p>
              <div className="space-y-1.5 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Moneyness</span>
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-semibold ${moneynessColor(m)}`}
                  >
                    {m}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Intrinsic Value</span>
                  <span className="font-medium">
                    ${iv.toFixed(2)}
                    {iv === 0 && (
                      <span className="text-xs text-muted-foreground ml-1">(no intrinsic)</span>
                    )}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-xs text-muted-foreground mt-3">
        Select different strikes to see how the relationship between the strike price and the
        current stock price changes intrinsic value and moneyness for both calls and puts.
      </p>
    </div>
  );
}

// ── Time decay curve diagram ──────────────────────────────────────────────────
function TimeDecayCurve() {
  const points = [
    { dte: 90, pct: 100 },
    { dte: 75, pct: 91 },
    { dte: 60, pct: 82 },
    { dte: 45, pct: 71 },
    { dte: 30, pct: 58 },
    { dte: 21, pct: 48 },
    { dte: 14, pct: 39 },
    { dte: 7, pct: 28 },
    { dte: 3, pct: 18 },
    { dte: 1, pct: 10 },
    { dte: 0, pct: 0 },
  ];

  const w = 560;
  const h = 220;
  const pad = { t: 20, r: 20, b: 40, l: 50 };
  const cw = w - pad.l - pad.r;
  const ch = h - pad.t - pad.b;

  const x = (dte: number) => pad.l + cw * (1 - dte / 90);
  const y = (pct: number) => pad.t + ch * (1 - pct / 100);

  const pathD = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${x(p.dte).toFixed(1)} ${y(p.pct).toFixed(1)}`)
    .join(' ');

  const areaD = `${pathD} L ${x(0).toFixed(1)} ${y(0).toFixed(1)} L ${x(90).toFixed(1)} ${y(0).toFixed(1)} Z`;

  return (
    <div className="rounded-xl border bg-card p-5 my-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">
        Time Value Decay — At-the-Money Option
      </p>
      <div className="overflow-x-auto">
        <svg viewBox={`0 0 ${w} ${h}`} className="w-full max-w-lg" aria-label="Time decay curve">
          {[0, 25, 50, 75, 100].map((pct) => (
            <g key={pct}>
              <line
                x1={pad.l}
                y1={y(pct)}
                x2={w - pad.r}
                y2={y(pct)}
                className="stroke-border"
                strokeDasharray={pct === 0 ? undefined : '3 3'}
                strokeWidth={pct === 0 ? 1 : 0.5}
              />
              <text
                x={pad.l - 8}
                y={y(pct) + 3}
                textAnchor="end"
                className="fill-muted-foreground text-[9px]"
              >
                {pct}%
              </text>
            </g>
          ))}

          {[90, 60, 30, 14, 0].map((dte) => (
            <text
              key={dte}
              x={x(dte)}
              y={h - pad.b + 16}
              textAnchor="middle"
              className="fill-muted-foreground text-[9px]"
            >
              {dte}
            </text>
          ))}

          <text
            x={w / 2}
            y={h - 4}
            textAnchor="middle"
            className="fill-muted-foreground text-[10px]"
          >
            Days to Expiration
          </text>
          <text
            x={12}
            y={h / 2 - 10}
            textAnchor="middle"
            className="fill-muted-foreground text-[10px]"
            transform={`rotate(-90, 12, ${h / 2 - 10})`}
          >
            Time Value
          </text>

          <path d={areaD} className="fill-primary/5" />
          <path d={pathD} className="stroke-primary" fill="none" strokeWidth={2} />

          {points.map((p, i) => (
            <circle key={i} cx={x(p.dte)} cy={y(p.pct)} r={2.5} className="fill-primary" />
          ))}
        </svg>
      </div>

      <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-muted-foreground">
        <div className="rounded-lg bg-muted/50 p-2.5">
          <p className="font-semibold text-foreground mb-0.5">Gradual at first</p>
          <p>
            With 60–90 days remaining, time value erodes slowly. Each passing day has a relatively
            small impact on the premium.
          </p>
        </div>
        <div className="rounded-lg bg-muted/50 p-2.5">
          <p className="font-semibold text-foreground mb-0.5">Steep near expiration</p>
          <p>
            In the final 30 days — and especially the last two weeks — time decay accelerates
            sharply. At-the-money options lose the most time value in this window.
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Strike & expiration comparison table ──────────────────────────────────────
function StrikeExpirationComparison() {
  const stockPrice = 190;
  const rows = [
    {
      label: 'Near strike, near expiry',
      strike: 192,
      dte: 3,
      premium: 1.2,
      intrinsic: 0,
      timeVal: 1.2,
    },
    {
      label: 'Near strike, further expiry',
      strike: 192,
      dte: 10,
      premium: 2.85,
      intrinsic: 0,
      timeVal: 2.85,
    },
    {
      label: 'ITM strike, near expiry',
      strike: 185,
      dte: 3,
      premium: 5.6,
      intrinsic: 5.0,
      timeVal: 0.6,
    },
    {
      label: 'OTM strike, further expiry',
      strike: 200,
      dte: 10,
      premium: 0.95,
      intrinsic: 0,
      timeVal: 0.95,
    },
  ];

  return (
    <div className="rounded-xl border bg-card p-5 my-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
        Hypothetical AAPL Calls — Stock Price: ${stockPrice}
      </p>
      <p className="text-xs text-muted-foreground mb-4">
        Illustrative values only. Premium is the per-share cost to buy the contract — multiply by
        100 for the total cost.
      </p>

      <div className="overflow-x-auto">
        <div className="min-w-[520px]">
          <div className="grid grid-cols-6 bg-muted text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <div className="px-3 py-2">Contract</div>
            <div className="px-3 py-2 border-l text-center">Strike</div>
            <div className="px-3 py-2 border-l text-center">DTE</div>
            <div className="px-3 py-2 border-l text-center">Premium</div>
            <div className="px-3 py-2 border-l text-center">Intrinsic</div>
            <div className="px-3 py-2 border-l text-center">Time Val</div>
          </div>
          {rows.map((row, i) => (
            <div
              key={i}
              className={`grid grid-cols-6 text-sm ${i % 2 === 0 ? 'bg-card' : 'bg-muted/30'}`}
            >
              <div className="px-3 py-3 font-medium text-xs">{row.label}</div>
              <div className="px-3 py-3 border-l text-center text-muted-foreground">
                ${row.strike}
              </div>
              <div className="px-3 py-3 border-l text-center text-muted-foreground">{row.dte}</div>
              <div className="px-3 py-3 border-l text-center font-medium">
                ${row.premium.toFixed(2)}
              </div>
              <div className="px-3 py-3 border-l text-center text-muted-foreground">
                ${row.intrinsic.toFixed(2)}
              </div>
              <div className="px-3 py-3 border-l text-center text-muted-foreground">
                ${row.timeVal.toFixed(2)}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 space-y-2 text-xs text-muted-foreground">
        <p>
          <strong className="text-foreground">Same strike, different expirations:</strong> The $192
          call costs $1.20 per share ($120 total) with 3 days left, but $2.85 per share ($285 total)
          with 10 days — the extra time value accounts for the higher premium.
        </p>
        <p>
          <strong className="text-foreground">Different strikes, same direction:</strong> The $185
          ITM call has $5.00 of intrinsic value baked in, so its premium is higher even with only 3
          days left. The $200 OTM call is cheaper because it has no intrinsic value — the entire
          $0.95 premium is time value.
        </p>
      </div>
    </div>
  );
}

// ── Options chain data ────────────────────────────────────────────────────────
// Derived from Black-Scholes with S=192, r=5%.
// IV skew across strikes: ~39.5–42% at wings, ~38–39.5% ATM.
// IV term structure: 3 DTE highest (~1.5% above 14 DTE), 7 DTE mid, 14 DTE lowest.
// Put prices from put-call parity: P = C - S + K·e^(-rT).
// Put delta = call delta - 1.
// Sell premiums reflect a ~$0.10–0.15 spread below buy.
type ChainRow = {
  strike: number;
  premium: number;
  delta: number;
  iv: number;
};

const STOCK_PRICE = 192;

const CHAIN_DATA: Record<string, Record<string, Record<number, ChainRow[]>>> = {
  buy: {
    call: {
      3: [
        { strike: 185, premium: 7.18, delta: 0.85, iv: 41.5 },
        { strike: 190, premium: 3.05, delta: 0.62, iv: 39.5 },
        { strike: 195, premium: 0.85, delta: 0.34, iv: 40.0 },
        { strike: 200, premium: 0.18, delta: 0.14, iv: 41.0 },
        { strike: 205, premium: 0.03, delta: 0.04, iv: 42.0 },
      ],
      7: [
        { strike: 185, premium: 7.85, delta: 0.75, iv: 40.5 },
        { strike: 190, premium: 3.8, delta: 0.59, iv: 38.5 },
        { strike: 195, premium: 1.4, delta: 0.39, iv: 39.0 },
        { strike: 200, premium: 0.48, delta: 0.24, iv: 40.0 },
        { strike: 205, premium: 0.14, delta: 0.13, iv: 41.0 },
      ],
      14: [
        { strike: 185, premium: 8.75, delta: 0.69, iv: 40.0 },
        { strike: 190, premium: 4.9, delta: 0.56, iv: 38.0 },
        { strike: 195, premium: 2.35, delta: 0.42, iv: 38.5 },
        { strike: 200, premium: 1.0, delta: 0.3, iv: 39.5 },
        { strike: 205, premium: 0.4, delta: 0.21, iv: 40.5 },
      ],
    },
    put: {
      3: [
        { strike: 185, premium: 0.16, delta: -0.15, iv: 41.5 },
        { strike: 190, premium: 1.02, delta: -0.38, iv: 39.5 },
        { strike: 195, premium: 3.82, delta: -0.66, iv: 40.0 },
        { strike: 200, premium: 8.15, delta: -0.86, iv: 41.0 },
        { strike: 205, premium: 13.0, delta: -0.96, iv: 42.0 },
      ],
      7: [
        { strike: 185, premium: 0.78, delta: -0.25, iv: 40.5 },
        { strike: 190, premium: 1.72, delta: -0.41, iv: 38.5 },
        { strike: 195, premium: 4.32, delta: -0.61, iv: 39.0 },
        { strike: 200, premium: 8.39, delta: -0.76, iv: 40.0 },
        { strike: 205, premium: 13.05, delta: -0.87, iv: 41.0 },
      ],
      14: [
        { strike: 185, premium: 1.65, delta: -0.31, iv: 40.0 },
        { strike: 190, premium: 2.79, delta: -0.44, iv: 38.0 },
        { strike: 195, premium: 5.23, delta: -0.58, iv: 38.5 },
        { strike: 200, premium: 8.87, delta: -0.7, iv: 39.5 },
        { strike: 205, premium: 13.26, delta: -0.79, iv: 40.5 },
      ],
    },
  },
  sell: {
    call: {
      3: [
        { strike: 185, premium: 7.05, delta: 0.85, iv: 41.5 },
        { strike: 190, premium: 2.92, delta: 0.62, iv: 39.5 },
        { strike: 195, premium: 0.73, delta: 0.34, iv: 40.0 },
        { strike: 200, premium: 0.1, delta: 0.14, iv: 41.0 },
        { strike: 205, premium: 0.01, delta: 0.04, iv: 42.0 },
      ],
      7: [
        { strike: 185, premium: 7.7, delta: 0.75, iv: 40.5 },
        { strike: 190, premium: 3.65, delta: 0.59, iv: 38.5 },
        { strike: 195, premium: 1.28, delta: 0.39, iv: 39.0 },
        { strike: 200, premium: 0.38, delta: 0.24, iv: 40.0 },
        { strike: 205, premium: 0.07, delta: 0.13, iv: 41.0 },
      ],
      14: [
        { strike: 185, premium: 8.6, delta: 0.69, iv: 40.0 },
        { strike: 190, premium: 4.75, delta: 0.56, iv: 38.0 },
        { strike: 195, premium: 2.2, delta: 0.42, iv: 38.5 },
        { strike: 200, premium: 0.88, delta: 0.3, iv: 39.5 },
        { strike: 205, premium: 0.3, delta: 0.21, iv: 40.5 },
      ],
    },
    put: {
      3: [
        { strike: 185, premium: 0.07, delta: -0.15, iv: 41.5 },
        { strike: 190, premium: 0.9, delta: -0.38, iv: 39.5 },
        { strike: 195, premium: 3.7, delta: -0.66, iv: 40.0 },
        { strike: 200, premium: 8.02, delta: -0.86, iv: 41.0 },
        { strike: 205, premium: 12.87, delta: -0.96, iv: 42.0 },
      ],
      7: [
        { strike: 185, premium: 0.65, delta: -0.25, iv: 40.5 },
        { strike: 190, premium: 1.6, delta: -0.41, iv: 38.5 },
        { strike: 195, premium: 4.18, delta: -0.61, iv: 39.0 },
        { strike: 200, premium: 8.25, delta: -0.76, iv: 40.0 },
        { strike: 205, premium: 12.92, delta: -0.87, iv: 41.0 },
      ],
      14: [
        { strike: 185, premium: 1.52, delta: -0.31, iv: 40.0 },
        { strike: 190, premium: 2.65, delta: -0.44, iv: 38.0 },
        { strike: 195, premium: 5.1, delta: -0.58, iv: 38.5 },
        { strike: 200, premium: 8.75, delta: -0.7, iv: 39.5 },
        { strike: 205, premium: 13.12, delta: -0.79, iv: 40.5 },
      ],
    },
  },
};

// ── Interactive options chain ─────────────────────────────────────────────────
function OptionsChainInteractive() {
  const [side, setSide] = useState<'buy' | 'sell'>('buy');
  const [type, setType] = useState<'call' | 'put'>('call');
  const [dte, setDte] = useState<number>(7);

  const rows = CHAIN_DATA[side][type][dte];
  const dteOptions = [3, 7, 14];

  return (
    <div className="rounded-xl border bg-card p-5 my-4">
      <p className="text-sm font-semibold">
        AAPL {side} {type.charAt(0).toUpperCase() + type.slice(1)}{' '}
        <span className="text-muted-foreground font-normal text-xs">· {dte}DTE</span>
      </p>
      <p className="text-xs text-muted-foreground mb-4">
        Hypothetical · Stock at ${STOCK_PRICE} · Illustrative values only
      </p>

      <div className="flex flex-wrap items-center gap-3 mb-3">
        <div className="flex rounded-lg border overflow-hidden">
          {(['buy', 'sell'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setSide(s)}
              className={`px-4 py-1.5 text-xs font-semibold transition-colors ${
                side === s
                  ? 'bg-emerald-600 text-white'
                  : 'bg-card text-muted-foreground hover:text-foreground'
              }`}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
        <div className="flex rounded-lg border overflow-hidden">
          {(['call', 'put'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setType(t)}
              className={`px-4 py-1.5 text-xs font-semibold transition-colors ${
                type === t
                  ? 'bg-emerald-600 text-white'
                  : 'bg-card text-muted-foreground hover:text-foreground'
              }`}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-1 mb-4">
        {dteOptions.map((d) => (
          <button
            key={d}
            onClick={() => setDte(d)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              dte === d
                ? 'bg-foreground text-background'
                : 'bg-muted text-muted-foreground hover:text-foreground'
            }`}
          >
            {d}DTE
          </button>
        ))}
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[460px] rounded-lg border border-border overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-muted text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                <th className="px-3 py-2 text-left font-semibold">Strike</th>
                <th className="px-3 py-2 text-center font-semibold">Premium</th>
                <th className="px-3 py-2 text-center font-semibold">Total Cost</th>
                <th className="px-3 py-2 text-center font-semibold">Delta</th>
                <th className="px-3 py-2 text-center font-semibold">IV</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr
                  key={row.strike}
                  className={`text-sm ${i % 2 === 0 ? 'bg-card' : 'bg-muted/30'}`}
                >
                  <td className="px-3 py-2.5 font-medium">${row.strike}</td>
                  <td className="px-3 py-2.5 text-center text-emerald-600 font-medium">
                    ${row.premium.toFixed(2)}
                  </td>
                  <td className="px-3 py-2.5 text-center text-muted-foreground">
                    ${(row.premium * 100).toFixed(2)}
                  </td>
                  <td className="px-3 py-2.5 text-center text-muted-foreground">
                    {row.delta >= 0 ? '+' : ''}
                    {row.delta.toFixed(2)}
                  </td>
                  <td className="px-3 py-2.5 text-center text-muted-foreground">
                    {row.iv.toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-xs text-muted-foreground mt-3">
        Toggle between buy/sell and call/put to see how the chain changes for each position type.
        Switch DTE tabs to see the same strikes at different expirations — notice how premiums
        increase with more time remaining.
      </p>
    </div>
  );
}

// ── Next module callout ───────────────────────────────────────────────────────
function NextModuleCallout() {
  return (
    <div className="rounded-lg border border-primary/20 bg-primary/5 px-4 py-4 mb-8 flex items-start gap-3">
      <ArrowRight className="size-4 text-primary mt-0.5 shrink-0" />
      <div>
        <p className="text-sm font-semibold text-primary">Up Next: Option Premium Explained</p>
        <p className="text-sm text-muted-foreground mt-0.5">
          In the next module we'll take a closer look at the option premium itself — how intrinsic
          value and time value combine to form the price you pay, what drives premium higher or
          lower, and how to think about whether a contract is priced attractively.
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
          href="https://www.optionseducation.org/optionsoverview/options-pricing"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-foreground transition-colors"
        >
          Options Pricing
        </a>
        ,{' '}
        <a
          href="https://www.optionseducation.org/advancedconcepts/theta"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-foreground transition-colors"
        >
          Theta
        </a>
        , and{' '}
        <a
          href="https://www.optionseducation.org/optionsoverview/exercising-options"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-foreground transition-colors"
        >
          Exercising Options
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
export default function StrikePriceAndExpiration() {
  const navigate = useNavigate();
  const { id: moduleId } = useParams<{ id: string }>();

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-6 py-8">
        <button
          onClick={() => navigate('/learn')}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="size-4" />
          Back to Learn
        </button>

        <div className="mb-8">
          <div className="flex items-center gap-2 mb-1">
            <BookOpen className="size-5 text-primary" />
            <span className="text-xs text-muted-foreground font-mono uppercase tracking-wider">
              Module 05
            </span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Strike Price &amp; Expiration</h1>
          <p className="text-muted-foreground mt-2">
            How strike price and expiration date shape an option's value — and how to read them on
            an options chain.
          </p>
        </div>

        <ScopeCallout />

        <Section icon={<DollarSign className="size-4" />} title="Strike Price Intervals">
          <p className="text-sm text-muted-foreground leading-relaxed">
            When you look at the available contracts for a stock, you'll see a range of strike
            prices listed at fixed intervals. The{' '}
            <strong className="text-foreground">interval</strong> is the spacing between one strike
            and the next — for example, a $2.50 interval means strikes are listed every $2.50 ($145,
            $147.50, $150, $152.50, and so on).
          </p>

          <StrikeIntervalExample />

          <p className="text-sm text-muted-foreground leading-relaxed mt-3">
            The size of the interval depends on the price level of the underlying stock.
            Lower-priced stocks tend to have narrower intervals, giving traders more choices near
            the current price. Higher-priced stocks use wider intervals.
          </p>

          <StrikeIntervalTable />

          <p className="text-sm text-muted-foreground leading-relaxed mt-3">
            You'll typically see the most strikes clustered around the current stock price. This is
            where trading activity is highest, so exchanges list strikes at closer intervals to give
            traders more precision when choosing contracts.
          </p>
        </Section>

        <Section icon={<TrendingUp className="size-4" />} title="Strike Price and Intrinsic Value">
          <p className="text-sm text-muted-foreground leading-relaxed">
            The relationship between a contract's strike price and the current stock price
            determines whether the option has{' '}
            <strong className="text-foreground">intrinsic value</strong> — and if so, how much.
          </p>

          <Term
            word="Intrinsic Value"
            definition="The portion of an option's premium that reflects how far the option is in the money. For a call, intrinsic value equals the stock price minus the strike price (when positive). For a put, it equals the strike price minus the stock price (when positive). An option that is at the money or out of the money has zero intrinsic value."
          />

          <p className="text-sm text-muted-foreground leading-relaxed mt-3">
            Only in-the-money options have intrinsic value. An option that is at the money or out of
            the money has an intrinsic value of zero — its entire premium is made up of time value.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-4">
            <div className="rounded-lg border bg-card p-4">
              <p className="text-sm font-semibold mb-1">Call Intrinsic Value</p>
              <p className="text-sm text-muted-foreground">Stock Price − Strike Price</p>
              <p className="text-xs text-muted-foreground mt-1">
                Example: Stock at $150, $140 strike call → $10 intrinsic value
              </p>
            </div>
            <div className="rounded-lg border bg-card p-4">
              <p className="text-sm font-semibold mb-1">Put Intrinsic Value</p>
              <p className="text-sm text-muted-foreground">Strike Price − Stock Price</p>
              <p className="text-xs text-muted-foreground mt-1">
                Example: Stock at $150, $160 strike put → $10 intrinsic value
              </p>
            </div>
          </div>

          <p className="text-sm text-muted-foreground leading-relaxed">
            Use the selector below to explore how changing the strike price affects intrinsic value
            and moneyness for both calls and puts on the same stock.
          </p>

          <StrikePriceSelector />
        </Section>

        <Section icon={<Clock className="size-4" />} title="Expiration and Time Value">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Every options contract has an expiration date — the deadline after which the contract
            ceases to exist. Standard equity options typically expire on the third Friday of the
            month, but many products now offer weekly expirations as well. At any given time, you
            can usually choose from several available expiration dates.
          </p>

          <p className="text-sm text-muted-foreground leading-relaxed mt-3">
            The amount of time remaining until expiration directly affects how much time value the
            contract carries. More time means more opportunity for the underlying stock to move
            favorably, so options with more time remaining carry a higher premium — all else being
            equal.
          </p>

          <p className="text-sm text-muted-foreground leading-relaxed mt-3">
            But time value does not erode at a constant rate. The decay is gradual when expiration
            is far away and accelerates sharply in the final 30 days. At-the-money options are the
            most sensitive to this effect because their premium is made up almost entirely of time
            value.
          </p>

          <TimeDecayCurve />

          <p className="text-sm text-muted-foreground leading-relaxed mt-3">
            After expiration, an option that is in the money may be exercised — meaning the holder
            buys (for calls) or sells (for puts) shares at the strike price. An option that is out
            of the money at expiration generally expires worthless, and the holder loses the premium
            paid.
          </p>
        </Section>

        <Section icon={<Layers className="size-4" />} title="Comparing Strikes and Expirations">
          <p className="text-sm text-muted-foreground leading-relaxed">
            The same stock can have dozens of available contracts at any time — each with a
            different combination of strike price and expiration date. Changing either one shifts
            the balance between intrinsic value and time value, which changes the premium and the
            risk profile of the trade.
          </p>

          <StrikeExpirationComparison />

          <p className="text-sm text-muted-foreground leading-relaxed mt-3">
            There's no single "right" combination. The strike and expiration you choose depend on
            your outlook for the stock, how much premium you're willing to pay, and how much time
            you want the trade to have. These tradeoffs become more intuitive as you work through
            later modules on premium, the Greeks, and strategy.
          </p>
        </Section>

        <Section icon={<BarChart3 className="size-4" />} title="Reading the Options Chain">
          <p className="text-sm text-muted-foreground leading-relaxed">
            An options chain is the standard layout for viewing all available contracts on a given
            underlying stock. It organizes contracts by strike price and expiration date so you can
            compare them side by side.
          </p>

          <Term
            word="Options Chain"
            definition="A table that displays all available options contracts for a given stock, organized by strike price and expiration date. Each row shows a different strike with its premium, total cost, and key metrics like Delta and implied volatility."
          />

          <OptionsChainInteractive />

          <p className="text-sm text-muted-foreground leading-relaxed mt-3">
            Try switching between expirations to see the same strikes at different DTE values —
            notice how premiums increase with more time remaining. Then toggle between calls and
            puts, or buy and sell, to see how the chain looks from each perspective.
          </p>
        </Section>

        <div className="rounded-xl border bg-card p-5 mb-8">
          <h3 className="font-semibold mb-3">Summary</h3>
          <ul className="space-y-1.5 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="size-4 text-primary mt-0.5 shrink-0" />
              Strike prices are listed at standard intervals that depend on the underlying stock's
              price level — narrower intervals near the current price, wider intervals further away
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="size-4 text-primary mt-0.5 shrink-0" />
              The gap between the strike price and the current stock price determines intrinsic
              value — only in-the-money options have it
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="size-4 text-primary mt-0.5 shrink-0" />
              More time remaining until expiration means more time value in the premium
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="size-4 text-primary mt-0.5 shrink-0" />
              Time decay is not linear — it accelerates sharply in the final 30 days and is steepest
              for at-the-money options
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="size-4 text-primary mt-0.5 shrink-0" />
              Changing the strike or expiration shifts the balance between intrinsic value and time
              value, altering the premium and risk profile
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="size-4 text-primary mt-0.5 shrink-0" />
              The options chain organizes all available contracts by strike and expiration so you
              can compare them side by side
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
