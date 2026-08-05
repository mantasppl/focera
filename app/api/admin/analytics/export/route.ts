import * as XLSX from "xlsx";
import { getToolBySlug } from "@/data/tools";
import { requireAdminApi } from "@/lib/admin/guard";
import { parsePreset, resolveDateRange } from "@/lib/analytics/dates";
import { getExportRows } from "@/lib/analytics/queries";
import { safeSpreadsheetCell, toCsv } from "@/lib/security/export-safe";
import { readJsonBody } from "@/lib/security/request";

export const runtime = "nodejs";

function sanitizeFilename(value: string): string {
  return value.replace(/[^a-zA-Z0-9._-]+/g, "-").slice(0, 80);
}

type ExportBody = {
  format?: unknown;
  preset?: unknown;
  start?: unknown;
  end?: unknown;
  toolId?: unknown;
};

export async function POST(request: Request) {
  const denied = await requireAdminApi(request, {
    bucket: "admin-export",
    limit: 20,
    windowMs: 60_000,
    requireCsrf: true,
  });
  if (denied) return denied;

  const parsed = await readJsonBody<ExportBody>(request, 8_192);
  if (!parsed.ok) return parsed.response;

  const format =
    typeof parsed.data.format === "string"
      ? parsed.data.format.toLowerCase()
      : "csv";
  if (format !== "csv" && format !== "xlsx") {
    return Response.json({ error: "Invalid format." }, { status: 400 });
  }

  const preset = parsePreset(
    typeof parsed.data.preset === "string" ? parsed.data.preset : null,
  );
  const range = resolveDateRange(
    preset,
    typeof parsed.data.start === "string" ? parsed.data.start : null,
    typeof parsed.data.end === "string" ? parsed.data.end : null,
  );

  let toolId: string | undefined;
  if (parsed.data.toolId !== undefined && parsed.data.toolId !== null) {
    if (typeof parsed.data.toolId !== "string" || parsed.data.toolId.length > 120) {
      return Response.json({ error: "Invalid toolId." }, { status: 400 });
    }
    toolId = parsed.data.toolId.trim();
    if (toolId && !getToolBySlug(toolId)) {
      return Response.json({ error: "Unknown tool." }, { status: 404 });
    }
  }

  const rows = await getExportRows(range, toolId || undefined);
  const sheetRows = rows.map((row) => ({
    toolId: safeSpreadsheetCell(row.toolId),
    toolName: safeSpreadsheetCell(row.toolName),
    timestamp: safeSpreadsheetCell(
      row.timestamp?.toISOString?.() || String(row.timestamp),
    ),
    sessionId: safeSpreadsheetCell(row.sessionId),
    country: safeSpreadsheetCell(row.country || ""),
    browser: safeSpreadsheetCell(row.browser || ""),
    os: safeSpreadsheetCell(row.os || ""),
    device: safeSpreadsheetCell(row.device || ""),
    referrer: safeSpreadsheetCell(row.referrer || ""),
    success: row.success ? "true" : "false",
  }));

  const stamp = new Date().toISOString().slice(0, 10);
  const base = sanitizeFilename(
    toolId ? `focera-analytics-${toolId}-${stamp}` : `focera-analytics-${stamp}`,
  );

  const headers = [
    "toolId",
    "toolName",
    "timestamp",
    "sessionId",
    "country",
    "browser",
    "os",
    "device",
    "referrer",
    "success",
  ];

  if (format === "csv") {
    return new Response(toCsv(sheetRows, headers), {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${base}.csv"`,
        "Cache-Control": "no-store",
      },
    });
  }

  const worksheet = XLSX.utils.json_to_sheet(sheetRows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Usage");
  const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" }) as Buffer;

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${base}.xlsx"`,
      "Cache-Control": "no-store",
    },
  });
}
