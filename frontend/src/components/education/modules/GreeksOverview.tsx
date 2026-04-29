import { useNavigate, useParams } from 'react-router-dom';
import ModuleNavigation from '@/components/education/ModuleNavigation';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  TrendingUp,
  BarChart3,
  Clock,
  Activity,
  Gauge,
  Info,
  CheckCircle2,
  ExternalLink,
  Layers,
  DollarSign,
  Percent,
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
          This module introduces the four main Greeks —{' '}
          <strong className="text-foreground">Delta</strong>,{' '}
          <strong className="text-foreground">Gamma</strong>,{' '}
          <strong className="text-foreground">Theta</strong>, and{' '}
          <strong className="text-foreground">Vega</strong> — at a high level. The goal is to
          understand what each Greek measures and why it matters when evaluating options contracts.
          Each Greek has its own dedicated deep-dive module later in the sequence.
        </p>
      </div>
    </div>
  );
}

// ── Greek overview card ───────────────────────────────────────────────────────
function GreekCard({
  icon,
  name,
  measures,
  description,
  example,
}: {
  icon: React.ReactNode;
  name: string;
  measures: string;
  description: string;
  example: string;
}) {
  return (
    <div className="rounded-lg border bg-card p-4 mb-3">
      <div className="flex items-center gap-2 mb-2">
        <div className="p-1 rounded bg-primary/10 text-primary shrink-0">{icon}</div>
        <p className="text-sm font-semibold">{name}</p>
        <span className="text-xs text-muted-foreground ml-auto">{measures}</span>
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
      <div className="mt-2 rounded-md bg-muted/50 px-3 py-2">
        <p className="text-xs text-muted-foreground leading-relaxed">
          <span className="font-medium text-foreground">Example: </span>
          {example}
        </p>
      </div>
    </div>
  );
}

// ── Greeks reference table ────────────────────────────────────────────────────
function GreeksReferenceTable() {
  const rows = [
    {
      greek: 'Delta',
      measures: 'Price sensitivity to underlying',
      per: '$1 stock move',
      range: '0 to ±1.00',
      highest: 'Deep ITM',
    },
    {
      greek: 'Gamma',
      measures: 'Rate of change of Delta',
      per: '$1 stock move',
      range: 'Positive for buyers',
      highest: 'ATM, near expiry',
    },
    {
      greek: 'Theta',
      measures: 'Time decay per day',
      per: '1 calendar day',
      range: 'Negative for buyers',
      highest: 'ATM, near expiry',
    },
    {
      greek: 'Vega',
      measures: 'Sensitivity to implied volatility',
      per: '1% IV change',
      range: 'Positive for buyers',
      highest: 'ATM, longer-dated',
    },
  ];

  return (
    <div className="rounded-xl border overflow-hidden my-4">
      <div className="grid grid-cols-5 bg-muted text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        <div className="px-3 py-2">Greek</div>
        <div className="px-3 py-2 border-l">Measures</div>
        <div className="px-3 py-2 border-l">Per</div>
        <div className="px-3 py-2 border-l">Sign</div>
        <div className="px-3 py-2 border-l">Highest When</div>
      </div>
      {rows.map((row, i) => (
        <div
          key={i}
          className={`grid grid-cols-5 text-sm ${i % 2 === 0 ? 'bg-card' : 'bg-muted/30'}`}
        >
          <div className="px-3 py-3 font-medium">{row.greek}</div>
          <div className="px-3 py-3 border-l text-muted-foreground">{row.measures}</div>
          <div className="px-3 py-3 border-l text-muted-foreground">{row.per}</div>
          <div className="px-3 py-3 border-l text-muted-foreground">{row.range}</div>
          <div className="px-3 py-3 border-l text-muted-foreground">{row.highest}</div>
        </div>
      ))}
    </div>
  );
}

// ── Options chain callout ─────────────────────────────────────────────────────
function OptionsChainCallout() {
  return (
    <div className="rounded-lg border border-blue-500/20 bg-blue-500/5 px-4 py-3 my-4 flex items-start gap-3">
      <BarChart3 className="size-4 text-blue-500 mt-0.5 shrink-0" />
      <div>
        <p className="text-sm font-semibold text-blue-500">Greeks in the Options Chain</p>
        <p className="text-sm text-muted-foreground mt-0.5">
          When viewing an options chain, you'll typically see Delta, Gamma, Theta, and Vega
          displayed as columns alongside the bid, ask, and volume for each strike. These values
          update continuously during market hours as the underlying price, time, and implied
          volatility change. In InvestEd's trading interface, you can use these columns to compare
          contracts before placing a trade.
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
        <p className="text-sm font-semibold text-primary">Up Next: Strike Price & Expiration</p>
        <p className="text-sm text-muted-foreground mt-0.5">
          In the next module we'll take a closer look at how strike price and expiration date
          influence an option's value — including how to read an options chain, how moneyness
          affects pricing, and how time remaining impacts the premium you pay.
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
          href="https://www.optionseducation.org/advancedconcepts/understanding-options-greeks"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-foreground transition-colors"
        >
          Understanding Options Greeks
        </a>
        ,{' '}
        <a
          href="https://www.optionseducation.org/advancedconcepts/delta"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-foreground transition-colors"
        >
          Delta
        </a>
        ,{' '}
        <a
          href="https://www.optionseducation.org/advancedconcepts/gamma"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-foreground transition-colors"
        >
          Gamma
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
        ,{' '}
        <a
          href="https://www.optionseducation.org/advancedconcepts/vega"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-foreground transition-colors"
        >
          Vega
        </a>
        , and{' '}
        <a
          href="https://www.optionseducation.org/advancedconcepts/volatility-the-greeks"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-foreground transition-colors"
        >
          Volatility & the Greeks
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
export default function GreeksOverview() {
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
              Module 04
            </span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Greeks Overview</h1>
          <p className="text-muted-foreground mt-2">
            An introduction to the four main Greeks — the key metrics for understanding how an
            option's price may change.
          </p>
        </div>

        {/* Scope callout */}
        <ScopeCallout />

        {/* ── What Are the Greeks? ─────────────────────────────────────────── */}
        <Section icon={<Gauge className="size-4" />} title="What Are the Greeks?">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Options prices are determined by pricing models — standard mathematical formulas that
            take several inputs and produce a theoretical value for a contract. The{' '}
            <strong className="text-foreground">Greeks</strong> are a set of metrics derived from
            these models that estimate how much an option's premium may change when one of those
            inputs changes — while all other inputs stay the same.
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed mt-3">
            Greeks are not a guarantee of exact price changes. They are theoretical guideposts that
            give you an estimate of how an option may behave under different conditions. Think of
            them as a dashboard of gauges — each one tracks a different factor that can influence
            your position's value.
          </p>
        </Section>

        {/* ── The Pricing Inputs ───────────────────────────────────────────── */}
        <Section icon={<Layers className="size-4" />} title="The Pricing Inputs">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Options pricing models use six inputs to calculate a contract's theoretical value. Some
            of these you've already encountered — others are new.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-4">
            <div className="flex items-start gap-3 rounded-lg border bg-card p-3">
              <div className="mt-0.5 p-1.5 rounded bg-primary/10 text-primary shrink-0">
                <TrendingUp className="size-4" />
              </div>
              <div>
                <div className="text-sm font-semibold">Stock Price</div>
                <div className="text-xs text-muted-foreground">
                  The current market price of the underlying stock or ETF the option is based on.
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-lg border bg-card p-3">
              <div className="mt-0.5 p-1.5 rounded bg-primary/10 text-primary shrink-0">
                <DollarSign className="size-4" />
              </div>
              <div>
                <div className="text-sm font-semibold">Strike Price</div>
                <div className="text-xs text-muted-foreground">
                  The agreed-upon price at which the option holder can buy or sell the underlying
                  shares.
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-lg border bg-card p-3">
              <div className="mt-0.5 p-1.5 rounded bg-primary/10 text-primary shrink-0">
                <Clock className="size-4" />
              </div>
              <div>
                <div className="text-sm font-semibold">Time to Expiration</div>
                <div className="text-xs text-muted-foreground">
                  The amount of time remaining until the contract expires, expressed as a portion of
                  a year.
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-lg border bg-card p-3">
              <div className="mt-0.5 p-1.5 rounded bg-primary/10 text-primary shrink-0">
                <Activity className="size-4" />
              </div>
              <div>
                <div className="text-sm font-semibold">Implied Volatility</div>
                <div className="text-xs text-muted-foreground">
                  The market's expectation of how much the underlying price may move in the future.
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-lg border bg-card p-3">
              <div className="mt-0.5 p-1.5 rounded bg-primary/10 text-primary shrink-0">
                <Percent className="size-4" />
              </div>
              <div>
                <div className="text-sm font-semibold">Interest Rate</div>
                <div className="text-xs text-muted-foreground">
                  The current risk-free interest rate, which has a relatively small effect on most
                  equity options.
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-lg border bg-card p-3">
              <div className="mt-0.5 p-1.5 rounded bg-primary/10 text-primary shrink-0">
                <DollarSign className="size-4" />
              </div>
              <div>
                <div className="text-sm font-semibold">Expected Dividends</div>
                <div className="text-xs text-muted-foreground">
                  Anticipated ordinary dividends on the underlying stock during the life of the
                  contract.
                </div>
              </div>
            </div>
          </div>

          <p className="text-sm text-muted-foreground leading-relaxed mt-3">
            Stock price and strike price change the relationship between where the stock is trading
            and the price at which the option can be exercised. But two of these inputs deserve a
            closer look because they introduce new concepts:{' '}
            <strong className="text-foreground">time value</strong> and{' '}
            <strong className="text-foreground">implied volatility</strong>.
          </p>

          <Term
            word="Time Value (Extrinsic Value)"
            definition="The portion of an option's premium that reflects the time remaining until expiration. More time means more opportunity for the underlying stock to move favorably, so options with more time remaining are worth more — all else being equal. As expiration approaches, time value decreases. Short-dated options — those with only days until expiration — experience the steepest rate of time decay."
          />

          <Term
            word="Implied Volatility (IV)"
            definition="A forward-looking measure of how much the market expects the underlying stock's price to move, derived from the current price of the option itself. Higher implied volatility means the market anticipates larger price swings, which increases the option's premium. IV is different from historical volatility, which measures how much the stock has actually moved in the past."
          />

          <p className="text-sm text-muted-foreground leading-relaxed mt-3">
            All six inputs are used together in the pricing model to calculate an option's
            theoretical value. This module focuses on the four Greeks that measure sensitivity to
            stock price, Delta movement, time, and implied volatility. Greeks also exist for
            interest rate and dividend sensitivity, but they tend to have a smaller impact on most
            equity option premiums and won't be covered in this module.
          </p>
        </Section>

        {/* ── Why Greeks Matter ────────────────────────────────────────────── */}
        <Section icon={<BarChart3 className="size-4" />} title="Why Greeks Matter">
          <p className="text-sm text-muted-foreground leading-relaxed">
            When you look at an options contract, the premium alone doesn't tell you how that
            contract might behave tomorrow, next week, or if the stock moves $5. The Greeks fill
            that gap. They give you a set of gauges — like a dashboard — that help you understand
            your position's exposure to different types of risk.
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed mt-3">
            With the Greeks, you can answer questions like:
          </p>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">→</span>
              <span>How much will this option's price move if the stock goes up $1?</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">→</span>
              <span>How much value am I losing each day just from the passage of time?</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">→</span>
              <span>What happens to my position if implied volatility increases or decreases?</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">→</span>
              <span>How quickly will my option's price sensitivity change as the stock moves?</span>
            </li>
          </ul>
          <p className="text-sm text-muted-foreground leading-relaxed mt-3">
            Understanding the Greeks also helps when comparing two contracts on the same underlying.
            A contract with higher Delta gives you more price sensitivity but may cost more. A
            contract with higher Theta is losing time value faster. These tradeoffs are what the
            Greeks help you evaluate.
          </p>
        </Section>

        {/* ── The Four Main Greeks ─────────────────────────────────────────── */}
        <Section icon={<TrendingUp className="size-4" />} title="The Four Main Greeks">
          <p className="text-sm text-muted-foreground leading-relaxed mb-4">
            Each Greek isolates the impact of one pricing input on the option's premium, assuming
            everything else stays constant.
          </p>

          <GreekCard
            icon={<TrendingUp className="size-4" />}
            name="Delta (Δ)"
            measures="Price sensitivity"
            description="Delta estimates how much an option's premium will change for a $1 move in the underlying stock. Call options have positive Delta (0 to +1.00) — their value increases as the stock rises. Put options have negative Delta (0 to −1.00) — their value increases as the stock falls. An at-the-money option typically has a Delta near 0.50."
            example="A call with a Delta of 0.50 is expected to gain about $0.50 in premium if the underlying stock rises $1, all else being equal. The same option would be expected to lose about $0.50 if the stock falls $1."
          />

          <GreekCard
            icon={<Activity className="size-4" />}
            name="Gamma (Γ)"
            measures="Rate of Delta change"
            description="Gamma measures how much Delta itself is expected to change for a $1 move in the underlying. It tells you how stable or unstable your Delta exposure is. Gamma is highest for at-the-money options that are close to expiration, where small stock moves can cause large shifts in Delta."
            example="A call has a Delta of 0.50 and Gamma of 0.06. If the stock rises $1, the new Delta is estimated to be around 0.56. If the stock falls $1 instead, the new Delta would be around 0.44."
          />

          <GreekCard
            icon={<Clock className="size-4" />}
            name="Theta (Θ)"
            measures="Time decay"
            description="Theta estimates how much an option's premium decreases with each passing day, all else being equal. For long options, Theta is expressed as a negative number — time works against the buyer. Time decay is not linear; it tends to accelerate as expiration approaches, with the most rapid decay occurring in the final 30 days."
            example="An option with a Theta of −0.05 is expected to lose about $0.05 in premium per day. If nothing else changes over five days, the option would lose roughly $0.25 in time value."
          />

          <GreekCard
            icon={<Gauge className="size-4" />}
            name="Vega (ν)"
            measures="Volatility sensitivity"
            description="Vega estimates how much an option's premium will change for a 1% change in implied volatility. Higher implied volatility increases option premiums, and lower implied volatility decreases them. Longer-dated options tend to have higher Vega because there is more time for volatility to influence the outcome."
            example="An option with a Vega of 0.15 is expected to gain $0.15 in premium if implied volatility rises 1%, or lose $0.15 if implied volatility drops 1%, all else being equal."
          />
        </Section>

        {/* ── Greeks at a Glance ───────────────────────────────────────────── */}
        <Section icon={<Layers className="size-4" />} title="Greeks at a Glance">
          <p className="text-sm text-muted-foreground leading-relaxed mb-2">
            Use this table as a quick reference for the four main Greeks.
          </p>
          <GreeksReferenceTable />
          <p className="text-xs text-muted-foreground mt-2 italic">
            Signs shown are for the buyer of the contract — the person who paid the premium. Sellers
            see the opposite signs. For example, Theta is positive for sellers because time decay
            works in their favor.
          </p>
          <p className="text-xs text-muted-foreground mt-1 italic">
            These are theoretical values derived from pricing models. Actual premium changes may
            differ due to simultaneous changes in multiple inputs.
          </p>
        </Section>

        {/* ── Greeks in the Options Chain ───────────────────────────────────── */}
        <Section icon={<BarChart3 className="size-4" />} title="Reading Greeks in Practice">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Greeks aren't just theoretical — they're displayed alongside every contract in an
            options chain and update continuously as market conditions change.
          </p>
          <OptionsChainCallout />
          <p className="text-sm text-muted-foreground leading-relaxed mt-3">
            As you become more comfortable with the Greeks, you'll start to notice patterns: options
            closer to at-the-money tend to have the highest Gamma and Theta, while deeper
            in-the-money options have Delta values closer to 1.00. These patterns will become more
            intuitive as you work through the dedicated modules for each Greek.
          </p>
        </Section>

        {/* ── Summary ──────────────────────────────────────────────────────── */}
        <div className="rounded-xl border bg-card p-5 mb-8">
          <h3 className="font-semibold mb-3">Summary</h3>
          <ul className="space-y-1.5 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="size-4 text-primary mt-0.5 shrink-0" />
              The Greeks are theoretical metrics that estimate how an option's price may change when
              a pricing input changes
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="size-4 text-primary mt-0.5 shrink-0" />
              Delta measures price sensitivity to stock movement; Gamma measures how quickly Delta
              changes
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="size-4 text-primary mt-0.5 shrink-0" />
              Theta measures daily time decay; Vega measures sensitivity to implied volatility
              changes
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="size-4 text-primary mt-0.5 shrink-0" />
              Time value reflects the premium attributed to time remaining — more time means higher
              premium
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="size-4 text-primary mt-0.5 shrink-0" />
              Implied volatility is the market's expectation of future price movement and directly
              impacts option pricing
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="size-4 text-primary mt-0.5 shrink-0" />
              Greeks appear in the options chain alongside each contract and update in real time
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
