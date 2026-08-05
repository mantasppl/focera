/** Neutralize spreadsheet formula injection for CSV/Excel cell values. */
export function safeSpreadsheetCell(value: unknown): string {
  const text = value == null ? "" : String(value);
  if (!text) return "";
  // Excel / Sheets formula injection prefixes
  if (/^[=+\-@\t\r]/.test(text)) {
    return `'${text}`;
  }
  return text;
}

export function toCsv(
  rows: Array<Record<string, string>>,
  headers: string[],
): string {
  const escape = (value: string) => {
    const safe = safeSpreadsheetCell(value);
    if (/[",\n\r]/.test(safe)) return `"${safe.replace(/"/g, '""')}"`;
    return safe;
  };

  return [
    headers.join(","),
    ...rows.map((row) => headers.map((key) => escape(row[key] ?? "")).join(",")),
  ].join("\n");
}
