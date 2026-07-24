import Link from "next/link";
import FeatureGrid from "@/components/tools/FeatureGrid";

const FEATURES = [
  {
    title: "Seven conversion types",
    description:
      "Length, weight, temperature, volume, area, speed, and data storage — switch categories without leaving the page.",
  },
  {
    title: "Instant results",
    description:
      "Values update as you type. No submit button, no round trip, no waiting on a server.",
  },
  {
    title: "Swap units in one tap",
    description:
      "Flip from and to units (and the current result) when you need the reverse conversion.",
  },
  {
    title: "Copy-ready output",
    description:
      "Copy the converted number to your clipboard for homework, shipping forms, or recipes.",
  },
  {
    title: "Metric and imperial",
    description:
      "Common SI and US customary units side by side — meters and feet, liters and gallons, kg and lb.",
  },
  {
    title: "Private by design",
    description:
      "Every conversion runs locally in your browser. Nothing is uploaded to Focera.",
  },
];

export default function UnitConverterLanding() {
  return (
    <article className="tool-content">
      <FeatureGrid
        id="unit-converter-features"
        title="Everything you need in a free unit converter"
        features={FEATURES}
      />

      <section
        className="tool-content__section"
        aria-labelledby="what-is-unit-converter"
      >
        <h2 id="what-is-unit-converter" className="tool-content__heading">
          What Is a Unit Converter?
        </h2>
        <p>
          A unit converter translates a measurement from one system into another
          — for example meters to feet, kilograms to pounds, or Celsius to
          Fahrenheit. Instead of looking up formulas or doing the arithmetic by
          hand, you enter a value, pick the units, and read the equivalent
          instantly.
        </p>
        <p>
          Students, shoppers, travelers, cooks, developers, and engineers all
          hit unit mismatches every day: package dimensions in inches, recipes in
          milliliters, download sizes in gigabytes, or weather in Celsius. A{" "}
          <strong>free online unit converter</strong> keeps those lookups in one
          place without installing an app.
        </p>
        <p>
          Focera&apos;s converter covers length, weight, temperature, volume,
          area, speed, and data storage. Conversions run entirely in your
          browser so results stay fast and private.
        </p>
      </section>

      <section
        className="tool-content__section"
        aria-labelledby="why-Focera-units"
      >
        <h2 id="why-Focera-units" className="tool-content__heading">
          Why Use Focera&apos;s Free Online Unit Converter?
        </h2>
        <p>
          Many converter pages are cluttered with ads, force a page reload for
          each change, or send numbers to a remote API. This tool is built for
          speed: category tabs, live math, swap, and copy — all on one page.
        </p>
        <p>
          You get the categories people search for most: metric ↔ imperial
          length and weight, cooking volumes, land area, travel speeds, weather
          temperatures, and file sizes with 1024-based kilobytes through
          petabytes. No account, no daily quota, and no watermark on the result.
        </p>
        <p>
          Jump to the{" "}
          <a href="#unit-converter-tool">unit converter tool</a> at the top of
          this page, or browse the full{" "}
          <Link href="/tools">Focera catalog</Link> for related calculators and
          utilities.
        </p>
      </section>

      <section
        className="tool-content__section"
        aria-labelledby="how-to-convert-units"
      >
        <h2 id="how-to-convert-units" className="tool-content__heading">
          How to Convert Units in Seconds
        </h2>
        <p>
          Use the workspace at the top of the page. Everything updates in place:
        </p>
        <ol className="tool-content__steps">
          <li>
            <strong>Pick a category.</strong> Choose Length, Weight,
            Temperature, Volume, Area, Speed, or Data Storage.
          </li>
          <li>
            <strong>Enter a value.</strong> Type the number you want to convert
            in the From field.
          </li>
          <li>
            <strong>Select units.</strong> Set the source and target units. The
            To field updates instantly.
          </li>
          <li>
            <strong>Swap or copy.</strong> Use Swap to reverse the conversion, or
            Copy result to paste elsewhere.
          </li>
        </ol>
        <p>
          Temperature uses the correct Celsius ↔ Fahrenheit ↔ Kelvin formulas.
          Other categories convert through a precise base unit so chaining units
          stays consistent.
        </p>
      </section>

      <section
        className="tool-content__section"
        aria-labelledby="supported-units"
      >
        <h2 id="supported-units" className="tool-content__heading">
          Supported Conversion Categories
        </h2>
        <ul className="tool-content__list">
          <li>
            <strong>Length</strong> — m, km, cm, mm, miles, yards, feet, inches,
            nautical miles.
          </li>
          <li>
            <strong>Weight</strong> — kg, g, mg, metric tons, pounds, ounces,
            stone.
          </li>
          <li>
            <strong>Temperature</strong> — Celsius, Fahrenheit, Kelvin.
          </li>
          <li>
            <strong>Volume</strong> — liters, milliliters, cubic meters, US and
            imperial gallons, quarts, pints, cups, fluid ounces, cubic feet and
            inches.
          </li>
          <li>
            <strong>Area</strong> — m², km², cm², hectares, acres, square miles,
            feet, yards, and inches.
          </li>
          <li>
            <strong>Speed</strong> — m/s, km/h, mph, ft/s, knots.
          </li>
          <li>
            <strong>Data storage</strong> — bits, bytes, KB, MB, GB, TB, PB
            (1024-based, as commonly used for file sizes).
          </li>
        </ul>
      </section>

      <section
        className="tool-content__section"
        aria-labelledby="unit-tips"
      >
        <h2 id="unit-tips" className="tool-content__heading">
          Tips for Accurate Conversions
        </h2>
        <ul className="tool-content__list">
          <li>
            <strong>Watch US vs imperial gallons.</strong> Liquid volume differs
            between US customary and imperial measures — pick the matching unit.
          </li>
          <li>
            <strong>Temperature is not a scale factor.</strong> Zero Celsius is
            not zero Fahrenheit; always use the dedicated temperature category.
          </li>
          <li>
            <strong>Data sizes may use 1000 or 1024.</strong> This tool uses
            binary-style 1024 multiples for KB–PB, matching most OS file
            dialogs.
          </li>
          <li>
            <strong>Round for the job.</strong> Engineering tolerances and
            cooking may need different precision — copy the full value, then
            round where it matters.
          </li>
        </ul>
      </section>

      <section
        className="tool-content__section"
        aria-labelledby="unit-use-cases"
      >
        <h2 id="unit-use-cases" className="tool-content__heading">
          Popular Use Cases
        </h2>
        <ul className="tool-content__list">
          <li>
            <strong>Travel & weather</strong> — Convert temperatures and speeds
            when forecasts or road signs use another system.
          </li>
          <li>
            <strong>Shopping & shipping</strong> — Translate package weight and
            dimensions between metric and imperial labels.
          </li>
          <li>
            <strong>Cooking</strong> — Move between liters, cups, and fluid
            ounces when following international recipes.
          </li>
          <li>
            <strong>School & homework</strong> — Check length, area, and volume
            answers quickly while learning conversion factors.
          </li>
          <li>
            <strong>Files & storage</strong> — Estimate how many MB fit in a GB
            or compare download sizes.
          </li>
        </ul>
      </section>

      <section
        className="tool-content__section"
        aria-labelledby="unit-privacy"
      >
        <h2 id="unit-privacy" className="tool-content__heading">
          Privacy and Local Processing
        </h2>
        <p>
          Conversion math runs in your browser with no network request for the
          calculation itself. Values you type are not uploaded to Focera for
          processing.
        </p>
        <p>
          That keeps everyday measurements private and the UI snappy on mobile
          and desktop. Clear the fields on shared computers if you prefer a
          blank workspace for the next person.
        </p>
      </section>

      <section
        className="tool-content__section"
        aria-labelledby="related-units"
      >
        <h2 id="related-units" className="tool-content__heading">
          Related Free Tools from Focera
        </h2>
        <ul className="tool-content__list">
          <li>
            <Link href="/profit-calculator">Profit Calculator</Link> — Work out
            profit and margin from revenue and cost.
          </li>
          <li>
            <Link href="/invoice-generator">Invoice Generator</Link> — Build
            professional invoices with VAT and PDF download.
          </li>
          <li>
            <Link href="/json-formatter">JSON Formatter</Link> — Format and
            validate JSON locally in your browser.
          </li>
          <li>
            <Link href="/">Focera home</Link> — Browse every free generator,
            calculator, and converter in one place.
          </li>
        </ul>
      </section>
    </article>
  );
}
