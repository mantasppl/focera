import type { DatePreset } from "@/lib/analytics/types";

export type DateRange = {
  start: Date;
  end: Date;
  preset: DatePreset;
};

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function endOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

function startOfYear(date: Date): Date {
  return new Date(date.getFullYear(), 0, 1, 0, 0, 0, 0);
}

export function resolveDateRange(
  preset: DatePreset,
  customStart?: string | null,
  customEnd?: string | null,
): DateRange {
  const now = new Date();
  const todayStart = startOfDay(now);
  const todayEnd = endOfDay(now);

  switch (preset) {
    case "today":
      return { start: todayStart, end: todayEnd, preset };
    case "yesterday": {
      const y = new Date(todayStart);
      y.setDate(y.getDate() - 1);
      return { start: startOfDay(y), end: endOfDay(y), preset };
    }
    case "last_7_days": {
      const start = new Date(todayStart);
      start.setDate(start.getDate() - 6);
      return { start, end: todayEnd, preset };
    }
    case "last_30_days": {
      const start = new Date(todayStart);
      start.setDate(start.getDate() - 29);
      return { start, end: todayEnd, preset };
    }
    case "last_90_days": {
      const start = new Date(todayStart);
      start.setDate(start.getDate() - 89);
      return { start, end: todayEnd, preset };
    }
    case "this_year":
      return { start: startOfYear(now), end: todayEnd, preset };
    case "custom": {
      const start = customStart ? startOfDay(new Date(customStart)) : todayStart;
      const end = customEnd ? endOfDay(new Date(customEnd)) : todayEnd;
      if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
        return { start: todayStart, end: todayEnd, preset: "today" };
      }
      if (start > end) {
        return { start: endOfDay(end), end: startOfDay(start), preset };
      }
      return { start, end, preset };
    }
    default:
      return { start: todayStart, end: todayEnd, preset: "today" };
  }
}

export function parsePreset(value: string | null | undefined): DatePreset {
  const allowed: DatePreset[] = [
    "today",
    "yesterday",
    "last_7_days",
    "last_30_days",
    "last_90_days",
    "this_year",
    "custom",
  ];
  if (value && (allowed as string[]).includes(value)) {
    return value as DatePreset;
  }
  return "last_30_days";
}

export function formatDayLabel(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function eachDay(start: Date, end: Date): Date[] {
  const days: Date[] = [];
  const cursor = startOfDay(start);
  const last = startOfDay(end);
  while (cursor <= last) {
    days.push(new Date(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return days;
}

export function daysBetweenInclusive(start: Date, end: Date): number {
  const ms = startOfDay(end).getTime() - startOfDay(start).getTime();
  return Math.max(1, Math.round(ms / 86_400_000) + 1);
}
