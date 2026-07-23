"use client";

import { useId, useMemo, useState } from "react";
import Button from "@/components/Button";
import Input from "@/components/Input";
import { copyText } from "@/lib/utils";

export default function UTMBuilder() {
  const urlId = useId();
  const sourceId = useId();
  const mediumId = useId();
  const campaignId = useId();

  const [url, setUrl] = useState("https://");
  const [source, setSource] = useState("");
  const [medium, setMedium] = useState("");
  const [campaign, setCampaign] = useState("");
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => {
    const base = url.trim();
    if (!base || base === "https://") return "";

    try {
      const built = new URL(base);
      if (source.trim()) built.searchParams.set("utm_source", source.trim());
      if (medium.trim()) built.searchParams.set("utm_medium", medium.trim());
      if (campaign.trim()) {
        built.searchParams.set("utm_campaign", campaign.trim());
      }
      return built.toString();
    } catch {
      return "";
    }
  }, [url, source, medium, campaign]);

  async function copyResult() {
    if (!result) return;
    const ok = await copyText(result);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    }
  }

  return (
    <div className="tool-grid">
      <div className="tool-panel">
        <Input
          id={urlId}
          label="Destination URL"
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://example.com/page"
          spellCheck={false}
        />
        <Input
          id={sourceId}
          label="utm_source"
          value={source}
          onChange={(e) => setSource(e.target.value)}
          placeholder="newsletter"
        />
        <Input
          id={mediumId}
          label="utm_medium"
          value={medium}
          onChange={(e) => setMedium(e.target.value)}
          placeholder="email"
        />
        <Input
          id={campaignId}
          label="utm_campaign"
          value={campaign}
          onChange={(e) => setCampaign(e.target.value)}
          placeholder="spring_sale"
        />
      </div>

      <div className="tool-panel tool-panel--result">
        <p className="tool-result__label">Tracked URL</p>
        <p className="tool-result__text">
          {result || "Enter a valid URL to generate a tracked link."}
        </p>
        <Button onClick={copyResult} disabled={!result}>
          {copied ? "Copied" : "Copy URL"}
        </Button>
      </div>
    </div>
  );
}
