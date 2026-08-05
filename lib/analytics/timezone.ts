/** Analytics dashboard timezone (IANA). */
export const ANALYTICS_TIMEZONE = "Europe/Vilnius";

export type ZonedParts = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
};

const partsFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: ANALYTICS_TIMEZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hourCycle: "h23",
});

export function getZonedParts(
  date: Date,
  timeZone: string = ANALYTICS_TIMEZONE,
): ZonedParts {
  const formatter =
    timeZone === ANALYTICS_TIMEZONE
      ? partsFormatter
      : new Intl.DateTimeFormat("en-US", {
          timeZone,
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hourCycle: "h23",
        });

  const parts = formatter.formatToParts(date);
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((part) => part.type === type)?.value ?? "0");

  return {
    year: get("year"),
    month: get("month"),
    day: get("day"),
    hour: get("hour"),
    minute: get("minute"),
    second: get("second"),
  };
}

/** Convert a wall-clock time in Europe/Vilnius to a UTC Date. */
export function zonedTimeToUtc(
  year: number,
  month: number,
  day: number,
  hour = 0,
  minute = 0,
  second = 0,
  millisecond = 0,
): Date {
  const targetAsUtc = Date.UTC(year, month - 1, day, hour, minute, second, millisecond);
  let instant = targetAsUtc;

  // Converge on the UTC instant whose Vilnius wall time matches the target.
  for (let i = 0; i < 4; i += 1) {
    const parts = getZonedParts(new Date(instant));
    const shownAsUtc = Date.UTC(
      parts.year,
      parts.month - 1,
      parts.day,
      parts.hour,
      parts.minute,
      parts.second,
      millisecond,
    );
    instant += targetAsUtc - shownAsUtc;
  }

  return new Date(instant);
}

export function startOfZonedDay(date: Date = new Date()): Date {
  const parts = getZonedParts(date);
  return zonedTimeToUtc(parts.year, parts.month, parts.day, 0, 0, 0, 0);
}

export function endOfZonedDay(date: Date = new Date()): Date {
  const parts = getZonedParts(date);
  return zonedTimeToUtc(parts.year, parts.month, parts.day, 23, 59, 59, 999);
}

export function startOfZonedYear(date: Date = new Date()): Date {
  const parts = getZonedParts(date);
  return zonedTimeToUtc(parts.year, 1, 1, 0, 0, 0, 0);
}

/** Parse YYYY-MM-DD as a calendar day in Europe/Vilnius. */
export function parseZonedDateInput(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (!year || month < 1 || month > 12 || day < 1 || day > 31) return null;
  return zonedTimeToUtc(year, month, day, 0, 0, 0, 0);
}

export function formatZonedDay(date: Date): string {
  const parts = getZonedParts(date);
  return `${parts.year}-${String(parts.month).padStart(2, "0")}-${String(parts.day).padStart(2, "0")}`;
}

export function formatZonedHour(date: Date): number {
  return getZonedParts(date).hour;
}

export function formatZonedMonth(date: Date): string {
  const parts = getZonedParts(date);
  return `${parts.year}-${String(parts.month).padStart(2, "0")}`;
}

/** ISO week label in Europe/Vilnius, e.g. 2026-W14 */
export function formatZonedWeek(date: Date): string {
  const parts = getZonedParts(date);
  // Use Thursday-based ISO week calculation on the zoned calendar date.
  const utcNoon = Date.UTC(parts.year, parts.month - 1, parts.day, 12, 0, 0);
  const day = new Date(utcNoon);
  const dayNum = day.getUTCDay() || 7;
  day.setUTCDate(day.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(day.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((day.getTime() - yearStart.getTime()) / 86_400_000 + 1) / 7);
  return `${day.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
}

export function addZonedDays(date: Date, days: number): Date {
  const parts = getZonedParts(date);
  // Move via UTC noon on the calendar date to avoid DST gaps.
  const noon = Date.UTC(parts.year, parts.month - 1, parts.day + days, 12, 0, 0);
  return startOfZonedDay(new Date(noon));
}

export function todayZonedIso(): string {
  return formatZonedDay(new Date());
}
