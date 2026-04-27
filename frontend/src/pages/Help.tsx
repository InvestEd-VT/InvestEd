import { PageShell } from '@/components/layout/PageShell';

const faqs = [
  {
    question: 'Is this real money?',
    answer:
      'No. InvestEd is a paper-trading platform. You start with a virtual balance of $10,000. No real money is involved, so you can experiment and learn without financial risk.',
  },
  {
    question: 'How do I reset my portfolio?',
    answer:
      'Currently, portfolio resets are handled by an administrator. Contact your instructor or the support team to request a fresh start with the default $10,000 balance.',
  },
  {
    question: 'What are "the Greeks"?',
    answer:
      "The Greeks are a set of metrics that describe how an option's price responds to various factors. Delta measures sensitivity to the underlying stock price, Theta measures time decay, Gamma measures the rate of change of Delta, and Vega measures sensitivity to volatility. You will learn about each of these in the Education modules.",
  },
  {
    question: 'Why is the stock price not updating?',
    answer:
      'Live prices are streamed over a WebSocket connection and refreshed every 15 seconds. If prices appear stale, check your internet connection. The app will automatically reconnect if the connection drops.',
  },
  {
    question: 'What is a limit price?',
    answer:
      'A limit price is the maximum price you are willing to pay when buying, or the minimum price you are willing to accept when selling. Your order will only execute if the market reaches your specified price.',
  },
  {
    question: 'How do I track my performance?',
    answer:
      'Visit the Portfolio page to see your current positions, realized and unrealized gains, and transaction history. The Dashboard also provides an overview of your portfolio value over time.',
  },
];

export default function Help() {
  return (
    <PageShell>
      <div className="max-w-3xl mx-auto space-y-10">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Help Center</h1>
          <p className="text-sm text-gray-500 mt-1">
            Everything you need to know about using InvestEd.
          </p>
        </div>

        {/* Getting Started */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-900">Getting Started</h2>
          <div className="bg-gray-50 rounded-lg p-5 space-y-3 text-sm text-gray-700 leading-relaxed">
            <p>
              Welcome to InvestEd, a paper-trading platform designed to teach college students how
              options trading works -- without risking real money.
            </p>
            <p>
              When you create an account, you receive a virtual balance of <strong>$10,000</strong>.
              Use this balance to place trades, build a portfolio, and learn how the market works
              through hands-on experience.
            </p>
            <p>
              Start by searching for a stock on the Search page, review its details, and place your
              first trade. Your portfolio and transaction history are always accessible from the
              sidebar.
            </p>
          </div>
        </section>

        {/* How Trading Works */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-900">How Trading Works</h2>
          <div className="bg-gray-50 rounded-lg p-5 space-y-3 text-sm text-gray-700 leading-relaxed">
            <p>
              InvestEd focuses on <strong>options trading</strong>. An option is a contract that
              gives you the right to buy or sell a stock at a specific price before a certain date.
            </p>
            <p>
              <strong>Placing a trade:</strong> Navigate to a stock's detail page, select an options
              contract from the chain, enter a quantity, and optionally set a limit price. If you
              don't set a limit price, the order executes at the current market price.
            </p>
            <p>
              <strong>Your first trade:</strong> Try buying a single call option on a stock you are
              familiar with. Watch how its value changes over time as the underlying stock price
              moves. This is the best way to build intuition before diving into the education
              modules.
            </p>
            <p>
              All trades are simulated. Prices come from real market data, but no actual orders are
              sent to an exchange.
            </p>
          </div>
        </section>

        {/* Education Modules */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-900">Education Modules</h2>
          <div className="bg-gray-50 rounded-lg p-5 space-y-3 text-sm text-gray-700 leading-relaxed">
            <p>
              The <strong>Learn</strong> tab in the sidebar gives you access to structured education
              modules that cover options trading from the ground up.
            </p>
            <p>
              Modules are arranged in a progression. You must complete earlier modules before
              unlocking later ones. Each module includes lessons, quizzes, and practical exercises
              tied to the trading simulator.
            </p>
            <p>
              Topics range from the basics of calls and puts through intermediate concepts like
              spreads and the Greeks, all the way to advanced strategies. Work through them at your
              own pace.
            </p>
          </div>
        </section>

        {/* FAQ */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-900">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-5">
                <h3 className="text-sm font-medium text-gray-900">{faq.question}</h3>
                <p className="text-sm text-gray-600 mt-2 leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </PageShell>
  );
}
