import Link from "next/link";

export default function ProfitCalculatorLanding() {
  return (
    <article className="tool-content">
      <section
        className="tool-content__section"
        aria-labelledby="what-is-profit"
      >
        <h2 id="what-is-profit" className="tool-content__heading">
          What Is a Profit Calculator and When Should You Use One?
        </h2>
        <p>
          A profit calculator turns two simple inputs — revenue and cost — into
          clear profit and margin figures. Freelancers, shop owners, and
          product teams use it to sanity-check pricing, compare scenarios, and
          decide whether a deal still makes sense after expenses.
        </p>
        <p>
          Searching for a <strong>free profit calculator</strong> usually means
          you need a fast answer without opening a spreadsheet. Focera keeps
          the math private: numbers stay in your browser, update instantly, and
          never require an account.
        </p>
        <p>
          Margin percentage helps you compare jobs of different sizes. A $200
          profit on $1,000 revenue is a 20% margin; the same profit on $10,000
          revenue is only 2%. Seeing both absolute profit and margin side by
          side prevents misleading conclusions.
        </p>
      </section>

      <section
        className="tool-content__section"
        aria-labelledby="why-focera-profit"
      >
        <h2 id="why-focera-profit" className="tool-content__heading">
          Why Use Focera&apos;s Free Online Profit Calculator?
        </h2>
        <p>
          Many online calculators bury results behind ads or force sign-up
          walls. Focera focuses on speed and privacy: enter revenue and cost,
          read profit and margin, move on. No uploads, no stored financials on
          our servers.
        </p>
        <p>
          After you model a deal, open the{" "}
          <Link href="/invoice-generator">invoice generator</Link> to bill the
          client, or browse the{" "}
          <Link href="/tools">full Focera catalog</Link> for related finance
          and marketing tools.
        </p>
      </section>

      <section
        className="tool-content__section"
        aria-labelledby="how-to-profit"
      >
        <h2 id="how-to-profit" className="tool-content__heading">
          How to Calculate Profit and Margin
        </h2>
        <ol className="tool-content__steps">
          <li>
            <strong>Enter revenue.</strong> Use the total amount you expect to
            collect for the product, project, or period.
          </li>
          <li>
            <strong>Enter cost.</strong> Include the expenses you want reflected
            — materials, contractor fees, ads, or unit cost.
          </li>
          <li>
            <strong>Read the results.</strong> Profit is revenue minus cost.
            Margin is profit divided by revenue, shown as a percentage.
          </li>
        </ol>
        <p>
          Use the{" "}
          <a href="#profit-calculator-tool">profit calculator tool</a> at the
          top of this page to run scenarios quickly.
        </p>
      </section>

      <section
        className="tool-content__section"
        aria-labelledby="profit-tips"
      >
        <h2 id="profit-tips" className="tool-content__heading">
          Tips for Better Pricing Decisions
        </h2>
        <p>
          Separate one-time costs from recurring costs when comparing months.
          Recalculate after discounts or rush fees. If margin looks healthy but
          cash timing is tight, plan invoices and payment terms accordingly
          with Focera&apos;s invoice tools.
        </p>
        <p>
          This calculator is a decision aid, not accounting software. Confirm
          tax treatment and formal reporting with your bookkeeping process.
        </p>
      </section>

      <section
        className="tool-content__section"
        aria-labelledby="related-profit"
      >
        <h2 id="related-profit" className="tool-content__heading">
          Related Free Tools from Focera
        </h2>
        <ul>
          <li>
            <Link href="/invoice-generator">Invoice Generator</Link> — Create
            professional PDFs after you settle pricing.
          </li>
          <li>
            <Link href="/utm-builder">UTM Builder</Link> — Tag campaign links
            when you promote a profitable offer.
          </li>
          <li>
            <Link href="/">Focera home</Link> — Discover every free tool in one
            place.
          </li>
        </ul>
      </section>
    </article>
  );
}
