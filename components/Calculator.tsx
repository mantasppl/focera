"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import Input from "@/components/Input";
import { useToolAnalytics } from "@/lib/analytics/client";
import { toNumber } from "@/lib/utils";

export default function Calculator() {
  const { trackSuccess } = useToolAnalytics();
  const revenueId = useId();
  const costId = useId();
  const [revenue, setRevenue] = useState("1000");
  const [cost, setCost] = useState("650");
  const trackedRef = useRef(false);

  const { profit, margin } = useMemo(() => {
    const r = toNumber(revenue);
    const c = toNumber(cost);
    const p = r - c;
    const m = r === 0 ? 0 : (p / r) * 100;
    return { profit: p, margin: m };
  }, [revenue, cost]);

  useEffect(() => {
    if (trackedRef.current) return;
    if (revenue === "1000" && cost === "650") return;
    const timer = window.setTimeout(() => {
      if (trackedRef.current) return;
      trackedRef.current = true;
      trackSuccess();
    }, 1200);
    return () => window.clearTimeout(timer);
  }, [revenue, cost, trackSuccess]);

  return (
    <div className="tool-grid">
      <div className="tool-panel">
        <Input
          id={revenueId}
          label="Revenue"
          type="number"
          inputMode="decimal"
          min="0"
          step="any"
          value={revenue}
          onChange={(e) => setRevenue(e.target.value)}
        />
        <Input
          id={costId}
          label="Cost"
          type="number"
          inputMode="decimal"
          min="0"
          step="any"
          value={cost}
          onChange={(e) => setCost(e.target.value)}
        />
      </div>

      <div className="tool-panel tool-panel--result">
        <p className="tool-result__label">Profit</p>
        <p className="tool-result__value">{profit.toFixed(2)}</p>
        <p className="tool-result__meta">Margin: {margin.toFixed(1)}%</p>
      </div>
    </div>
  );
}
