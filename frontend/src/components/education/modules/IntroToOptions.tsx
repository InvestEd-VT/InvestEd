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
  ExternalLink,
  ArrowRight,
  Info,
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
          This module introduces options at a high level — what they are, how they work, and the
          core terminology you'll need going forward. It focuses on{' '}
          <strong className="text-foreground">buying</strong> options contracts and the rights that
          come with that. The next module will introduce the other side of the contract:{' '}
          <strong className="text-foreground">selling</strong> options, and the important
          terminology that comes with it.
        </p>
      </div>
    </div>
  );
}

// ── Options vs Stocks comparison diagram ─────────────────────────────────────
function ComparisonDiagram() {
  const rows = [
    { label: 'Ownership', stock: 'Share of company', option: 'Right to buy/sell shares' },
    { label: 'Cost', stock: 'Full share price', option: 'Premium only' },
    { label: 'Expiry', stock: 'No expiration', option: 'Fixed expiration date' },
    { label: 'Risk (Buyer)', stock: 'Can go to $0', option: 'Max loss = premium paid' },
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
      desc: 'The stock or ETF the option is based on (e.g. AAPL)',
    },
    {
      icon: <DollarSign className="size-4" />,
      label: 'Strike Price',
      desc: 'The price at which you can buy (call) or sell (put) the stock upon exercise',
    },
    {
      icon: <Calendar className="size-4" />,
      label: 'Expiration Date',
      desc: 'The date the option contract expires. After this date, the option ceases to exist.',
    },
    {
      icon: <TrendingUp className="size-4" />,
      label: 'Type',
      desc: 'Call (right to buy) or Put (right to sell)',
    },
    {
      icon: <Shield className="size-4" />,
      label: 'Premium',
      desc: 'The price paid for the option contract, quoted on a per-share basis',
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

// ── Next module callout ───────────────────────────────────────────────────────
function NextModuleCallout() {
  return (
    <div className="rounded-lg border border-primary/20 bg-primary/5 px-4 py-4 mb-8 flex items-start gap-3">
      <ArrowRight className="size-4 text-primary mt-0.5 shrink-0" />
      <div>
        <p className="text-sm font-semibold text-primary">Up Next: Intro to Selling Options</p>
        <p className="text-sm text-muted-foreground mt-0.5">
          In the next module we'll introduce the seller's side of options contracts — including what
          it means to write an option, the obligations that come with it, and the key terminology
          you'll need before diving into calls and puts.
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

        {/* Scope callout */}
        <ScopeCallout />

        {/* Content */}
        <Section icon={<BookOpen className="size-4" />} title="What is an Options Contract?">
          <p className="text-sm text-muted-foreground leading-relaxed">
            An equity option is a contract that conveys to its holder the{' '}
            <strong className="text-foreground">right, but not the obligation</strong>, to buy or
            sell shares of an underlying stock at a specified price — called the{' '}
            <strong className="text-foreground">strike price</strong> — on or before a given date
            called the <strong className="text-foreground">expiration date</strong>. After that
            date, the option ceases to exist.
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed mt-3">
            There are two types of options contracts:{' '}
            <strong className="text-foreground">calls</strong> and{' '}
            <strong className="text-foreground">puts</strong>. A call gives you the right to{' '}
            <strong className="text-foreground">buy</strong> shares, while a put gives you the right
            to <strong className="text-foreground">sell</strong> shares. Either type can itself be
            bought or sold — when you buy a call or put, you pay the premium to obtain that right.
            Equity option contracts typically represent{' '}
            <strong className="text-foreground">100 shares</strong> of the underlying stock.
          </p>
          <Term
            word="Options Contract"
            definition="A contract that conveys the right, but not the obligation, to buy (call) or sell (put) 100 shares of an underlying stock at a specified strike price on or before the expiration date."
          />
        </Section>

        <Section icon={<TrendingUp className="size-4" />} title="Why Traders Use Options">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Options are versatile instruments used for several purposes:
          </p>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">→</span>
              <span>
                <strong className="text-foreground">Leverage</strong> — control a large position
                (100 shares) with a fraction of the capital required to buy shares outright
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">→</span>
              <span>
                <strong className="text-foreground">Hedging</strong> — use put options as insurance
                to protect an existing stock position against an unfavorable price move, while
                maintaining stock ownership
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">→</span>
              <span>
                <strong className="text-foreground">Income</strong> — buying a call can generate
                profit if the stock rises above the strike price, and buying a put can generate
                profit if the stock falls below it, all while risking only the premium paid
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">→</span>
              <span>
                <strong className="text-foreground">Speculation</strong> — take a position on the
                direction of a stock's price with initial investment limited to the premium paid
              </span>
            </li>
          </ul>
        </Section>

        <Section icon={<Layers className="size-4" />} title="Key Terminology">
          <Term
            word="Premium"
            definition="The price of an options contract, quoted on a per-share basis. When you buy a contract, the premium is your total cost and the maximum you can lose."
          />
          <Term
            word="Strike Price"
            definition="The specified price at which you can buy (call) or sell (put) the underlying stock if you choose to exercise the contract. Also called the exercise price."
          />
          <Term
            word="Expiration Date"
            definition="The date on which the option contract expires. After this date, the option no longer has value and no longer exists."
          />
          <Term
            word="Underlying"
            definition="The stock or ETF that the option contract is based on (e.g., AAPL, TSLA)."
          />
          <Term
            word="Call Option"
            definition="A contract that gives you the right to BUY 100 shares of the underlying stock at the strike price, anytime before expiration."
          />
          <Term
            word="Put Option"
            definition="A contract that gives you the right to SELL 100 shares of the underlying stock at the strike price, anytime before expiration."
          />
        </Section>

        <Section icon={<Shield className="size-4" />} title="Options vs. Stocks">
          <p className="text-sm text-muted-foreground leading-relaxed mb-3">
            Understanding the key differences helps you decide when each instrument is appropriate.
          </p>
          <ComparisonDiagram />
          <p className="text-sm text-muted-foreground leading-relaxed mt-3">
            Note: Unlike stockholders, option holders do not receive voting rights or dividends. A
            call holder must exercise the option and take ownership of the shares to be eligible for
            those rights.
          </p>
        </Section>

        <Section icon={<DollarSign className="size-4" />} title="Anatomy of an Options Contract">
          <p className="text-sm text-muted-foreground leading-relaxed mb-2">
            Every options contract has five core components:
          </p>
          <ContractDiagram />
          <p className="text-sm text-muted-foreground leading-relaxed mt-3">
            Example: An <strong className="text-foreground">AAPL Jan 2026 $200 Call</strong> gives
            the holder the right to buy 100 shares of Apple at $200 per share at any time before the
            January 2026 expiration date.
          </p>
        </Section>

        <Section icon={<TrendingUp className="size-4" />} title="Risk & Reward Overview">
          <p className="text-sm text-muted-foreground leading-relaxed mb-4">
            The potential profit or loss from buying an options contract depends on how the stock
            moves relative to the strike price before expiration.
          </p>

          <div className="rounded-lg border bg-card p-4 mb-3">
            <p className="text-sm font-semibold mb-2">Buying a Call</p>
            <p className="text-sm text-muted-foreground">
              When you buy a call, you profit if the stock rises above the strike price — you have
              the right to buy shares at a lower agreed-upon price than what the market is currently
              charging. The further the stock rises above the strike price, the greater the
              potential profit.
            </p>
          </div>

          <div className="rounded-lg border bg-card p-4 mb-4">
            <p className="text-sm font-semibold mb-2">Buying a Put</p>
            <p className="text-sm text-muted-foreground">
              When you buy a put, you profit if the stock falls below the strike price — you have
              the right to sell shares at a higher agreed-upon price than what the market is
              currently paying. The further the stock falls below the strike price, the greater the
              potential profit.
            </p>
          </div>

          <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4">
            <p className="text-sm font-semibold mb-2">Risk</p>
            <p className="text-sm text-muted-foreground">
              For both calls and puts, your maximum loss is always limited to the premium paid. If
              the stock does not move favorably before expiration, the option expires worthless and
              the premium is the only loss.
            </p>
          </div>
        </Section>

        {/* Summary */}
        <div className="rounded-xl border bg-card p-5 mb-8">
          <h3 className="font-semibold mb-3">Summary</h3>
          <ul className="space-y-1.5 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="size-4 text-primary mt-0.5 shrink-0" />
              Options contracts come in two types — calls (right to buy) and puts (right to sell)
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="size-4 text-primary mt-0.5 shrink-0" />
              Either type can be bought or sold — this module covers buying only
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="size-4 text-primary mt-0.5 shrink-0" />
              Each contract represents 100 shares of the underlying stock
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="size-4 text-primary mt-0.5 shrink-0" />
              Buying a call profits when the stock rises; buying a put profits when the stock falls
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="size-4 text-primary mt-0.5 shrink-0" />
              The maximum loss when buying an option is always limited to the premium paid
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="size-4 text-primary mt-0.5 shrink-0" />
              Key terms: premium, strike price, expiration date, underlying, call, put
            </li>
          </ul>
        </div>

        {/* Next module callout */}
        <NextModuleCallout />

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

        {/* Attribution */}
        <Attribution />
      </div>
    </div>
  );
}
