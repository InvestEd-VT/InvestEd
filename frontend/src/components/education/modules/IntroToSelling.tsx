import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useEducationStore } from '@/store/educationStore';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  BookOpen,
  TrendingUp,
  Shield,
  DollarSign,
  AlertTriangle,
  Info,
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
          This module introduces the seller's side of options contracts — what it means to write an
          option, the obligations that come with it, and key terminology like writer and assignment.
          It builds on the buying concepts from the previous module and prepares you for the Calls
          &amp; Puts module where both sides come together.
        </p>
      </div>
    </div>
  );
}

// ── Four positions table ──────────────────────────────────────────────────────
function FourPositionsTable() {
  const rows = [
    {
      position: 'Buy a Call',
      role: 'Holder',
      action: 'Right to buy 100 shares at strike price',
      highlight: false,
    },
    {
      position: 'Buy a Put',
      role: 'Holder',
      action: 'Right to sell 100 shares at strike price',
      highlight: false,
    },
    {
      position: 'Sell a Call',
      role: 'Writer',
      action: 'Obligated to sell 100 shares at strike price',
      highlight: true,
    },
    {
      position: 'Sell a Put',
      role: 'Writer',
      action: 'Obligated to buy 100 shares at strike price',
      highlight: true,
    },
  ];

  return (
    <div className="rounded-xl border overflow-hidden my-4">
      <div className="grid grid-cols-3 bg-muted text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        <div className="px-4 py-2">Position</div>
        <div className="px-4 py-2 border-l">Role</div>
        <div className="px-4 py-2 border-l">If Exercised</div>
      </div>
      {rows.map((row, i) => (
        <div
          key={i}
          className={`grid grid-cols-3 text-sm ${
            row.highlight ? 'bg-primary/5' : i % 2 === 0 ? 'bg-card' : 'bg-muted/30'
          }`}
        >
          <div className="px-4 py-3 font-medium">{row.position}</div>
          <div className="px-4 py-3 border-l text-muted-foreground">{row.role}</div>
          <div className="px-4 py-3 border-l text-muted-foreground">{row.action}</div>
        </div>
      ))}
      <div className="px-4 py-2 bg-muted/30 border-t">
        <p className="text-xs text-muted-foreground">
          <span className="inline-block w-2 h-2 rounded-sm bg-primary/20 mr-1.5 align-middle" />
          Highlighted rows are the seller positions introduced in this module
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
        <p className="text-sm font-semibold text-primary">Up Next: Calls &amp; Puts</p>
        <p className="text-sm text-muted-foreground mt-0.5">
          Now that both buying and selling have been introduced, the next module takes a deeper look
          at call and put options — covering all four positions with real world examples, and what
          it means for an option to be in the money, at the money, or out of the money.
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
          href="https://www.optionseducation.org/optionsoverview/exercising-options"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-foreground transition-colors"
        >
          Exercising Options
        </a>
        , and{' '}
        <a
          href="https://www.optionseducation.org/optionsoverview/leverage-risk"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-foreground transition-colors"
        >
          Leverage &amp; Risk
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
export default function IntroToSelling() {
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
              Module 02
            </span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Intro to Selling Options</h1>
          <p className="text-muted-foreground mt-2">
            Understand the seller's role in options contracts — obligations, assignment, and how the
            four basic positions fit together.
          </p>
        </div>

        {/* Scope callout */}
        <ScopeCallout />

        {/* Content */}
        <Section
          icon={<BookOpen className="size-4" />}
          title="What Does it Mean to Sell an Option?"
        >
          <p className="text-sm text-muted-foreground leading-relaxed">
            When you buy an options contract, you receive a{' '}
            <strong className="text-foreground">right</strong>. When you sell an options contract,
            you take on an <strong className="text-foreground">obligation</strong>. The seller —
            also called the <strong className="text-foreground">writer</strong> — creates the
            contract and receives the premium from the buyer upfront. In exchange, the writer is
            obligated to fulfill their side of the contract if the buyer chooses to exercise it.
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed mt-3">
            Every options contract has exactly two parties: a{' '}
            <strong className="text-foreground">buyer</strong> who holds the right, and a{' '}
            <strong className="text-foreground">seller</strong> who holds the obligation. The buyer
            decides whether to act — the seller must respond if called upon.
          </p>
          <Term
            word="Writer"
            definition="The seller of an options contract. The writer receives the premium upfront and is obligated to fulfill the contract terms if the buyer chooses to exercise their right."
          />
        </Section>

        <Section icon={<TrendingUp className="size-4" />} title="The Four Basic Positions">
          <p className="text-sm text-muted-foreground leading-relaxed">
            There are four fundamental positions in options trading. The first two — buying a call
            and buying a put — were covered in the previous module. The two seller positions are
            introduced here:
          </p>
          <FourPositionsTable />
          <p className="text-sm text-muted-foreground leading-relaxed mt-3">
            Every options strategy, no matter how complex, is built from some combination of these
            four positions. Understanding all four is the foundation of options trading.
          </p>
        </Section>

        <Section icon={<DollarSign className="size-4" />} title="Premium: Income for the Seller">
          <p className="text-sm text-muted-foreground leading-relaxed">
            When a buyer purchases an options contract, the premium they pay goes directly to the
            seller. The writer collects and keeps this premium regardless of what happens next —
            whether the option is exercised or expires worthless. This premium is the seller's
            maximum possible gain from the transaction.
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed mt-3">
            This is the inverse of the buyer's position. Where the buyer pays the premium and it
            represents their maximum loss, the seller receives the premium and it represents their
            maximum gain.
          </p>
          <Term
            word="Premium (Seller's Perspective)"
            definition="The amount received by the writer when selling an options contract. The premium is collected upfront and kept by the writer regardless of whether the option is exercised."
          />
        </Section>

        <Section icon={<AlertTriangle className="size-4" />} title="Obligation and Assignment">
          <p className="text-sm text-muted-foreground leading-relaxed">
            The key difference between buying and selling an option is{' '}
            <strong className="text-foreground">obligation</strong>. As a buyer, you choose whether
            or not to exercise your right — you are never forced to act. As a seller, you have no
            such choice. If the buyer decides to exercise the contract, the process of fulfilling
            the seller's obligation is called{' '}
            <strong className="text-foreground">assignment</strong>.
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed mt-3">
            When a writer is assigned, they must follow through on the contract terms — either
            selling shares (if assigned on a call) or buying shares (if assigned on a put) at the
            strike price, regardless of where the stock is currently trading in the market.
          </p>
          <Term
            word="Assignment"
            definition="The process by which a writer is required to fulfill their obligation under an options contract. Assignment occurs when the buyer exercises their right, and the writer must respond accordingly."
          />
        </Section>

        <Section icon={<Shield className="size-4" />} title="Risk Overview">
          <p className="text-sm text-muted-foreground leading-relaxed mb-4">
            Because the seller collects the premium upfront and takes on an obligation, their risk
            profile is the inverse of the buyer's.
          </p>

          <div className="rounded-lg border bg-card p-4 mb-3">
            <p className="text-sm font-semibold mb-2">Buyer's Profile (recap)</p>
            <p className="text-sm text-muted-foreground">
              Maximum loss is limited to the premium paid. Potential gain depends on how favorably
              the stock moves relative to the strike price.
            </p>
          </div>

          <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4 mb-4">
            <p className="text-sm font-semibold mb-2">Seller's Profile</p>
            <p className="text-sm text-muted-foreground">
              Maximum gain is limited to the premium received. The potential loss can be
              significantly larger than the premium collected, and differs depending on whether a
              call or put was sold. The specifics will be covered in the Calls &amp; Puts module.
            </p>
          </div>

          <p className="text-sm text-muted-foreground leading-relaxed">
            The key concept to take away here is that selling options carries obligations and a risk
            profile that goes beyond the premium — it is a fundamentally different role than buying.
          </p>
        </Section>

        {/* Summary */}
        <div className="rounded-xl border bg-card p-5 mb-8">
          <h3 className="font-semibold mb-3">Summary</h3>
          <ul className="space-y-1.5 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="size-4 text-primary mt-0.5 shrink-0" />
              Every options contract has a buyer (holder) who holds a right and a seller (writer)
              who holds an obligation
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="size-4 text-primary mt-0.5 shrink-0" />
              The writer receives the premium upfront — this is their maximum possible gain
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="size-4 text-primary mt-0.5 shrink-0" />
              If the buyer exercises the contract, the writer is assigned and must fulfill their
              obligation
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="size-4 text-primary mt-0.5 shrink-0" />
              There are four basic positions: buy a call, buy a put, sell a call, sell a put
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="size-4 text-primary mt-0.5 shrink-0" />
              Selling options carries a different and generally larger risk profile than buying
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="size-4 text-primary mt-0.5 shrink-0" />
              Key terms: writer, assignment, premium (seller's perspective)
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
