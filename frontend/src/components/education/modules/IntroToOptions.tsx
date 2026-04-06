import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useEducationStore } from '@/store/educationStore';
import {
  ArrowLeft,
  CheckCircle2,
  BookOpen,
  TrendingUp,
  Shield,
  DollarSign,
  Calendar,
  Layers,
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

// ── Options vs Stocks comparison diagram ─────────────────────────────────────
function ComparisonDiagram() {
  const rows = [
    { label: 'Ownership', stock: 'Share of company', option: 'Right to buy/sell shares' },
    { label: 'Cost', stock: 'Full share price', option: 'Premium only' },
    { label: 'Expiry', stock: 'No expiration', option: 'Fixed expiration date' },
    { label: 'Risk', stock: 'Can go to $0', option: 'Max loss = premium paid' },
    { label: 'Leverage', stock: 'None', option: 'Controls 100 shares' },
  ];

  return (
    <div className="rounded-xl border overflow-hidden my-4">
      <div className="grid grid-cols-3 bg-muted text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        <div className="px-4 py-2">Feature</div>
        <div className="px-4 py-2 border-l">Stock</div>
        <div className="px-4 py-2 border-l">Option</div>
      </div>
      {rows.map((row, i) => (
        <div
          key={i}
          className={`grid grid-cols-3 text-sm ${i % 2 === 0 ? 'bg-card' : 'bg-muted/30'}`}
        >
          <div className="px-4 py-3 font-medium">{row.label}</div>
          <div className="px-4 py-3 border-l text-muted-foreground">{row.stock}</div>
          <div className="px-4 py-3 border-l text-muted-foreground">{row.option}</div>
        </div>
      ))}
    </div>
  );
}

// ── Contract structure diagram ────────────────────────────────────────────────
function ContractDiagram() {
  const parts = [
    {
      icon: <Layers className="size-4" />,
      label: 'Underlying',
      desc: 'The stock the option is based on (e.g. AAPL)',
    },
    {
      icon: <DollarSign className="size-4" />,
      label: 'Strike Price',
      desc: 'The price at which you can buy or sell the stock',
    },
    {
      icon: <Calendar className="size-4" />,
      label: 'Expiration',
      desc: 'The date the option contract expires',
    },
    {
      icon: <TrendingUp className="size-4" />,
      label: 'Type',
      desc: 'Call (right to buy) or Put (right to sell)',
    },
    {
      icon: <Shield className="size-4" />,
      label: 'Premium',
      desc: 'The price you pay for the option contract',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-4">
      {parts.map((p, i) => (
        <div key={i} className="flex items-start gap-3 rounded-lg border bg-card p-3">
          <div className="mt-0.5 p-1.5 rounded bg-primary/10 text-primary shrink-0">{p.icon}</div>
          <div>
            <div className="text-sm font-semibold">{p.label}</div>
            <div className="text-xs text-muted-foreground">{p.desc}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function IntroToOptions() {
  const navigate = useNavigate();
  const { id: moduleId } = useParams<{ id: string }>();
  const { modules, markComplete } = useEducationStore();
  const [completing, setCompleting] = useState(false);

  const mod = modules.find((m) => m.id === moduleId);
  const isCompleted = mod?.completed ?? false;

  const handleComplete = async () => {
    if (!moduleId || isCompleted || completing) return;
    setCompleting(true);
    await markComplete(moduleId);
    setCompleting(false);
    navigate('/learn');
  };

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
              Module 01
            </span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Intro to Options</h1>
          <p className="text-muted-foreground mt-2">
            A foundational understanding of what options are, why traders use them, and how they
            work.
          </p>
        </div>

        {/* Content */}
        <Section icon={<BookOpen className="size-4" />} title="What is an Options Contract?">
          <p className="text-sm text-muted-foreground leading-relaxed">
            There are two types of options: a <strong className="text-foreground">call</strong>{' '}
            gives you the right to <strong className="text-foreground">buy</strong> shares, while a{' '}
            <strong className="text-foreground">put</strong> gives you the right to{' '}
            <strong className="text-foreground">sell</strong> shares. An options contract gives you
            the <strong className="text-foreground">right, but not the obligation</strong>, to buy
            or sell a stock at a specific price before a set date. You pay a fee (called a premium)
            for this right.
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed mt-3">
            Each contract typically controls <strong className="text-foreground">100 shares</strong>{' '}
            of the underlying stock, giving you significant exposure for a fraction of the cost of
            buying shares outright.
          </p>
          <Term
            word="Options Contract"
            definition="An agreement that gives the buyer the right (not obligation) to buy or sell 100 shares of a stock at a specified price on or before the expiration date."
          />
        </Section>

        <Section icon={<TrendingUp className="size-4" />} title="Why Traders Use Options">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Options are versatile tools used for several purposes:
          </p>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">→</span>
              <span>
                <strong className="text-foreground">Leverage</strong> — control large positions with
                less capital
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">→</span>
              <span>
                <strong className="text-foreground">Hedging</strong> — protect existing stock
                positions from downside
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">→</span>
              <span>
                <strong className="text-foreground">Income</strong> — profit from a stock rising
                (calls) or falling (puts) with a fraction of the capital a stock purchase would
                require
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">→</span>
              <span>
                <strong className="text-foreground">Speculation</strong> — profit from directional
                price moves with limited risk
              </span>
            </li>
          </ul>
        </Section>

        <Section icon={<Layers className="size-4" />} title="Key Terminology">
          <Term
            word="Premium"
            definition="The price you pay to buy an options contract. This is your maximum loss if you only buy options."
          />
          <Term
            word="Strike Price"
            definition="The price at which you can buy (call) or sell (put) the underlying stock if you exercise the option."
          />
          <Term
            word="Expiration Date"
            definition="The date the option contract expires. After this date, the option is worthless if not exercised."
          />
          <Term
            word="Underlying"
            definition="The stock or asset that the option contract is based on (e.g., AAPL, TSLA)."
          />
          <Term
            word="Call Option"
            definition="Gives you the right to BUY the underlying stock at the strike price. Profitable when the stock goes up."
          />
          <Term
            word="Put Option"
            definition="Gives you the right to SELL the underlying stock at the strike price. Profitable when the stock goes down."
          />
        </Section>

        <Section icon={<Shield className="size-4" />} title="Options vs. Stocks">
          <p className="text-sm text-muted-foreground leading-relaxed mb-3">
            Understanding the key differences helps you decide when to use each instrument.
          </p>
          <ComparisonDiagram />
        </Section>

        <Section icon={<DollarSign className="size-4" />} title="Anatomy of an Options Contract">
          <p className="text-sm text-muted-foreground leading-relaxed mb-2">
            Every options contract has five core components:
          </p>
          <ContractDiagram />
          <p className="text-sm text-muted-foreground leading-relaxed mt-3">
            Example: An <strong className="text-foreground">AAPL Jan 2026 $200 Call</strong> gives
            you the right to buy 100 shares of Apple at $200 per share, expiring in January 2026.
          </p>
        </Section>

        <Section icon={<TrendingUp className="size-4" />} title="Risk & Reward Overview">
          <p className="text-sm text-muted-foreground leading-relaxed">
            For option <strong className="text-foreground">buyers</strong>, the maximum loss is
            limited to the premium paid. The potential gain can be substantial if the stock moves in
            your favor.
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed mt-3">
            For option <strong className="text-foreground">sellers</strong>, the premium received is
            the maximum gain, but losses can be significant — or even unlimited in some strategies —
            if the stock moves against you.
          </p>
        </Section>

        {/* Summary */}
        <div className="rounded-xl border bg-card p-5 mb-8">
          <h3 className="font-semibold mb-3">Summary</h3>
          <ul className="space-y-1.5 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="size-4 text-primary mt-0.5 shrink-0" />
              Options give you the right (not obligation) to buy or sell shares
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="size-4 text-primary mt-0.5 shrink-0" />
              Calls profit when stock rises; puts profit when stock falls
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="size-4 text-primary mt-0.5 shrink-0" />
              Each contract controls 100 shares
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="size-4 text-primary mt-0.5 shrink-0" />
              Max loss for buyers is the premium paid
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="size-4 text-primary mt-0.5 shrink-0" />
              Key terms: premium, strike price, expiration, underlying
            </li>
          </ul>
        </div>

        {/* Footer nav + Complete button */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/learn')}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="size-4" />
            Back to Learn
          </button>
          <button
            onClick={handleComplete}
            disabled={isCompleted || completing}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all
              ${
                isCompleted
                  ? 'bg-primary/10 text-primary cursor-default'
                  : 'bg-primary text-primary-foreground hover:bg-primary/90 active:scale-95 cursor-pointer'
              }`}
          >
            {isCompleted ? (
              <>
                <CheckCircle2 className="size-4" /> Completed
              </>
            ) : completing ? (
              'Saving...'
            ) : (
              'Mark as Complete'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
