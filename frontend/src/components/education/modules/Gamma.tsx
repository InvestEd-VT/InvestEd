import { useNavigate, useParams } from 'react-router-dom';
import ModuleNavigation from '@/components/education/ModuleNavigation';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Info,
  ExternalLink,
  Activity,
  BarChart3,
  Layers,
  TrendingUp,
  Zap,
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

// ── Term callout ──────────────────────────────────────────────────────────────
function Term({ word, definition }: { word: string; definition: string }) {
  return (
    <div className="rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 my-3">
      <span className="font-semibold text-primary text-sm">{word}</span>
      <p className="text-sm text-muted-foreground mt-0.5">{definition}</p>
    </div>
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
          Gamma was introduced in the Greeks Overview and referenced in the Delta module. This
          module goes deeper — how Gamma determines the rate of Delta change, the difference between
          positive and negative Gamma, why Gamma spikes near expiration, and what it means for
          position risk on InvestEd's 0–14 DTE contracts.
        </p>
      </div>
    </div>
  );
}

// ── Delta + Gamma diagram ─────────────────────────────────────────────────────
function DeltaGammaDiagram() {
  const rows = [
    {
      move: 'Stock rises +$1',
      start: '+0.50',
      gamma: '+0.06',
      result: '+0.56',
      dir: 'up',
      note: 'Delta increases — option becomes more sensitive to further upside',
    },
    {
      move: 'Stock falls −$1',
      start: '+0.50',
      gamma: '−0.06',
      result: '+0.44',
      dir: 'down',
      note: 'Delta decreases — option becomes less sensitive to further downside',
    },
  ];

  return (
    <div className="rounded-xl border bg-card p-5 my-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
        ATM Call — Delta 0.50, Gamma 0.06
      </p>
      <p className="text-xs text-muted-foreground mb-4">
        Hypothetical values. Shows how Gamma updates Delta after a $1 move.
      </p>
      <div className="space-y-3">
        {rows.map((row) => (
          <div
            key={row.move}
            className={`rounded-lg border p-4 ${
              row.dir === 'up'
                ? 'border-emerald-500/20 bg-emerald-500/5'
                : 'border-destructive/20 bg-destructive/5'
            }`}
          >
            <p
              className={`text-xs font-semibold mb-3 ${
                row.dir === 'up' ? 'text-emerald-600' : 'text-destructive'
              }`}
            >
              {row.move}
            </p>
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <div className="rounded-md bg-muted/60 px-3 py-1.5 text-center">
                <p className="text-xs text-muted-foreground">Starting Delta</p>
                <p className="text-sm font-bold text-foreground">{row.start}</p>
              </div>
              <span className="text-muted-foreground text-sm font-medium">+</span>
              <div className="rounded-md bg-muted/60 px-3 py-1.5 text-center">
                <p className="text-xs text-muted-foreground">Gamma</p>
                <p
                  className={`text-sm font-bold ${
                    row.dir === 'up' ? 'text-emerald-600' : 'text-destructive'
                  }`}
                >
                  {row.gamma}
                </p>
              </div>
              <span className="text-muted-foreground text-sm font-medium">=</span>
              <div className="rounded-md bg-primary/10 px-3 py-1.5 text-center">
                <p className="text-xs text-muted-foreground">New Delta</p>
                <p className="text-sm font-bold text-primary">{row.result}</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">{row.note}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Positive vs negative Gamma cards ─────────────────────────────────────────
function GammaSignCards() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-4">
      <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600 mb-2">
          Positive Gamma — Buyers
        </p>
        <p className="text-sm text-muted-foreground leading-relaxed mb-3">
          Buying a call or put always gives you positive Gamma. Regardless of which direction the
          stock moves, Gamma is working in your favor.
        </p>
        <div className="space-y-2 text-xs text-muted-foreground">
          <div className="flex gap-2">
            <span className="text-emerald-600 font-bold shrink-0">→</span>
            <span>
              Stock moves in your favor — Delta grows, accelerating your gains with each additional
              dollar the stock moves
            </span>
          </div>
          <div className="flex gap-2">
            <span className="text-emerald-600 font-bold shrink-0">→</span>
            <span>
              Stock moves against you — Delta shrinks, decelerating your losses — each additional
              dollar against you hurts less than the last
            </span>
          </div>
        </div>
      </div>
      <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-destructive mb-2">
          Negative Gamma — Sellers
        </p>
        <p className="text-sm text-muted-foreground leading-relaxed mb-3">
          Selling an option always gives you negative Gamma. Regardless of direction, Gamma is
          working against you if the stock makes a large move.
        </p>
        <div className="space-y-2 text-xs text-muted-foreground">
          <div className="flex gap-2">
            <span className="text-destructive font-bold shrink-0">→</span>
            <span>
              Stock moves against you — Delta grows in the wrong direction, accelerating losses with
              each additional dollar the stock moves
            </span>
          </div>
          <div className="flex gap-2">
            <span className="text-destructive font-bold shrink-0">→</span>
            <span>
              Stock moves in your favor — Delta shrinks, decelerating gains — each additional dollar
              in your favor helps less than the last
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Gamma by DTE bar chart ────────────────────────────────────────────────────
const GAMMA_DTE = [
  { dte: '30 DTE', gamma: 0.018, pct: 18 },
  { dte: '14 DTE', gamma: 0.026, pct: 28 },
  { dte: '7 DTE', gamma: 0.038, pct: 42 },
  { dte: '3 DTE', gamma: 0.062, pct: 68 },
  { dte: '1 DTE', gamma: 0.14, pct: 100 },
];

function GammaExpirationChart() {
  return (
    <div className="rounded-xl border bg-card p-5 my-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
        Gamma vs. Time to Expiration — ATM Option
      </p>
      <p className="text-xs text-muted-foreground mb-5">
        Hypothetical Gamma values as the same ATM contract approaches expiration.
      </p>
      <div className="space-y-3">
        {GAMMA_DTE.map((row) => (
          <div key={row.dte} className="flex items-center gap-3">
            <div className="w-14 text-xs text-muted-foreground text-right shrink-0">{row.dte}</div>
            <div className="flex-1 h-7 rounded bg-muted/40 overflow-hidden">
              <div
                className="h-full bg-primary/60 rounded transition-all flex items-center px-2"
                style={{ width: `${row.pct}%` }}
              >
                <span className="text-xs font-semibold text-primary-foreground">
                  {row.gamma.toFixed(3)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
      <p className="text-xs text-muted-foreground mt-4 leading-relaxed">
        With the stock sitting right at the strike on expiration day, Gamma can spike to extremely
        high levels — Delta may flip from near 0 to near 1.00 (or vice versa) as the stock crosses
        the strike, sometimes within minutes.
      </p>
    </div>
  );
}

// ── Gamma selection tiers ─────────────────────────────────────────────────────
const GAMMA_TIERS = [
  {
    label: 'High Gamma',
    sub: 'ATM, near expiration',
    border: 'border-primary/20',
    bg: 'bg-primary/5',
    text: 'text-primary',
    when: 'Strongly bullish on a call (or strongly bearish on a put) with high conviction that a move will happen quickly. If the stock moves in your direction, Delta accelerates in your favor — gains compound faster than the initial Delta suggested. The flip side: if the stock moves against you, Delta shrinks just as fast.',
    points: [
      'Maximum Delta acceleration on a favorable move',
      'Requires a quick, decisive move to pay off',
      'Position can change value rapidly — needs attention',
      'Highest risk if the stock stalls or reverses',
    ],
  },
  {
    label: 'Moderate Gamma',
    sub: 'Slightly ITM or OTM, more time remaining',
    border: 'border-blue-500/20',
    bg: 'bg-blue-500/5',
    text: 'text-blue-500',
    when: "Bullish on a call (or bearish on a put) expecting a move but less certain about timing. Delta is more stable and won't accelerate as dramatically in either direction. More predictable exposure — a better fit when you expect a move but want time for it to develop.",
    points: [
      'Delta changes more gradually with stock movement',
      'More forgiving if the stock takes time to move',
      'Position sensitivity is more consistent',
      'Less explosive on a quick move, less punishing on a reversal',
    ],
  },
  {
    label: 'Low Gamma',
    sub: 'Deep ITM or deep OTM',
    border: 'border-muted',
    bg: 'bg-muted/30',
    text: 'text-muted-foreground',
    when: "Deep ITM: bullish or bearish with stable, stock-like exposure. Delta is already high and won't shift dramatically. Deep OTM: the position won't respond meaningfully to small moves — a large swing is needed before Gamma starts to matter. Very different risk profiles despite both having low Gamma.",
    points: [
      'Deep ITM: Delta is stable, position behaves like stock',
      'Deep OTM: minimal response until a large move occurs',
      'Lowest acceleration risk in either direction',
      'Position sensitivity changes slowly',
    ],
  },
];

function GammaTiers() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-4">
      {GAMMA_TIERS.map((t) => (
        <div key={t.label} className={`rounded-lg border ${t.border} ${t.bg} p-4`}>
          <p className={`text-xs font-semibold uppercase tracking-wider ${t.text} mb-0.5`}>
            {t.label}
          </p>
          <p className="text-xs text-muted-foreground mb-2">{t.sub}</p>
          <p className="text-xs text-muted-foreground leading-relaxed mb-3">{t.when}</p>
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

// ── Generic chain table ───────────────────────────────────────────────────────
const CHAIN_ROWS = [
  { strike: '$195.00', type: 'Call', delta: '+0.70', gamma: '0.032', premium: '$8.20', dte: '7d' },
  { strike: '$197.50', type: 'Call', delta: '+0.60', gamma: '0.041', premium: '$6.35', dte: '7d' },
  { strike: '$200.00', type: 'Call', delta: '+0.50', gamma: '0.048', premium: '$4.80', dte: '7d' },
  { strike: '$202.50', type: 'Call', delta: '+0.40', gamma: '0.044', premium: '$3.42', dte: '7d' },
  { strike: '$205.00', type: 'Call', delta: '+0.29', gamma: '0.035', premium: '$2.15', dte: '7d' },
  { strike: '$207.50', type: 'Call', delta: '+0.19', gamma: '0.024', premium: '$1.22', dte: '7d' },
];

function GenericChainCallout() {
  return (
    <div className="rounded-xl border bg-card overflow-hidden my-4">
      <div className="px-4 py-2.5 bg-muted text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Options Chain Example — Calls, 7 DTE
      </div>
      <div className="overflow-x-auto">
        <div className="min-w-[480px]">
          <div className="grid grid-cols-6 text-xs font-semibold uppercase tracking-wider text-muted-foreground border-b">
            <div className="px-4 py-2">Strike</div>
            <div className="px-4 py-2 border-l">Type</div>
            <div className="px-4 py-2 border-l">Delta</div>
            <div className="px-4 py-2 border-l bg-primary/5 text-primary">Gamma</div>
            <div className="px-4 py-2 border-l">Premium</div>
            <div className="px-4 py-2 border-l">DTE</div>
          </div>
          {CHAIN_ROWS.map((row, i) => (
            <div
              key={i}
              className={`grid grid-cols-6 text-sm ${i % 2 === 0 ? 'bg-card' : 'bg-muted/20'}`}
            >
              <div className="px-4 py-2.5 font-medium">{row.strike}</div>
              <div className="px-4 py-2.5 border-l text-muted-foreground">{row.type}</div>
              <div className="px-4 py-2.5 border-l text-muted-foreground">{row.delta}</div>
              <div className="px-4 py-2.5 border-l bg-primary/5 font-semibold text-foreground">
                {row.gamma}
              </div>
              <div className="px-4 py-2.5 border-l text-emerald-600 font-medium">{row.premium}</div>
              <div className="px-4 py-2.5 border-l text-muted-foreground">{row.dte}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="px-4 py-3 border-t bg-muted/20 text-xs text-muted-foreground">
        Gamma peaks at the $200.00 ATM strike (0.048) and decreases as strikes move further ITM or
        OTM in either direction.
      </div>
    </div>
  );
}

// ── Platform note ─────────────────────────────────────────────────────────────
function PlatformNote() {
  return (
    <div className="rounded-lg border border-border bg-muted/40 px-4 py-3 mt-4 flex items-start gap-3">
      <Info className="size-4 text-muted-foreground mt-0.5 shrink-0" />
      <p className="text-sm text-muted-foreground">
        Gamma is not displayed in InvestEd's trade page when selecting contracts. Once you've opened
        a position, you can find Gamma in the position detail view on the portfolio page alongside
        the full Greeks panel for that contract.
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
        <p className="text-sm font-semibold text-primary">Up Next: Theta</p>
        <p className="text-sm text-muted-foreground mt-0.5">
          The next module covers Theta — how an option loses value each day simply from the passage
          of time, why that decay accelerates near expiration, and what it means for buyers and
          sellers.
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
          href="https://www.optionseducation.org/advancedconcepts/gamma"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-foreground transition-colors"
        >
          Gamma
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
export default function Gamma() {
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
              Module 09
            </span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Gamma</h1>
          <p className="text-muted-foreground mt-2">
            How Gamma measures the rate of Delta change, why it spikes near expiration, and what it
            means for position risk on short-dated contracts.
          </p>
        </div>

        <ScopeCallout />

        {/* ── Gamma and Delta ──────────────────────────────────────────────── */}
        <Section icon={<Activity className="size-4" />} title="Gamma and Delta">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Gamma measures how much Delta is expected to change for a $1 move in the underlying
            stock. Delta tells you how much the premium moves — Gamma tells you how quickly that
            sensitivity is shifting. After each move in the stock, you can estimate a new Delta by
            adding or subtracting the Gamma from the current Delta.
          </p>

          <Term
            word="Gamma"
            definition="The expected change in an option's Delta for a $1 move in the underlying stock. A Gamma of 0.06 means Delta is expected to increase by 0.06 if the stock rises $1, or decrease by 0.06 if the stock falls $1."
          />

          <DeltaGammaDiagram />

          <p className="text-sm text-muted-foreground leading-relaxed">
            The key insight is that positive Gamma is asymmetric in the buyer's favor. When the
            stock moves in your direction, Delta grows — each additional $1 move gains you more than
            the last. When the stock moves against you, Delta shrinks — each additional $1 move
            hurts you less than the last.
          </p>
        </Section>

        {/* ── Positive and Negative Gamma ──────────────────────────────────── */}
        <Section icon={<TrendingUp className="size-4" />} title="Positive and Negative Gamma">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Buying an option — call or put — always gives you positive Gamma. Selling an option
            always gives you negative Gamma. The sign determines whether Delta is working with you
            or against you as the stock moves.
          </p>

          <GammaSignCards />

          <p className="text-sm text-muted-foreground leading-relaxed mt-2">
            This is one of the fundamental asymmetries between buyers and sellers. Buyers pay
            premium to own positive Gamma — the right for Delta to accelerate in their favor.
            Sellers collect premium but take on negative Gamma — the risk that Delta accelerates
            against them if the stock makes a large move.
          </p>
        </Section>

        {/* ── Where Gamma is Highest ───────────────────────────────────────── */}
        <Section icon={<Zap className="size-4" />} title="Where Gamma Is Highest">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Gamma is highest for at-the-money options close to expiration. As expiration approaches,
            the Delta of an ATM option becomes increasingly unstable — it needs to resolve to either
            0 (expires worthless) or 1.00 (expires with full intrinsic value), and that resolution
            happens faster and faster as time runs out.
          </p>

          <GammaExpirationChart />

          <p className="text-sm text-muted-foreground leading-relaxed">
            Deep ITM and deep OTM options have lower Gamma because their Delta is already near its
            endpoint — 1.00 or 0 respectively — and doesn't have far to travel. Gamma is highest
            when Delta is in the 0.40–0.60 range, where the outcome is most uncertain and Delta has
            the most room to move in either direction.
          </p>

          <p className="text-sm text-muted-foreground leading-relaxed mt-3">
            Implied volatility also affects Gamma. When IV is low, ATM Gamma increases — the market
            isn't pricing in large moves, so Delta shifts more sharply in response to each $1 in the
            stock. When IV is high, Gamma decreases — the market is already expecting larger swings,
            so Delta changes are more gradual for any given move. The same relationship holds for
            ITM and OTM options, though with less impact since their Gamma is already lower to begin
            with.
          </p>
        </Section>

        {/* ── Gamma and Position Risk ──────────────────────────────────────── */}
        <Section icon={<Layers className="size-4" />} title="Gamma and Position Risk">
          <p className="text-sm text-muted-foreground leading-relaxed mb-4">
            The Gamma level of a contract tells you how actively your position's sensitivity can
            change — and how much attention it requires. Different Gamma levels suit different
            outlooks and timeframes.
          </p>

          <GammaTiers />

          <p className="text-sm text-muted-foreground leading-relaxed mt-2">
            Gamma is less about direction and more about timing and conviction. Delta tells you what
            you're positioned for. Gamma tells you how sharply that position will respond if you're
            right — or wrong.
          </p>

          <div className="rounded-lg border border-border bg-muted/40 px-4 py-3 mt-4 flex items-start gap-3">
            <Info className="size-4 text-muted-foreground mt-0.5 shrink-0" />
            <p className="text-sm text-muted-foreground">
              On InvestEd, all contracts are 0–14 DTE — which means every position on the platform
              is operating in elevated Gamma territory. Delta can shift meaningfully within a single
              trading session, particularly for ATM contracts in the final days before expiration.
            </p>
          </div>
        </Section>

        {/* ── Gamma in the Options Chain ───────────────────────────────────── */}
        <Section icon={<BarChart3 className="size-4" />} title="Gamma in the Options Chain">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Gamma appears alongside Delta and other Greeks when viewing options data. The example
            below illustrates how Gamma peaks at the ATM strike and falls off as you move in either
            direction — a pattern that holds across any underlying at any expiration.
          </p>

          <GenericChainCallout />

          <PlatformNote />
        </Section>

        {/* Summary */}
        <div className="rounded-xl border bg-card p-5 mb-8">
          <h3 className="font-semibold mb-3">Summary</h3>
          <ul className="space-y-1.5 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="size-4 text-primary mt-0.5 shrink-0" />
              Gamma measures how much Delta is expected to change for a $1 move in the underlying
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="size-4 text-primary mt-0.5 shrink-0" />
              Long options always have positive Gamma — Delta accelerates in your favor on a
              favorable move and decelerates on an unfavorable one
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="size-4 text-primary mt-0.5 shrink-0" />
              Short options always have negative Gamma — Delta accelerates against you when the
              stock makes a large move
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="size-4 text-primary mt-0.5 shrink-0" />
              Gamma is highest for ATM options near expiration — Delta can flip rapidly as the stock
              crosses the strike
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="size-4 text-primary mt-0.5 shrink-0" />
              Deep ITM and deep OTM options have lower Gamma — Delta is already near its endpoint
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="size-4 text-primary mt-0.5 shrink-0" />
              Lower IV increases ATM Gamma; higher IV decreases Gamma across the chain
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="size-4 text-primary mt-0.5 shrink-0" />
              On InvestEd's 0–14 DTE contracts, all positions operate in elevated Gamma territory
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="size-4 text-primary mt-0.5 shrink-0" />
              Gamma is found in the position detail view on the portfolio page — not in the trade
              page options chain
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
