import { downloadBlob } from "@/lib/image";

export type JsonParseError = {
  message: string;
  position: number | null;
  line: number | null;
  column: number | null;
};

export type JsonResult =
  | { ok: true; value: string; parsed: unknown }
  | { ok: false; error: JsonParseError };

function locateFromPosition(
  text: string,
  position: number,
): { line: number; column: number } {
  const safe = Math.max(0, Math.min(position, text.length));
  let line = 1;
  let column = 1;

  for (let i = 0; i < safe; i += 1) {
    if (text[i] === "\n") {
      line += 1;
      column = 1;
    } else {
      column += 1;
    }
  }

  return { line, column };
}

function extractPosition(message: string): number | null {
  const patterns = [
    /at position (\d+)/i,
    /at offset (\d+)/i,
    /position (\d+)/i,
  ];

  for (const pattern of patterns) {
    const match = message.match(pattern);
    if (match) return Number.parseInt(match[1], 10);
  }

  return null;
}

function extractLineColumn(
  message: string,
): { line: number; column: number } | null {
  const match = message.match(/line (\d+) column (\d+)/i);
  if (!match) return null;
  return {
    line: Number.parseInt(match[1], 10),
    column: Number.parseInt(match[2], 10),
  };
}

export function parseJsonError(text: string, error: unknown): JsonParseError {
  const message =
    error instanceof Error && error.message
      ? error.message
      : "Invalid JSON.";

  const fromLineCol = extractLineColumn(message);
  if (fromLineCol) {
    return {
      message,
      position: null,
      line: fromLineCol.line,
      column: fromLineCol.column,
    };
  }

  const position = extractPosition(message);
  if (position !== null) {
    const { line, column } = locateFromPosition(text, position);
    return { message, position, line, column };
  }

  return { message, position: null, line: null, column: null };
}

export function formatErrorLocation(error: JsonParseError): string | null {
  if (error.line !== null && error.column !== null) {
    return `Line ${error.line}, column ${error.column}`;
  }
  if (error.position !== null) {
    return `Position ${error.position}`;
  }
  return null;
}

export function validateJson(text: string): JsonResult {
  const trimmed = text.trim();
  if (!trimmed) {
    return {
      ok: false,
      error: {
        message: "Enter JSON to validate.",
        position: null,
        line: null,
        column: null,
      },
    };
  }

  try {
    const parsed = JSON.parse(trimmed) as unknown;
    return { ok: true, value: trimmed, parsed };
  } catch (error) {
    return { ok: false, error: parseJsonError(trimmed, error) };
  }
}

export function formatJson(text: string, spaces = 2): JsonResult {
  const result = validateJson(text);
  if (!result.ok) return result;

  return {
    ok: true,
    value: JSON.stringify(result.parsed, null, spaces),
    parsed: result.parsed,
  };
}

export function minifyJson(text: string): JsonResult {
  const result = validateJson(text);
  if (!result.ok) return result;

  return {
    ok: true,
    value: JSON.stringify(result.parsed),
    parsed: result.parsed,
  };
}

export function countJsonLines(text: string): number {
  if (!text) return 1;
  return text.split("\n").length;
}

export function downloadJson(text: string, filename = "formatted.json"): void {
  downloadBlob(
    new Blob([text], { type: "application/json;charset=utf-8" }),
    filename,
  );
}
