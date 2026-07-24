import Link from "next/link";
import FeatureGrid from "@/components/tools/FeatureGrid";

const FEATURES = [
  {
    title: "Random harmonious palettes",
    description:
      "Generate fresh five-color schemes with analogous, complementary, triadic, and monochrome-inspired relationships.",
  },
  {
    title: "Lock colors you love",
    description:
      "Pin any swatch and regenerate the rest so you can iterate around a brand color without starting over.",
  },
  {
    title: "Export CSS & Tailwind",
    description:
      "Copy ready-to-paste CSS custom properties or Tailwind theme color keys in one click.",
  },
  {
    title: "HEX and RGB exports",
    description:
      "Grab a clean list of HEX or RGB values for design tools, docs, and handoffs.",
  },
  {
    title: "One-click color copy",
    description:
      "Tap any swatch to copy its HEX code instantly — then tweak with the built-in color picker.",
  },
  {
    title: "WCAG contrast checker",
    description:
      "Compare any two palette colors against AA and AAA thresholds for normal and large text.",
  },
];

export default function ColorPaletteGeneratorLanding() {
  return (
    <article className="tool-content">
      <FeatureGrid
        id="color-palette-features"
        title="Everything you need in a free color palette generator"
        features={FEATURES}
      />

      <section
        className="tool-content__section"
        aria-labelledby="what-is-color-palette-generator"
      >
        <h2
          id="what-is-color-palette-generator"
          className="tool-content__heading"
        >
          What Is a Color Palette Generator?
        </h2>
        <p>
          A color palette generator creates coordinated sets of colors you can
          use for branding, UI design, presentations, and marketing. Instead of
          guessing hex codes one by one, you start from a harmonious scheme —
          then lock favorites, regenerate the rest, and export the palette in
          the format your workflow needs.
        </p>
        <p>
          Designers and developers reach for a{" "}
          <strong>free color palette generator</strong> when building landing
          pages, app themes, mood boards, or illustration systems. A strong
          palette usually balances a primary accent, supporting hues, and
          neutrals so text stays readable and interfaces feel intentional.
        </p>
        <p>
          Focera&apos;s generator runs entirely in your browser. Create random
          palettes, lock colors, copy HEX values, export CSS or Tailwind, and
          check contrast — without uploading anything to a server.
        </p>
      </section>

      <section
        className="tool-content__section"
        aria-labelledby="why-Focera-palettes"
      >
        <h2 id="why-Focera-palettes" className="tool-content__heading">
          Why Use Focera&apos;s Free Online Color Palette Generator?
        </h2>
        <p>
          Many palette tools stop at pretty swatches. This one is built for the
          handoff: lock the colors you want to keep, regenerate unlocked slots,
          then export CSS variables, Tailwind theme keys, HEX lists, or RGB
          values. Click any swatch to copy its HEX code for Figma, CSS, or
          documentation.
        </p>
        <p>
          Accessibility is part of the workflow, not an afterthought. The
          built-in contrast checker measures WCAG AA and AAA ratios between any
          two colors in the palette so you can catch unreadable text/background
          pairs before they ship.
        </p>
        <p>
          Everything stays local and free — no account, no quota, and no
          watermarked exports. When you need complementary utilities, browse the{" "}
          <Link href="/tools">Focera catalog</Link> for converters, generators,
          and developer helpers that follow the same private-by-default model.
        </p>
      </section>

      <section
        className="tool-content__section"
        aria-labelledby="how-to-generate-palette"
      >
        <h2 id="how-to-generate-palette" className="tool-content__heading">
          How to Generate and Export a Color Palette
        </h2>
        <p>
          Creating a usable palette should take seconds. Use the{" "}
          <a href="#color-palette-generator-tool">color palette generator</a> at
          the top of this page:
        </p>
        <ol className="tool-content__steps">
          <li>
            <strong>Generate a random palette.</strong> Click Generate to create
            a five-color scheme. Each run explores a different harmony style —
            analogous, complementary, triadic, monochrome, or soft accent sets.
          </li>
          <li>
            <strong>Lock colors you want to keep.</strong> Use the lock control
            on any swatch. Locked colors stay put while unlocked ones reshuffle
            on the next generate.
          </li>
          <li>
            <strong>Fine-tune with the color picker.</strong> Open the picker on
            a swatch to nudge hue, saturation, or lightness toward your brand.
            Click the HEX label anytime to copy that color.
          </li>
          <li>
            <strong>Export for your stack.</strong> Choose CSS, Tailwind, HEX, or
            RGB, then copy the output into a stylesheet, config file, or design
            brief.
          </li>
          <li>
            <strong>Check contrast.</strong> Pick a text color and background
            from the palette and review AA/AAA results before committing to UI
            roles like body text, buttons, or captions.
          </li>
        </ol>
      </section>

      <section
        className="tool-content__section"
        aria-labelledby="export-formats-explained"
      >
        <h2 id="export-formats-explained" className="tool-content__heading">
          CSS, Tailwind, HEX, and RGB Exports Explained
        </h2>
        <p>
          <strong>CSS export</strong> outputs custom properties such as{" "}
          <code>--color-1</code> through <code>--color-5</code>. Drop them into
          a <code>:root</code> block and reference them across components for
          consistent theming.
        </p>
        <p>
          <strong>Tailwind export</strong> formats palette entries as theme color
          keys you can paste into <code>theme.extend.colors</code>. That makes it
          easy to use classes like <code>bg-palette1</code> or{" "}
          <code>text-palette3</code> once wired into your config.
        </p>
        <p>
          <strong>HEX</strong> and <strong>RGB</strong> exports give one color
          per line — ideal for design systems, mood boards, print specs, or tools
          that expect raw color values rather than framework syntax.
        </p>
      </section>

      <section
        className="tool-content__section"
        aria-labelledby="contrast-wcag"
      >
        <h2 id="contrast-wcag" className="tool-content__heading">
          Why Contrast Checking Matters
        </h2>
        <p>
          Beautiful palettes can still fail accessibility. WCAG defines minimum
          contrast ratios so text remains readable for people with low vision or
          in bright environments. Normal text typically needs at least 4.5:1 for
          AA, while large text can pass at 3:1. AAA raises the bar further for
          stricter products and public-facing content.
        </p>
        <p>
          Use the contrast checker after you settle a primary brand color and its
          backgrounds. If a pair fails, lock the stronger color, regenerate
          supporting tones, or darken/lighten with the picker until the ratio
          clears the level you need.
        </p>
      </section>

      <section
        className="tool-content__section"
        aria-labelledby="use-cases-palette"
      >
        <h2 id="use-cases-palette" className="tool-content__heading">
          Popular Use Cases for a Palette Maker
        </h2>
        <ul className="tool-content__list">
          <li>
            <strong>Brand exploration</strong> — Generate options around a
            locked accent before committing to a full visual identity.
          </li>
          <li>
            <strong>UI theming</strong> — Export CSS variables or Tailwind colors
            for light themes, dark surfaces, and interactive states.
          </li>
          <li>
            <strong>Marketing creatives</strong> — Align ads, landing pages, and
            social templates on a shared five-color system.
          </li>
          <li>
            <strong>Design handoffs</strong> — Share HEX/RGB lists with clients
            or teammates without opening a design file.
          </li>
          <li>
            <strong>Accessibility reviews</strong> — Validate text and background
            pairs before shipping components.
          </li>
        </ul>
      </section>

      <section
        className="tool-content__section"
        aria-labelledby="privacy-palette"
      >
        <h2 id="privacy-palette" className="tool-content__heading">
          Privacy and Local Generation
        </h2>
        <p>
          Palette generation, locking, exports, and contrast checks all run on
          your device. Colors are not uploaded to Focera for processing, so you
          can explore brand directions privately — including unreleased product
          themes.
        </p>
        <p>
          For more local-first utilities, try the{" "}
          <Link href="/qr-generator">QR code generator</Link>,{" "}
          <Link href="/markdown-editor">Markdown editor</Link>, or{" "}
          <Link href="/json-formatter">JSON formatter</Link>.
        </p>
      </section>

      <section
        className="tool-content__section"
        aria-labelledby="related-palette"
      >
        <h2 id="related-palette" className="tool-content__heading">
          Related Free Tools from Focera
        </h2>
        <ul className="tool-content__list">
          <li>
            <Link href="/background-remover">Background Remover</Link> — Cut out
            product photos to pair with your new palette.
          </li>
          <li>
            <Link href="/qr-generator">QR Code Generator</Link> — Create
            high-contrast codes that match campaign colors.
          </li>
          <li>
            <Link href="/html-css-js-minifier">HTML CSS JS Minifier</Link> —
            Compress stylesheets after you wire in CSS variables.
          </li>
          <li>
            <Link href="/">Focera home</Link> — Browse every free generator,
            converter, and developer helper in one place.
          </li>
        </ul>
      </section>
    </article>
  );
}
