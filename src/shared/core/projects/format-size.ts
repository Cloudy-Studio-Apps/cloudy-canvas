import { getLocale } from "../i18n/current-locale";

const UNITS = ["B", "KB", "MB", "GB", "TB"];

/** A byte count for people ("48 MB", "1.2 GB"), numbers written in the app's language. */
export function formatSize(bytes: number): string {
  let value = Math.max(0, bytes);
  let unit = 0;
  while (value >= 1000 && unit < UNITS.length - 1) {
    value /= 1000;
    unit += 1;
  }
  const digits = unit === 0 || value >= 100 ? 0 : 1;
  const text = new Intl.NumberFormat(getLocale(), {
    maximumFractionDigits: digits,
  }).format(value);
  return `${text} ${UNITS[unit]}`;
}
