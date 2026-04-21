import { useNavigate, useParams } from 'react-router-dom';
import ModuleNavigation from '@/components/education/ModuleNavigation';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Clock,
  TrendingDown,
  Info,
  CheckCircle2,
  ExternalLink,
  Activity,
  DollarSign,
  Calendar,
  BarChart2,
} from 'lucide-react';

// -- Key term callout ----------------------------------------------------------
function Term({ word, definition }: { word: string; definition: string }) {
  return (
    <div className="rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 my-3">
      <span className="font-semibold text-primary text-sm">{word}</span>
      <p className="text-sm text-muted-foreground mt-0.5">{definition}</p>
    </div>
  );
}

// -- Section wrapper ----------------------------------------------------------
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

// -- Scope callout -------------------------------------------------------------
function ScopeCallout() {
  return (
    <div className="rounded-lg border border-blue-500/20 bg-blue-500/5 px-4 py-3 mb-8 flex items-start gap-3">
      <Info className="size-4 text-blue-500 mt-0.5 shrink-0" />
      <div>
        <p className="text-sm font-semibold text-blue-500">What This Module Covers</p>
        <p className="text-sm text-muted-foreground mt-0.5">
          {
            "Time decay behaves differently depending on how close a contract is to expiration, how volatile the underlying stock is, and whether you're buying or selling. This module walks through each of those relationships and what they mean when you're looking at contracts in the chain."
          }
        </p>
      </div>
    </div>
  );
}

// -- Premium decay table ------------------------------------------------------
function PremiumDecayTable() {
  const rows = [
    { dte: 14, premium: '1.85', theta: '-0.08', note: 'Start of position' },
    { dte: 10, premium: '1.53', theta: '-0.09', note: '' },
    { dte: 7, premium: '1.26', theta: '-0.11', note: 'Decay picking up' },
    { dte: 4, premium: '0.88', theta: '-0.14', note: '' },
    { dte: 2, premium: '0.52', theta: '-0.19', note: 'Rapid decay zone' },
    { dte: 1, premium: '0.28', theta: '-0.24', note: '' },
    { dte: 0, premium: '0.00', theta: '-', note: 'Expires worthless (OTM)' },
  ];

  return (
    <div className="rounded-lg border bg-card overflow-hidden my-4">
      <div className="px-4 py-2 bg-muted/30 border-b text-xs font-medium text-muted-foreground">
        Hypothetical OTM Call — No Stock Move, No IV Change
      </div>
      <div className="grid grid-cols-4 text-xs font-medium text-muted-foreground border-b px-4 py-2 bg-muted/10">
        <div>DTE</div>
        <div>Premium</div>
        <div>Theta</div>
        <div>Note</div>
      </div>
      {rows.map((r, i) => (
        <div
          key={r.dte}
          className={`grid grid-cols-4 text-xs px-4 py-2.5 border-b last:border-0 ${
            i % 2 === 0 ? 'bg-background' : 'bg-muted/20'
          }`}
        >
          <div className="font-medium">{r.dte}d</div>
          <div className="text-emerald-600 font-medium">${r.premium}</div>
          <div className="text-destructive">{r.theta}</div>
          <div className="text-muted-foreground">{r.note}</div>
        </div>
      ))}
      <div className="px-4 py-2.5 bg-muted/20 text-xs text-muted-foreground">
        {
          'The daily cost at 1 DTE is roughly three times what it was at 14 DTE. The stock never moved. Theta accounted for the entire loss.'
        }
      </div>
    </div>
  );
}

// -- IV / Theta cards ---------------------------------------------------------
function IVThetaCards() {
  const cards = [
    {
      label: 'Low Implied Volatility',
      effect: 'Lower Theta',
      detail:
        "When the market expects the stock to move less, option premiums are lower — there's less uncertainty being priced in, so buyers aren't willing to pay much for the chance that the stock moves their way. Less premium built in means less to decay each day.",
      border: 'border-blue-500/20',
      bg: 'bg-blue-500/5',
      labelColor: 'text-blue-500',
      effectColor: 'text-blue-500',
    },
    {
      label: 'High Implied Volatility',
      effect: 'Higher Theta',
      detail:
        'When the market expects the stock to move more, option premiums are higher — buyers are willing to pay more because a larger move is possible. That higher premium means more time value sitting in the price, and more of it decays each day.',
      border: 'border-destructive/20',
      bg: 'bg-destructive/5',
      labelColor: 'text-destructive',
      effectColor: 'text-destructive',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-4">
      {cards.map((c) => (
        <div key={c.label} className={`rounded-lg border ${c.border} ${c.bg} p-4`}>
          <p className={`text-sm font-semibold ${c.labelColor} mb-1`}>{c.label}</p>
          <p className={`text-xs font-semibold ${c.effectColor} mb-2`}>{c.effect}</p>
          <p className="text-xs text-muted-foreground leading-relaxed">{c.detail}</p>
        </div>
      ))}
    </div>
  );
}

// -- Buyer vs seller comparison -----------------------------------------------
function BuyerSellerComparison() {
  const buyerPoints = [
    'Pays premium upfront — Theta is an ongoing daily cost',
    'Needs the stock to move enough to overcome that cost',
    'Each day without a move, the position loses value',
    'Shorter DTE means higher daily cost and less time to be right',
  ];
  const sellerPoints = [
    'Collects premium upfront — time passing accretes value back to them',
    'Benefits when the stock stays calm and time passes',
    'Each day without a large move, the position gains value',
    'Shorter DTE means faster collection but faster-moving risk if the stock breaks',
  ];

  return (
    <div className="grid grid-cols-2 gap-3 my-4">
      <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4">
        <p className="text-sm font-semibold text-destructive mb-1">Buyer</p>
        <p className="text-xs text-muted-foreground mb-3">
          {'Negative Theta — time works against you'}
        </p>
        <ul className="space-y-2">
          {buyerPoints.map((t) => (
            <li key={t} className="flex items-start gap-1.5 text-xs text-muted-foreground">
              <TrendingDown className="size-3 text-destructive mt-0.5 shrink-0" />
              {t}
            </li>
          ))}
        </ul>
      </div>
      <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-4">
        <p className="text-sm font-semibold text-emerald-600 mb-1">Seller</p>
        <p className="text-xs text-muted-foreground mb-3">
          {'Positive Theta — time works for you'}
        </p>
        <ul className="space-y-2">
          {sellerPoints.map((t) => (
            <li key={t} className="flex items-start gap-1.5 text-xs text-muted-foreground">
              <CheckCircle2 className="size-3 text-emerald-600 mt-0.5 shrink-0" />
              {t}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function ThetaPositionRisk() {
  const tiers = [
    {
      label: 'High Theta',
      sub: 'ATM, near expiration',
      description:
        'The position is losing the most time value per day. Every day that passes without a stock move is a meaningful loss for the buyer. For the seller, every day without a large move is meaningful income. This is the highest time pressure zone — the outcome is being decided quickly.',
      points: [
        "If you're bullish or bearish with high conviction that a move will happen today or tomorrow, a high-Theta contract reflects that — you're paying the most per day but the contract will respond sharply if you're right",
        "If you're selling, high Theta means the most daily collection but the most exposure if the stock breaks hard",
        'Least forgiving if the move is delayed even by a day or two',
        'Requires the most attention — the position can change value quickly in either direction',
      ],
    },
    {
      label: 'Moderate Theta',
      sub: 'Slightly ITM or OTM, more time remaining',
      description:
        'Time value is still decaying but at a slower pace. The daily cost is lower, giving a directional position more room to develop without being eroded quickly.',
      points: [
        "If you're bullish or bearish but less certain about timing, a moderate-Theta contract gives the trade more time to work without the daily cost becoming the dominant factor",
        "The position responds to stock moves but doesn't demand an immediate payoff",
        'For sellers, moderate Theta means slower collection but less sensitivity to sudden sharp moves',
        'A better fit when the direction feels right but the timing is less clear',
      ],
    },
    {
      label: 'Low Theta',
      sub: 'Deep ITM or far OTM',
      description:
        'Very little time value in the position. Deep ITM and far OTM options both have low Theta but for completely different reasons and with very different behavior.',
      points: [
        "Deep ITM: if you're strongly bullish or bearish and want exposure that behaves close to the stock itself, a deep ITM contract has low Theta because most of its value is intrinsic — time passing barely affects it",
        "Far OTM: low Theta because there's very little premium left overall — not a sign of safety, but a sign that the contract needs a large move to become relevant at all",
        'Lowest time pressure, but the tradeoffs at each end are opposite: deep ITM is expensive and stable, far OTM is cheap and requires a big move',
      ],
    },
  ];

  return (
    <div className="space-y-3 my-4">
      {tiers.map((tier) => (
        <div key={tier.label} className="rounded-lg border border-foreground/40 bg-card p-4">
          <p className="text-sm font-semibold text-foreground mb-0.5">{tier.label}</p>
          <p className="text-xs text-muted-foreground mb-3">{tier.sub}</p>
          <p className="text-sm text-muted-foreground leading-relaxed mb-3">{tier.description}</p>
          <ul className="space-y-2">
            {tier.points.map((pt) => (
              <li key={pt} className="flex items-start gap-2 text-xs text-muted-foreground">
                <CheckCircle2 className="size-3 text-primary mt-0.5 shrink-0" />
                {pt}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

// -- Options chain callout ----------------------------------------------------
function OptionsChainCallout() {
  const rows = [
    {
      strike: '$48',
      premium: '3.60',
      delta: '0.72',
      theta: '-0.06',
      iv: '28%',
      dte: '7d',
      type: 'itm',
    },
    {
      strike: '$49',
      premium: '2.80',
      delta: '0.62',
      theta: '-0.09',
      iv: '28%',
      dte: '7d',
      type: 'itm',
    },
    {
      strike: '$50',
      premium: '1.95',
      delta: '0.50',
      theta: '-0.12',
      iv: '28%',
      dte: '7d',
      type: 'atm',
    },
    {
      strike: '$51',
      premium: '1.20',
      delta: '0.38',
      theta: '-0.10',
      iv: '28%',
      dte: '7d',
      type: 'otm',
    },
    {
      strike: '$52',
      premium: '0.65',
      delta: '0.26',
      theta: '-0.07',
      iv: '28%',
      dte: '7d',
      type: 'otm',
    },
    {
      strike: '$53',
      premium: '0.30',
      delta: '0.16',
      theta: '-0.04',
      iv: '28%',
      dte: '7d',
      type: 'otm',
    },
  ];

  const strikeColor: Record<string, string> = {
    itm: 'text-emerald-600',
    atm: 'text-blue-500',
    otm: 'text-destructive',
  };

  return (
    <div className="rounded-lg border bg-card overflow-hidden my-4">
      <div className="px-4 py-2.5 border-b bg-muted/30 text-xs font-medium text-muted-foreground">
        {'Options Chain — OICX Calls — Stock at $50.00'}
      </div>
      <div className="grid grid-cols-6 text-xs font-medium text-muted-foreground border-b px-4 py-2 bg-muted/10">
        <div>Strike</div>
        <div>Premium</div>
        <div>Delta</div>
        <div className="text-primary font-semibold">Theta</div>
        <div>IV</div>
        <div>DTE</div>
      </div>
      {rows.map((row) => (
        <div
          key={row.strike}
          className={`grid grid-cols-6 border-b last:border-0 text-xs ${
            row.type === 'itm' ? 'bg-card' : 'bg-muted/20'
          }`}
        >
          <div className={`px-4 py-2.5 font-medium ${strikeColor[row.type]}`}>{row.strike}</div>
          <div className="px-4 py-2.5 text-muted-foreground">{row.premium}</div>
          <div className="px-4 py-2.5 text-muted-foreground">{row.delta}</div>
          <div className="px-4 py-2.5 bg-primary/5 font-medium text-destructive">{row.theta}</div>
          <div className="px-4 py-2.5 text-muted-foreground">{row.iv}</div>
          <div className="px-4 py-2.5 text-muted-foreground">{row.dte}</div>
        </div>
      ))}
      <div className="px-4 py-2.5 border-t bg-muted/20 flex items-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-emerald-600/80 shrink-0" />
          ITM
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-blue-500/80 shrink-0" />
          ATM
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-destructive/80 shrink-0" />
          OTM
        </span>
      </div>
      <div className="px-4 py-2.5 bg-muted/20 text-xs text-muted-foreground border-t">
        {
          'The ATM strike ($50) carries the highest Theta — it holds the most time value and has the most to lose each day. Theta decreases in both directions away from ATM. When comparing contracts, the Theta column gives you a direct view of what each strike costs per day.'
        }
      </div>
    </div>
  );
}

// -- Next module callout -------------------------------------------------------
function NextModuleCallout() {
  return (
    <div className="rounded-lg border border-primary/20 bg-primary/5 px-4 py-4 mb-8 flex items-start gap-3">
      <ArrowRight className="size-4 text-primary mt-0.5 shrink-0" />
      <div>
        <p className="text-sm font-semibold text-primary">Up Next: Vega</p>
        <p className="text-sm text-muted-foreground mt-0.5">
          {
            "The next module covers Vega — the Greek that measures how much an option's premium changes when implied volatility shifts. Where Theta tracks the cost of time, Vega tracks the cost of uncertainty."
          }
        </p>
      </div>
    </div>
  );
}

// -- Attribution --------------------------------------------------------------
function Attribution() {
  return (
    <div className="rounded-lg border border-border bg-muted/30 px-4 py-3 mt-10 flex items-start gap-3">
      <ExternalLink className="size-4 text-muted-foreground mt-0.5 shrink-0" />
      <p className="text-xs text-muted-foreground leading-relaxed">
        Content adapted from{' '}
        <a
          href="https://www.optionseducation.org/advancedconcepts/theta"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-foreground transition-colors"
        >
          Theta
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

// -- Main component -----------------------------------------------------------
export default function Theta() {
  const navigate = useNavigate();
  const { id: moduleId } = useParams<{ id: string }>();

  const summaryPoints = [
    'Theta measures daily premium decay per share — a Theta of −0.05 means $0.05 per share, $5.00 in total, lost each calendar day with everything else held constant.',
    'The acceleration is significant — the daily cost at 1 DTE can be roughly three times what it was at 14 DTE on the same contract.',
    "Options decay seven calendar days' worth of Theta over five trading days. Monday mornings reflect the weekend's decay already priced in.",
    'ATM options have the highest Theta because they hold the most time value. Deep ITM and far OTM options carry less time value and therefore less daily decay.',
    'Higher implied volatility means higher Theta — the market is pricing in a larger expected move, which inflates the premium and the daily decay.',
    'Buyers carry negative Theta — the daily cost works against them until the stock moves. Sellers carry positive Theta — time passing works in their favor as long as the stock stays calm.',
    'Matching the Theta level of a contract to how quickly and decisively you expect the stock to move is one of the more practical ways to use this greek.',
  ];

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

        {/* Title block */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-1">
            <BookOpen className="size-5 text-primary" />
            <span className="text-xs text-muted-foreground font-mono uppercase tracking-wider">
              Module 10
            </span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Theta</h1>
          <p className="text-muted-foreground mt-2">
            {
              'A deep dive into Theta — quantifying how fast decay accelerates, what determines its size, and how to use it when selecting contracts and expiration dates.'
            }
          </p>
        </div>

        {/* Scope callout */}
        <ScopeCallout />

        {/* Quick Recap */}
        <Section icon={<Clock className="size-4" />} title="Quick Recap">
          <p className="text-sm text-muted-foreground leading-relaxed">
            {
              "Theta measures how much an option's premium may decay per day from the passage of time alone. It's expressed as a dollar amount per share — a Theta of −0.05 means the option loses about $0.05 per share, $5.00 in total, each calendar day with everything else held constant. It's always negative for buyers and always positive for sellers."
            }
          </p>
        </Section>

        {/* Quantifying Time Value Decay */}
        <Section icon={<BarChart2 className="size-4" />} title="Quantifying Time Value Decay">
          <p className="text-sm text-muted-foreground leading-relaxed">
            {
              'The table below traces a hypothetical OTM call from 14 DTE to expiration with no change in stock price or implied volatility. Notice how the decay speeds up as the contract reaches its expiration date — and how Theta itself grows more negative with each row.'
            }
          </p>

          <PremiumDecayTable />

          <p className="text-sm text-muted-foreground leading-relaxed">
            {
              'From 14 DTE to 7 DTE the option lost $0.59 total. From 7 DTE to expiration it lost $1.26 — more than double, in fewer days. The stock never moved.'
            }
          </p>

          <Term
            word="Weekend Decay"
            definition="Options pricing models account for all seven calendar days, not just the five trading days. An option decays approximately seven days' worth of Theta over a five-day trading week. On Monday mornings, the weekend's decay is already reflected in the premium."
          />
        </Section>

        {/* What Determines Theta Size */}
        <Section icon={<Activity className="size-4" />} title="What Determines the Size of Theta">
          <p className="text-sm text-muted-foreground leading-relaxed">
            {
              'Two things primarily determine how large the Theta on a given contract is: how close it is to at-the-money, and the level of implied volatility on the underlying.'
            }
          </p>

          <p className="text-sm text-muted-foreground leading-relaxed mt-3">
            {
              "ATM options carry the highest Theta. They hold the most time value — the stock is right at the threshold where it could finish in or out of the money, so the premium is almost entirely time value. That time value is what decays. Deep ITM options have most of their value locked in as intrinsic value, not time value, so there's less to decay. Far OTM options have very little premium to begin with, so their Theta is low even if the percentage decay is high."
            }
          </p>

          <p className="text-sm text-muted-foreground leading-relaxed mt-3">
            {
              'Implied volatility also directly affects the size of Theta. Two options at the same strike and DTE can have very different Theta values depending on the expected volatility of the underlying.'
            }
          </p>

          <IVThetaCards />
        </Section>

        {/* Buyers vs Sellers */}
        <Section icon={<DollarSign className="size-4" />} title="Theta for Buyers and Sellers">
          <p className="text-sm text-muted-foreground leading-relaxed">
            {
              "Theta is a zero-sum relationship. The time value that leaves a buyer's position each day goes to the seller's position."
            }
          </p>

          <BuyerSellerComparison />

          <p className="text-sm text-muted-foreground leading-relaxed">
            {
              'Neither side is automatically better. A buyer accepts the daily erosion in exchange for defined risk and leveraged upside if the stock moves. A seller accepts the daily premium collection in exchange for the obligation and the risk of a large adverse move.'
            }
          </p>
        </Section>

        {/* Theta and Position Risk */}
        <Section icon={<Calendar className="size-4" />} title="Theta and Position Risk">
          <p className="text-sm text-muted-foreground leading-relaxed">
            {
              'Theta also tells you how much time pressure a position is under. When looking at a contract, the Theta level reflects how quickly the trade needs to work. Matching that to how fast and decisively you expect the stock to move is one of the more practical ways to use this Greek.'
            }
          </p>

          <ThetaPositionRisk />

          <p className="text-sm text-muted-foreground leading-relaxed mt-2">
            {
              'Theta and Gamma often move together — ATM options near expiration have both the highest Theta and the highest Gamma. That combination means the position is both decaying the fastest and changing sensitivity the fastest. The further a contract moves from ATM, or the more time remaining, the lower both become.'
            }
          </p>
        </Section>

        {/* Theta in the Chain */}
        <Section icon={<TrendingDown className="size-4" />} title="Theta in the Options Chain">
          <p className="text-sm text-muted-foreground leading-relaxed">
            {
              'The Theta column in the chain shows the daily decay for each strike. The pattern across strikes is consistent: Theta peaks at ATM and decreases in both directions. When comparing two contracts before entering a trade, the Theta column gives you a direct view of what each strike costs per day — a further OTM strike has lower premium but also lower Theta, and that tradeoff is worth understanding before entering.'
            }
          </p>

          <OptionsChainCallout />
        </Section>

        {/* Summary */}
        <div className="rounded-xl border bg-card p-5 mb-8">
          <h3 className="font-semibold mb-3">Summary</h3>
          <ul className="space-y-1.5 text-sm text-muted-foreground">
            {summaryPoints.map((pt) => (
              <li key={pt} className="flex items-start gap-2">
                <CheckCircle2 className="size-4 text-primary mt-0.5 shrink-0" />
                {pt}
              </li>
            ))}
          </ul>
        </div>

        {/* Up Next */}
        <NextModuleCallout />

        {/* Module navigation */}
        <ModuleNavigation moduleId={moduleId ?? ''} />

        {/* Attribution */}
        <Attribution />
      </div>
    </div>
  );
}
