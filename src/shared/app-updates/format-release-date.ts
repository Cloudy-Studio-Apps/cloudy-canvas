import { getLocale } from "@shared/core";

/** A changelog date (`YYYY-MM-DD`) written out in the app's language, e.g. "2 November 2026". */
export function formatReleaseDate(date: string): string {
  const format = new Intl.DateTimeFormat(getLocale(), { dateStyle: "long", timeZone: "UTC" });
  return format.format(new Date(`${date}T00:00:00Z`));
}
