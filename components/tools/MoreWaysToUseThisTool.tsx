import Link from "next/link";
import {
  getSeoLandingBySlug,
  getSiblingSeoLandings,
} from "@/data/seo-landings";

type MoreWaysToUseThisToolProps = {
  currentSlug: string;
};

export default function MoreWaysToUseThisTool({
  currentSlug,
}: MoreWaysToUseThisToolProps) {
  const current = getSeoLandingBySlug(currentSlug);
  const siblings = getSiblingSeoLandings(currentSlug);

  if (!current || !siblings.length) return null;

  const intro =
    current.parentToolSlug === "qr-generator"
      ? "The same generator covers Instagram, Wi‑Fi, menus, vCards, logos, and print files. Open a focused workflow when you need one of these:"
      : "The same AI cutout works for ID photos, store listings, portraits, and design files. Open a focused workflow when you need one of these:";

  return (
    <section className="tool-content__section" aria-labelledby="more-ways">
      <h2 id="more-ways" className="tool-content__heading">
        More ways to use this tool:
      </h2>
      <p>{intro}</p>
      <ul className="tool-content__list">
        {siblings.map((page) => (
          <li key={page.slug}>
            <Link href={page.href}>{page.h1}</Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
