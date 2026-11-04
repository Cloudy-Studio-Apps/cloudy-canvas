import { t } from "../data.i18n";
import type { DataField, FieldFormat } from "../source";
import type { ValueKind } from "./format-value.types";

/** The binding's format over the field's: set keys of the binding win. */
function mergeFormat(field: DataField | null, format: FieldFormat | undefined): FieldFormat {
  const out: Record<string, unknown> = { ...field?.format };
  for (const [key, value] of Object.entries(format ?? {}))
    if (value !== undefined) out[key] = value;
  return out as FieldFormat;
}

function kindOf(value: unknown, field: DataField | null): ValueKind {
  const type = field?.type;
  if (type === "currency") return "currency";
  if (type === "integer" || type === "number") return "number";
  if (type === "date") return "date";
  if (type === "boolean") return "boolean";
  if (type) return "text";
  if (typeof value === "number") return "number";
  if (typeof value === "boolean") return "boolean";
  return "text";
}

function toNumber(value: unknown): number | null {
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (typeof value !== "string" || !value.trim()) return null;
  const n = Number(value.trim());
  return Number.isFinite(n) ? n : null;
}

function toBoolean(value: unknown): boolean | null {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    const v = value.trim().toLowerCase();
    if (v === "true") return true;
    if (v === "false") return false;
  }
  return null;
}

function toDate(value: unknown): { date: Date; dateOnly: boolean } | null {
  let ms: number;
  if (typeof value === "number") ms = value;
  else if (typeof value === "string") ms = Date.parse(value);
  else return null;
  if (!Number.isFinite(ms)) return null;
  const date = new Date(ms);
  if (Number.isNaN(date.getTime())) return null;
  return { date, dateOnly: typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value.trim()) };
}

function formatNumber(n: number, kind: ValueKind, f: FieldFormat, locale: string): string {
  try {
    if (kind === "currency") {
      const digits =
        f.decimals === undefined
          ? {}
          : { minimumFractionDigits: f.decimals, maximumFractionDigits: f.decimals };
      return new Intl.NumberFormat(locale, {
        style: "currency",
        currency: f.currency ?? "USD",
        ...digits,
      }).format(n);
    }
    const digits =
      f.decimals === undefined
        ? { maximumFractionDigits: 2 }
        : { minimumFractionDigits: f.decimals, maximumFractionDigits: f.decimals };
    return new Intl.NumberFormat(locale, digits).format(n);
  } catch {
    return String(n);
  }
}

function formatDate(value: unknown, f: FieldFormat, locale: string): string {
  const parsed = toDate(value);
  if (!parsed) return String(value);
  try {
    return new Intl.DateTimeFormat(locale, {
      dateStyle: f.dateStyle ?? "medium",
      ...(parsed.dateOnly ? { timeZone: "UTC" } : {}),
    }).format(parsed.date);
  } catch {
    return String(value);
  }
}

function formatOne(
  value: unknown,
  field: DataField | null,
  f: FieldFormat,
  locale: string,
): string {
  if (value === null || value === undefined) return "";
  if (Array.isArray(value)) return value.map((v) => formatOne(v, null, f, locale)).join(", ");
  if (typeof value === "object") return "";
  const kind = kindOf(value, field);
  if (kind === "number" || kind === "currency") {
    const n = toNumber(value);
    return n === null ? String(value) : formatNumber(n, kind, f, locale);
  }
  if (kind === "date") return formatDate(value, f, locale);
  if (kind === "boolean") {
    const b = toBoolean(value);
    if (b === null) return String(value);
    return b ? (f.trueText ?? t("format.yes")) : (f.falseText ?? t("format.no"));
  }
  return String(value);
}

/**
 * A value as the text a layer shows, by its field's type and the format (the binding's over the
 * field's). Never throws: a format the platform refuses falls back to the plain text.
 */
export function formatValue(
  value: unknown,
  field: DataField | null,
  format: FieldFormat | undefined,
  locale: string,
): string {
  const f = mergeFormat(field, format);
  let text: string;
  try {
    text = formatOne(value, field, f, locale);
  } catch {
    text = typeof value === "object" ? "" : String(value ?? "");
  }
  if (!text) return "";
  return `${f.prefix ?? ""}${text}${f.suffix ?? ""}`;
}
