import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ModuleNavigation from '@/components/education/ModuleNavigation';
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Info,
  ExternalLink,
  Activity,
  BarChart3,
  TrendingUp,
  Clock,
  Layers,
  Wind,
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
          Vega and implied volatility were introduced in the Greeks Overview. This module goes
          deeper — how implied volatility is driven by supply and demand, how historical volatility
          compares to IV and what that gap can suggest, how Vega behaves differently on short-dated
          contracts, and how to use Vega exposure to find a contract that aligns with your outlook.
        </p>
      </div>
    </div>
  );
}

// ── Vega premium impact diagram ───────────────────────────────────────────────
function VegaPremiumDiagram() {
  const rows = [
    {
      scenario: 'IV rises +2% (30% → 32%)',
      vega: '0.15',
      change: '+0.15 × 2 = +$0.30',
      result: '$4.30',
      dir: 'up',
      note: 'Premium increases — rising volatility adds extrinsic value',
    },
    {
      scenario: 'IV falls −5% (30% → 25%)',
      vega: '0.15',
      change: '0.15 × 5 = −$0.75',
      result: '$3.25',
      dir: 'down',
      note: 'Premium decreases — falling volatility removes extrinsic value',
    },
  ];

  return (
    <div className="rounded-xl border bg-card p-5 my-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
        OICX — $50 Call, 12 Months to Expiration
      </p>
      <p className="text-xs text-muted-foreground mb-4">
        Hypothetical values. Base premium $4.00, IV 30%, Vega 0.15. Stock price unchanged.
      </p>
      <div className="space-y-3">
        {rows.map((row, i) => (
          <div key={i} className="rounded-lg border bg-background p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">{row.scenario}</span>
              <span
                className={`text-sm font-semibold ${row.dir === 'up' ? 'text-emerald-600' : 'text-red-500'}`}
              >
                New premium: {row.result}
              </span>
            </div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs text-muted-foreground font-mono bg-muted/60 px-2 py-0.5 rounded">
                {row.change}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">{row.note}</p>
          </div>
        ))}
      </div>
      <p className="text-xs text-muted-foreground mt-3 italic">
        Source: Options Industry Council — optionseducation.org/advancedconcepts/vega
      </p>
    </div>
  );
}

// ── Interactive IV slider ─────────────────────────────────────────────────────
function IVSlider() {
  const BASE_PREMIUM = 3.2;
  const BASE_IV = 25;
  const VEGA = 0.12;
  const [iv, setIv] = useState(BASE_IV);

  const ivDiff = iv - BASE_IV;
  const estimatedPremium = Math.max(0, BASE_PREMIUM + VEGA * ivDiff);
  const premiumDiff = estimatedPremium - BASE_PREMIUM;
  const isUp = premiumDiff >= 0;

  return (
    <div className="rounded-xl border bg-card p-5 my-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
        Interactive Example — ATM Call
      </p>
      <p className="text-xs text-muted-foreground mb-5">
        Hypothetical values. Base premium $3.20, Vega 0.12. Drag the slider to change IV and see the
        estimated effect on premium.
      </p>

      <div className="flex items-end justify-between mb-2">
        <div>
          <p className="text-xs text-muted-foreground">Implied Volatility</p>
          <p className="text-2xl font-bold tabular-nums">{iv}%</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">Estimated Premium</p>
          <p className="text-2xl font-bold tabular-nums">${estimatedPremium.toFixed(2)}</p>
        </div>
      </div>

      <input
        type="range"
        min={10}
        max={60}
        value={iv}
        onChange={(e) => setIv(Number(e.target.value))}
        className="w-full accent-primary cursor-pointer mb-4"
      />

      <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
        <span>10% — Low IV</span>
        <span>60% — High IV</span>
      </div>

      <div
        className={`rounded-lg border px-4 py-3 flex items-start gap-2 ${
          isUp ? 'border-emerald-500/20 bg-emerald-500/5' : 'border-red-500/20 bg-red-500/5'
        }`}
      >
        <span className={`text-sm font-semibold ${isUp ? 'text-emerald-600' : 'text-red-500'}`}>
          {isUp ? '+' : ''}
          {premiumDiff.toFixed(2)}
        </span>
        <p className="text-sm text-muted-foreground">
          {Math.abs(ivDiff) < 0.5
            ? 'IV is at the base level — no change in estimated premium.'
            : `IV ${isUp ? 'increased' : 'decreased'} by ${Math.abs(ivDiff)} percentage point${Math.abs(ivDiff) !== 1 ? 's' : ''}. Vega of 0.12 × ${Math.abs(ivDiff)} = ${isUp ? '+' : '−'}$${Math.abs(VEGA * ivDiff).toFixed(2)} estimated change.`}
        </p>
      </div>

      <p className="text-xs text-muted-foreground mt-3 italic">
        In practice, multiple inputs change simultaneously. This example isolates the Vega effect
        only.
      </p>
    </div>
  );
}

// ── Vega vs DTE comparison ────────────────────────────────────────────────────
function VegaDTETable() {
  const rows = [
    { dte: '180 DTE', vega: '0.28', impact: '+$0.28 per 1% IV move', relative: 'High' },
    { dte: '60 DTE', vega: '0.16', impact: '+$0.16 per 1% IV move', relative: 'Moderate' },
    { dte: '14 DTE', vega: '0.07', impact: '+$0.07 per 1% IV move', relative: 'Low' },
    { dte: '3 DTE', vega: '0.03', impact: '+$0.03 per 1% IV move', relative: 'Very low' },
  ];

  return (
    <div className="rounded-xl border overflow-hidden my-4">
      <div className="grid grid-cols-4 bg-muted text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        <div className="px-3 py-2">DTE</div>
        <div className="px-3 py-2 border-l">Vega</div>
        <div className="px-3 py-2 border-l">Impact per 1% IV</div>
        <div className="px-3 py-2 border-l">Sensitivity</div>
      </div>
      {rows.map((row, i) => (
        <div
          key={i}
          className={`grid grid-cols-4 text-sm border-t ${i === 2 || i === 3 ? 'bg-primary/5' : ''}`}
        >
          <div className="px-3 py-2.5 font-medium">{row.dte}</div>
          <div className="px-3 py-2.5 border-l font-mono">{row.vega}</div>
          <div className="px-3 py-2.5 border-l text-muted-foreground">{row.impact}</div>
          <div className="px-3 py-2.5 border-l text-muted-foreground">{row.relative}</div>
        </div>
      ))}
      <div className="px-3 py-2 border-t bg-muted/20 text-xs text-muted-foreground">
        Hypothetical values for an ATM call on the same underlying. Vega decreases as time to
        expiration shortens.
      </div>
    </div>
  );
}

// ── Options chain callout ─────────────────────────────────────────────────────
function OptionsChainCallout() {
  const rows = [
    {
      strike: '$195.00',
      type: 'Call',
      iv: '24.2%',
      vega: '0.04',
      delta: '+0.72',
      premium: '$6.80',
      atm: false,
    },
    {
      strike: '$197.50',
      type: 'Call',
      iv: '25.1%',
      vega: '0.06',
      delta: '+0.58',
      premium: '$4.90',
      atm: false,
    },
    {
      strike: '$200.00',
      type: 'Call',
      iv: '25.8%',
      vega: '0.07',
      delta: '+0.50',
      premium: '$3.40',
      atm: true,
    },
    {
      strike: '$202.50',
      type: 'Call',
      iv: '25.3%',
      vega: '0.06',
      delta: '+0.38',
      premium: '$2.20',
      atm: false,
    },
    {
      strike: '$205.00',
      type: 'Call',
      iv: '24.6%',
      vega: '0.04',
      delta: '+0.26',
      premium: '$1.15',
      atm: false,
    },
  ];

  return (
    <div className="rounded-xl border overflow-hidden my-4">
      <div className="px-4 py-2.5 bg-muted border-b">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Options Chain — 7 DTE (Hypothetical)
        </p>
      </div>
      <div className="overflow-x-auto">
        <div className="min-w-[480px]">
          <div className="grid grid-cols-6 bg-muted/50 text-xs font-semibold uppercase tracking-wider text-muted-foreground border-b">
            <div className="px-3 py-2">Strike</div>
            <div className="px-3 py-2 border-l">Type</div>
            <div className="px-3 py-2 border-l bg-primary/10 text-primary">IV %</div>
            <div className="px-3 py-2 border-l bg-primary/10 text-primary">Vega</div>
            <div className="px-3 py-2 border-l">Delta</div>
            <div className="px-3 py-2 border-l">Premium</div>
          </div>
          {rows.map((row, i) => (
            <div
              key={i}
              className={`grid grid-cols-6 text-sm border-t ${row.atm ? 'bg-card font-medium' : 'bg-muted/20'}`}
            >
              <div className="px-3 py-2.5">
                {row.strike}
                {row.atm && <span className="ml-1.5 text-xs text-primary font-normal">ATM</span>}
              </div>
              <div className="px-3 py-2.5 border-l text-muted-foreground">{row.type}</div>
              <div className="px-3 py-2.5 border-l bg-primary/5 font-semibold text-foreground">
                {row.iv}
              </div>
              <div className="px-3 py-2.5 border-l bg-primary/5 font-semibold text-foreground">
                {row.vega}
              </div>
              <div className="px-3 py-2.5 border-l text-muted-foreground">{row.delta}</div>
              <div className="px-3 py-2.5 border-l text-emerald-600 font-medium">{row.premium}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="px-4 py-3 border-t bg-muted/20 text-xs text-muted-foreground">
        Vega and IV both peak near the ATM strike ($200.00) and decrease as strikes move further in
        or out of the money.
      </div>
    </div>
  );
}

// ── Contract selection cards ──────────────────────────────────────────────────
function ContractSelectionCards() {
  const cards = [
    {
      title: 'Expecting a Large Move',
      sub: 'High conviction on direction, catalyst approaching',
      body: "Say HV has been running at 18% and IV is currently at 32% — elevated heading into an earnings report. The market is pricing in a significant move. A higher-Vega ATM contract will carry more IV sensitivity, meaning if IV rises further as the event approaches, the premium expands more than it would on a lower-Vega contract. The Vega exposure works in the buyer's favor as long as IV continues to rise or holds — but if the event passes and IV collapses, that same exposure works against the position even if the stock moved in the right direction.",
      note: 'When IV is already elevated relative to HV heading into a catalyst, a meaningful portion of the expected move may already be priced in.',
    },
    {
      title: 'Expecting Little or No Move',
      sub: 'Catalyst has passed, stock appears range-bound',
      body: 'Say HV is at 28% — reflecting a volatile stretch around a recent earnings release — but IV has dropped to 12% now that results are published and uncertainty has resolved. The event has passed and the stock is expected to stay range-bound. A seller in this environment collects premium at current IV levels. A lower-Vega contract is generally preferable here — it limits exposure to further IV movement, so if IV continues to compress, the seller retains more of the premium collected than they would holding a higher-Vega contract.',
      note: 'Outside research matters here. If HV is elevated because of a one-time event that has passed, that context changes how to read the HV/IV gap.',
    },
    {
      title: 'Uncertain on Direction, IV Appears Low',
      sub: 'No strong directional view, IV low relative to HV',
      body: 'Say HV is at 30% and IV is at 11% — the stock has been moving significantly but current option premiums are priced for relatively little movement. Some investors interpret this as premiums being cheap relative to recent realized volatility and look to buy options with higher Vega exposure, with the expectation that IV may rise toward its recent average. A Vega of 0.10 on a contract means each 1% IV increase adds $0.10 to the premium — a 10-point IV expansion from 11% to 21% would add roughly $1.00, all else equal.',
      note: 'Low IV does not guarantee IV will rise. Research into what caused IV to fall — and whether that condition is likely to change — is part of forming a view.',
    },
  ];

  return (
    <div className="space-y-3 my-4">
      {cards.map((card, i) => (
        <div key={i} className="rounded-lg border border-primary/20 bg-primary/5 px-4 py-4">
          <p className="text-sm font-semibold text-primary mb-0.5">{card.title}</p>
          <p className="text-xs text-primary/70 mb-2">{card.sub}</p>
          <p className="text-sm text-muted-foreground leading-relaxed mt-3">{card.body}</p>
          <div className="mt-3 rounded-md bg-muted/50 px-3 py-2">
            <p className="text-xs text-muted-foreground leading-relaxed">
              <span className="font-medium text-foreground">Keep in mind: </span>
              {card.note}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Final module callout ──────────────────────────────────────────────────────
function FinalModuleCallout() {
  return (
    <div className="rounded-lg border border-primary/20 bg-primary/5 px-4 py-4 mb-8 flex items-start gap-3">
      <CheckCircle2 className="size-4 text-primary mt-0.5 shrink-0" />
      <div>
        <p className="text-sm font-semibold text-primary">
          You've completed all of InvestEd's education modules
        </p>
        <p className="text-sm text-muted-foreground mt-0.5">
          You've worked through everything from the fundamentals of options contracts to the four
          main Greeks. Each module will be here whenever you want to come back and review.
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
          href="https://www.optionseducation.org/advancedconcepts/vega"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-foreground transition-colors"
        >
          Vega
        </a>{' '}
        and{' '}
        <a
          href="https://www.optionseducation.org/advancedconcepts/volatility-the-greeks"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-foreground transition-colors"
        >
          Volatility &amp; the Greeks
        </a>{' '}
        by the{' '}
        <a
          href="https://www.optionseducation.org"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-foreground transition-colors"
        >
          Options Industry Council (OIC)
        </a>
        . Used for educational purposes.
      </p>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function Vega() {
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
              Module 11
            </span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Vega</h1>
          <p className="text-muted-foreground mt-2">
            How implied volatility affects option premium, what Vega measures, and how to use it
            when selecting contracts.
          </p>
        </div>

        {/* Scope callout */}
        <ScopeCallout />

        {/* ── 1. What Vega Measures ────────────────────────────────────────── */}
        <Section icon={<Wind className="size-4" />} title="What Vega Measures">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Vega measures an option's sensitivity to implied volatility — it is the dollar change in
            premium for each 1% move in IV, with all other inputs held constant. Both IV and Vega
            are independent of stock price direction. Vega is positive for buyers and negative for
            sellers — the buyer's gain from a rising IV is the seller's loss, and the two exposures
            are equal and opposite. A Vega of 0.12 means the premium is expected to gain $0.12 when
            IV rises 1%, and lose $0.12 when IV falls 1%.
          </p>

          <Term
            word="Vega Exposure"
            definition="The degree to which a position's value is sensitive to changes in implied volatility, as measured by Vega. A position with high Vega exposure will gain or lose more premium for a given IV move than one with low Vega exposure. Understanding the Vega exposure of a contract helps determine whether the IV environment and your outlook on how IV may shift are likely to work for or against the position."
          />
        </Section>
        {/* ── 2. How Vega Affects Premium ─────────────────────────────────── */}
        <Section icon={<BarChart3 className="size-4" />} title="How Vega Affects Premium">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Vega acts entirely on the extrinsic (time) value portion of an option's premium — rising
            IV inflates it, falling IV deflates it. Intrinsic value, which depends only on the
            relationship between the stock price and the strike price, is not affected by changes in
            IV.
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed mt-3">
            The example below uses values from the Options Industry Council. OICX is trading at $50.
            A call with 12 months to expiration has an IV of 30%, a Vega of 0.15, and a current
            premium of $4.00. The stock price does not move.
          </p>

          <VegaPremiumDiagram />

          <p className="text-sm text-muted-foreground leading-relaxed">
            Changes in implied volatility can have a significant impact on an option's price. A
            position can gain or lose meaningful value from an IV shift alone, even when the stock
            hasn't moved.
          </p>
        </Section>
        {/* ── 3. Understanding Volatility ─────────────────────────────────── */}
        <Section icon={<Activity className="size-4" />} title="Understanding Volatility">
          <p className="text-sm text-muted-foreground leading-relaxed">
            When demand for options increases, premiums rise, and the IV implied by those prices
            rises with them. When demand falls and premiums compress, IV falls. A large sell order
            that pushes option prices down — without any change in the underlying — will cause a
            decline in implied volatility. The market is the ultimate determining factor of current
            implied volatility levels.
          </p>

          <Term
            word="Historical Volatility (HV)"
            definition="A measure of actual price changes in the underlying over a specific past period, expressed as an annualized standard deviation. Historical volatility is backward-looking — it reflects what the stock has already done, not what the market expects it to do."
          />

          <div className="rounded-xl border bg-card p-5 my-4 space-y-4">
            <div>
              <p className="text-sm font-semibold mb-1.5">What moves IV</p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                IV is demand-driven. Earnings reports, major news, and market stress push IV up as
                traders buy options to hedge or speculate. Once the event passes and uncertainty
                resolves, demand falls and IV compresses. A stock trading quietly with no upcoming
                catalysts tends to have low IV.
              </p>
            </div>
            <div className="border-t pt-4">
              <p className="text-sm font-semibold mb-1.5">What moves HV</p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                HV reflects the actual price movement of the stock over a recent period. A volatile
                earnings quarter, a product scandal, or a sudden macro shock will push HV up. A
                stock that has been range-bound for weeks with no major news will have low HV. HV
                and IV are separate measures — changes in HV do not directly cause IV to move.
              </p>
            </div>
            <div className="border-t pt-4">
              <p className="text-sm font-semibold mb-1.5">How HV, IV, and Vega work together</p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                When IV is high relative to HV, premiums are pricing in more movement than the stock
                has recently delivered. When IV is low relative to HV — for example, HV at 30% and
                IV at 10% after an earnings report has passed and uncertainty has resolved —
                premiums may be cheaper than recent realized moves would suggest. By looking at HV,
                IV, and current events together, a trader can form a view on how IV is likely to
                shift. Vega exposure is what connects that view to a specific contract — a
                higher-Vega contract will feel IV shifts more in either direction, so the contract
                chosen should reflect how much of that sensitivity the trader wants to carry.
              </p>
            </div>
          </div>
        </Section>

        {/* ── 4. Vega in Action ────────────────────────────────────────────── */}
        <Section icon={<TrendingUp className="size-4" />} title="Vega in Action">
          <p className="text-sm text-muted-foreground leading-relaxed">
            The slider below shows a hypothetical ATM call with a Vega of 0.12 and a base premium of
            $3.20 at 25% IV. Adjust the IV level to see the estimated effect on the option's
            premium.
          </p>

          <IVSlider />
        </Section>

        {/* ── 5. Vega and Time to Expiration ──────────────────────────────── */}
        <Section icon={<Clock className="size-4" />} title="Vega and Time to Expiration">
          <p className="text-sm text-muted-foreground leading-relaxed">
            The Greeks Overview noted that longer-dated options tend to have higher Vega. With more
            time remaining, there is more opportunity for volatility to influence the final outcome,
            so the market prices in greater IV sensitivity. As expiration approaches and time value
            shrinks, Vega shrinks with it.
          </p>

          <VegaDTETable />

          <p className="text-sm text-muted-foreground leading-relaxed">
            On InvestEd, all contracts are 0–14 DTE, which places every position in the lower end of
            the Vega range. A 1% IV move has a smaller dollar impact on a 7-day contract than it
            would on a 60-day contract at the same strike. That said, IV does not become irrelevant
            at short expirations. Catalysts — earnings releases, major economic data, or sudden
            market stress — can spike IV sharply enough to meaningfully move short-dated premiums,
            and that IV often collapses just as quickly after the event passes.
          </p>

          <div className="rounded-lg border border-border bg-muted/40 px-4 py-3 mt-3 flex items-start gap-3">
            <Info className="size-4 text-muted-foreground mt-0.5 shrink-0" />
            <p className="text-sm text-muted-foreground">
              IV changes also affect Delta and Gamma. A rise in IV tends to push OTM options closer
              to a Delta of 0.50 as the market prices in a wider range of possible outcomes. These
              interactions are covered in the Delta and Gamma modules.
            </p>
          </div>
        </Section>

        {/* ── 6. Vega in the Options Chain ────────────────────────────────── */}
        <Section icon={<BarChart3 className="size-4" />} title="Vega in the Options Chain">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Vega and IV appear alongside Delta and the other Greeks when viewing options data. The
            example below illustrates how both metrics peak near the ATM strike and decrease as
            strikes move further in or out of the money — a pattern consistent with how Gamma
            behaves.
          </p>

          <OptionsChainCallout />

          <p className="text-sm text-muted-foreground leading-relaxed mt-2">
            IV shown in the chain is the implied volatility for that specific contract. You may
            notice that IV is not perfectly uniform across strikes — this is a normal characteristic
            of how options are priced in practice, sometimes called the volatility skew.
          </p>

          <div className="rounded-lg border border-border bg-muted/40 px-4 py-3 mt-3 flex items-start gap-3">
            <Info className="size-4 text-muted-foreground mt-0.5 shrink-0" />
            <p className="text-sm text-muted-foreground">
              On InvestEd, once a position is open, Vega can be viewed in the position detail on the
              portfolio page.
            </p>
          </div>
        </Section>

        {/* ── 7. Using Vega to Select Contracts ───────────────────────────── */}
        <Section icon={<Layers className="size-4" />} title="Using Vega to Select Contracts">
          <p className="text-sm text-muted-foreground leading-relaxed">
            A trader's outlook on a stock and the current IV environment can both inform which level
            of Vega exposure makes sense for a given contract.
          </p>

          <ContractSelectionCards />
        </Section>

        {/* ── Summary ──────────────────────────────────────────────────────── */}
        <div className="rounded-xl border bg-card p-5 mb-8">
          <h3 className="font-semibold mb-3">Summary</h3>
          <ul className="space-y-1.5 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="size-4 text-primary mt-0.5 shrink-0" />
              Vega measures the dollar change in an option's premium for each 1% change in implied
              volatility — it is positive for buyers and negative for sellers, with equal and
              opposite exposure
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="size-4 text-primary mt-0.5 shrink-0" />
              Vega and IV are independent of stock price direction — a position's value can change
              without the underlying moving at all
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="size-4 text-primary mt-0.5 shrink-0" />
              IV is driven by supply and demand for options — earnings reports, major news, and
              market stress push IV up; calm periods and resolved catalysts bring it down
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="size-4 text-primary mt-0.5 shrink-0" />
              HV measures actual past price movement and does not directly move IV — but comparing
              the two can suggest whether current premiums appear cheap or expensive relative to
              recent realized moves
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="size-4 text-primary mt-0.5 shrink-0" />
              By looking at HV, IV, Vega, and current events together, a trader can form a view on
              how IV may shift and use Vega exposure to find a contract where that move works in
              their favor
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="size-4 text-primary mt-0.5 shrink-0" />
              Longer-dated options have higher Vega; short-dated contracts like those on InvestEd
              have lower Vega, but IV spikes around catalysts can still move premiums meaningfully
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="size-4 text-primary mt-0.5 shrink-0" />
              Vega is highest for ATM options and decreases as strikes move further ITM or OTM — the
              same pattern seen with Gamma
            </li>
          </ul>
        </div>

        {/* Final module callout */}
        <FinalModuleCallout />

        {/* Module navigation */}
        <ModuleNavigation moduleId={moduleId ?? ''} />

        {/* Attribution */}
        <Attribution />
      </div>
    </div>
  );
}
