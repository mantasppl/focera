import { ensureAnalyticsSchema, getDb } from "@/lib/analytics/db";
import { extractRequestCountry } from "@/lib/analytics/request-meta";
import { searchQueries } from "@/lib/analytics/schema";

const MAX_QUERY_LENGTH = 80;

export function normalizeSearchQuery(raw: string): string | null {
  const normalized = raw
    .trim()
    .toLowerCase()
    .replace(/[\u0000-\u001f]+/g, " ")
    .replace(/\s+/g, " ")
    .slice(0, MAX_QUERY_LENGTH);
  return normalized.length >= 2 ? normalized : null;
}

export async function recordSearchQuery(
  input: { sessionId: string; query: string },
  request: Request,
): Promise<{ recorded: boolean }> {
  const query = normalizeSearchQuery(input.query);
  if (!query) return { recorded: false };

  await ensureAnalyticsSchema();
  const country = extractRequestCountry(request);
  const countryCode = country && country !== "XX" ? country.toUpperCase() : null;

  try {
    await getDb().insert(searchQueries).values({
      eventId: crypto.randomUUID(),
      timestamp: new Date(),
      sessionId: input.sessionId,
      query,
      country: countryCode,
    });
    return { recorded: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (
      message.includes("UNIQUE") ||
      message.includes("unique") ||
      message.includes("SQLITE_CONSTRAINT")
    ) {
      return { recorded: false };
    }
    throw error;
  }
}
