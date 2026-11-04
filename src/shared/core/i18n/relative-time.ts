import { getLocale } from "./current-locale";

const UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ["year", 31_536_000],
  ["month", 2_592_000],
  ["week", 604_800],
  ["day", 86_400],
  ["hour", 3_600],
  ["minute", 60],
];

let formatter: Intl.RelativeTimeFormat | null = null;

/**
 * How long ago (or until) a time is, in the app's language ("3 days ago", "yesterday"); `null`
 * under a minute, which each caller words itself ("just now", "updated now").
 */
export function relativeTime(time: number | string, now = Date.now()): string | null {
  formatter ??= new Intl.RelativeTimeFormat(getLocale(), { numeric: "auto" });
  const seconds = Math.round((new Date(time).getTime() - now) / 1000);
  for (const [unit, size] of UNITS) {
    if (Math.abs(seconds) >= size) return formatter.format(Math.round(seconds / size), unit);
  }
  return null;
}
