import Link from "next/link";
import FeatureGrid from "@/components/tools/FeatureGrid";

const FEATURES = [
  {
    title: "PSD to AI in your browser",
    description:
      "Turn Photoshop .psd files into Adobe Illustrator .ai files you can open, place, and share — no Creative Cloud install required.",
  },
  {
    title: "Color or grayscale",
    description:
      "Keep full RGB color, or convert to grayscale for print jobs that do not need color.",
  },
  {
    title: "Choose artboard DPI",
    description:
      "Screen (72 DPI) matches pixel size in points. Draft and Print shrink the artboard for 150 or 300 DPI layouts.",
  },
  {
    title: "100% browser-based",
    description:
      "Conversion runs on your device. Nothing uploads to Focera.",
  },
];

export default function PsdToAiLanding() {
  return (
    <article className="tool-content">
      <FeatureGrid
        id="psd-to-ai-features"
        title="Everything you need in a free PSD to AI converter"
        features={FEATURES}
      />

      <section
        className="tool-content__section"
        aria-labelledby="how-it-works"
      >
        <h2 id="how-it-works" className="tool-content__heading">
          How It Works
        </h2>
        <p>
          Adobe Illustrator .ai files are PDF-compatible documents designers
          open for logos, mockups, and print layouts. Focera converts PSD to AI
          on one page — upload, choose color and artboard size, convert, and
          download without an account.
        </p>
        <ol className="tool-content__steps">
          <li>
            <strong>Upload your PSD files.</strong> Drag and drop Photoshop
            .psd files (up to 25 MB each), or click the zone to browse. Add up
            to 10 files per conversion.
          </li>
          <li>
            <strong>Pick color and artboard size.</strong> Color keeps RGB.
            Grayscale is for single-ink print. Screen uses 72 DPI; Print uses
            300 DPI so the artboard matches print layouts.
          </li>
          <li>
            <strong>Convert to AI.</strong> Click Convert to AI. Each PSD is
            flattened and written into a PDF-compatible .ai file locally in
            your browser.
          </li>
          <li>
            <strong>Download your files.</strong> One file downloads as a .ai;
            multiple files download together as a ZIP. Open the result in
            Illustrator, Affinity Designer, or any app that reads PDF-based AI.
          </li>
        </ol>
        <p>
          Jump back to the{" "}
          <a href="#psd-to-ai-tool">PSD to AI converter</a> anytime to process
          another batch.
        </p>
      </section>

      <section
        className="tool-content__section"
        aria-labelledby="what-is-ai"
      >
        <h2 id="what-is-ai" className="tool-content__heading">
          What Is an AI File?
        </h2>
        <p>
          AI is Adobe Illustrator’s native format. Modern .ai files are
          PDF-compatible, so Illustrator, InDesign, and many other design apps
          can open them. Designers use AI for logos, icons, packaging, and
          print-ready artwork.
        </p>
      </section>

      <section
        className="tool-content__section"
        aria-labelledby="why-convert"
      >
        <h2 id="why-convert" className="tool-content__heading">
          Why Convert PSD to AI?
        </h2>
        <p>
          A PSD is Photoshop’s layered raster document. Wrapping the flattened
          composite in an Illustrator-compatible .ai file lets you place that
          artwork on an Illustrator artboard, send it to a printer that asks
          for AI, or open it in tools that prefer Illustrator over Photoshop.
          This converter embeds the PSD pixels in a valid AI file — it does not
          trace shapes the way PNG to SVG does — so photos and detailed
          graphics keep their original look.
        </p>
      </section>

      <section
        className="tool-content__section"
        aria-labelledby="layers"
      >
        <h2 id="layers" className="tool-content__heading">
          Are Photoshop Layers Preserved?
        </h2>
        <p>
          No. Layers are flattened into a single composite on the AI artboard.
          Blend modes, masks, and smart objects are baked into that preview.
          Transparency is kept where the PSD has it. If you need editable
          vector paths instead, export a PNG and use PNG to SVG, then open the
          SVG in Illustrator.
        </p>
      </section>

      <section
        className="tool-content__section"
        aria-labelledby="formats"
      >
        <h2 id="formats" className="tool-content__heading">
          Which PSD Files Work Best?
        </h2>
        <p>
          Use 8-bit RGB Photoshop documents with a saved composite (the default
          when you File &gt; Save). CMYK, Lab, Indexed, 16-bit, and PSB large
          documents are not supported — convert those to 8-bit RGB .psd in
          Photoshop first.
        </p>
      </section>

      <section
        className="tool-content__section"
        aria-labelledby="use-cases"
      >
        <h2 id="use-cases" className="tool-content__heading">
          Popular Use Cases
        </h2>
        <ul className="tool-content__list">
          <li>
            <strong>Hand off to Illustrator</strong> — Open a Photoshop mockup
            on an Illustrator artboard without installing Creative Cloud on
            every machine.
          </li>
          <li>
            <strong>Vendor specs</strong> — Deliver artwork as .ai when a
            printer or ad network asks for Illustrator files.
          </li>
          <li>
            <strong>Place in layouts</strong> — Drop the converted AI into
            InDesign or other PDF-aware layout tools.
          </li>
          <li>
            <strong>Grayscale print</strong> — Convert color PSDs to gray AI
            for one-color jobs.
          </li>
        </ul>
      </section>

      <section
        className="tool-content__section"
        aria-labelledby="privacy"
      >
        <h2 id="privacy" className="tool-content__heading">
          Private by Design
        </h2>
        <p>
          Your PSD files are converted entirely in your browser. Focera does not
          receive the images, store results, or run conversion on a remote
          server. When you leave the page, object URLs are revoked and nothing
          remains on our infrastructure.
        </p>
      </section>

      <section
        className="tool-content__section"
        aria-labelledby="related"
      >
        <h2 id="related" className="tool-content__heading">
          Related Tools
        </h2>
        <ul className="tool-content__list">
          <li>
            <Link href="/psd-to-png">PSD to PNG</Link> — Flatten Photoshop PSD
            files into lossless PNG images with optional transparency.
          </li>
          <li>
            <Link href="/psd-to-jpg">PSD to JPG</Link> — Flatten Photoshop PSD
            files into standard JPEG images for sharing.
          </li>
          <li>
            <Link href="/png-to-eps">PNG to EPS</Link> — Wrap PNG images in
            Encapsulated PostScript for print workflows.
          </li>
          <li>
            <Link href="/png-to-svg">PNG to SVG</Link> — Trace PNG logos and
            icons into scalable SVG paths.
          </li>
          <li>
            <Link href="/png-to-pdf">PNG to PDF</Link> — Combine PNG images into
            a multi-page PDF instead.
          </li>
          <li>
            <Link href="/eps-to-png">EPS to PNG</Link> — Rasterize Encapsulated
            PostScript artwork into a PNG.
          </li>
          <li>
            <Link href="/eps-to-pdf">EPS to PDF</Link> — Turn Encapsulated
            PostScript artwork into a shareable PDF.
          </li>
          <li>
            <Link href="/jpg-to-svg">JPG to SVG</Link> — Trace JPG logos into
            scalable SVG files.
          </li>
          <li>
            <Link href="/image-compressor">Compress Image Size</Link> — Shrink
            raster files for email and uploads.
          </li>
        </ul>
      </section>
    </article>
  );
}
