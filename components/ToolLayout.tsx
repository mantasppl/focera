import type { ReactNode } from "react";
import type { Tool } from "@/data/tools";
import CTA from "@/components/CTA";
import FAQ from "@/components/FAQ";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { cn } from "@/lib/utils";

type ToolLayoutProps = {
  tool: Tool;
  children: ReactNode;
  className?: string;
};

export default function ToolLayout({
  tool,
  children,
  className,
}: ToolLayoutProps) {
  return (
    <div className={cn("tool-shell", className)}>
      <div className="tool-shell__glow" aria-hidden="true" />
      <Header />

      <main className="tool-shell__main">
        <section className="tool-hero">
          <p className="tool-hero__eyebrow">
            {tool.status === "soon" ? "Coming soon" : "Free tool"}
          </p>
          <h1 className="tool-hero__title">{tool.name}</h1>
          <p className="tool-hero__lede">{tool.description}</p>
        </section>

        <section className="tool-workspace" aria-label={tool.name}>
          {children}
        </section>

        <FAQ items={tool.faq} />
        <CTA />
      </main>

      <Footer />
    </div>
  );
}
