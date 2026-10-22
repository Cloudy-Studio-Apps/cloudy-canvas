/** The number typed in a field, or `null` when it isn't one (empty, letters, …). */
export function parseNumber(text: string): number | null {
  const trimmed = text.trim();
  const value = Number(trimmed);
  return trimmed !== "" && Number.isFinite(value) ? value : null;
}
