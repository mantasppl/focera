/**
 * Public analytics surface for Focera tools.
 *
 * Client tools (inside ToolPageShell):
 *   import { useToolAnalytics } from "@/lib/analytics/client";
 *   const { trackSuccess, trackFailure } = useToolAnalytics();
 *
 * Or without React context:
 *   import { trackToolUsage } from "@/lib/analytics/client";
 *   trackToolUsage({ toolId: "merge-pdf", success: true });
 *
 * Server API routes:
 *   import { trackToolUsageServer } from "@/lib/analytics/track";
 *   trackToolUsageServer({ toolId, toolName, success: true }, request);
 */

export { trackToolUsage, useToolAnalytics, ToolAnalyticsProvider } from "@/lib/analytics/client";
export { trackToolUsageServer, recordToolUsageEvent } from "@/lib/analytics/track";
