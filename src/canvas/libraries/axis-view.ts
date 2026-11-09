import type { TokenRecord } from "../tokens/token.types";

/**
 * A mode axis's `current` is the file's own view choice, not library data: a library record is
 * stored without it, and a mirror keeps the file's. Other records are returned as they are.
 */
export function withoutView(record: TokenRecord): TokenRecord {
  if (record.kind !== "axis" || record.current === undefined) return record;
  const copy = { ...record };
  delete copy.current;
  return copy;
}

/** `wanted` (a library's record) with the file's `existing` axis mode still shown, when it has it. */
export function withFileView(wanted: TokenRecord, existing: unknown): TokenRecord {
  if (wanted.kind !== "axis") return wanted;
  const old = existing as Partial<TokenRecord> | undefined;
  if (old?.kind !== "axis" || old.current === undefined) return wanted;
  return wanted.modes.some((mode) => mode.id === old.current)
    ? { ...wanted, current: old.current }
    : wanted;
}
