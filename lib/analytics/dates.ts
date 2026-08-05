import type { DatePreset } from "@/lib/analytics/types";
import {
  addZonedDays,
  endOfZonedDay,
  formatZonedDay,
  parseZonedDateInput,
  startOfZonedDay,
  startOfZonedYear,
} from "@/lib/analytics/timezone";

export type DateRange = {
  start: Date;
  end: Date;
  preset: DatePreset;
};

export function resolveDateRange(
  preset: DatePreset,
  customStart?: string | null,
  customEnd?: string | null,
): DateRange {
  const now = new Date();
  const todayStart = startOfZonedDay(now);
  const todayEnd = endOfZonedDay(now);

  switch (preset) {
    case "today":
      return { start: todayStart, end: todayEnd, preset };
    case "yesterday": {
      const y = addZonedDays(todayStart, -1);
      return { start: startOfZonedDay(y), end: endOfZonedDay(y), preset };
    }
    case "last_7_days":
      return {
        start: addZonedDays(todayStart, -6),
        end: todayEnd,
        preset,
      };
    case "last_30_days":
      return {
        start: addZonedDays(todayStart, -29),
        end: todayEnd,
        preset,
      };
    case "last_90_days":
      return {
        start: addZonedDays(todayStart, -89),
        end: todayEnd,
        preset,
      };
    case "this_year":
      return { start: startOfZonedYear(now), end: todayEnd, preset };
    case "custom": {
      const start = customStart
        ? parseZonedDateInput(customStart)
        : todayStart;
      const endBase = customEnd ? parseZonedDateInput(customEnd) : todayStart;
      if (!start || !endBase) {
        return { start: todayStart, end: todayEnd, preset: "today" };
      }
      const end = endOfZonedDay(endBase);
      if (start > end) {
        return {
          start: startOfZonedDay(endBase),
          end: endOfZonedDay(start),
          preset,
        };
      }
      return { start: startOfZonedDay(start), end, preset };
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
  return formatZonedDay(date);
}

export function eachDay(start: Date, end: Date): Date[] {
  const days: Date[] = [];
  let cursor = startOfZonedDay(start);
  const last = startOfZonedDay(end);
  while (cursor.getTime() <= last.getTime()) {
    days.push(new Date(cursor));
    cursor = addZonedDays(cursor, 1);
  }
  return days;
}

export function daysBetweenInclusive(start: Date, end: Date): number {
  return Math.max(1, eachDay(start, end).length);
}
