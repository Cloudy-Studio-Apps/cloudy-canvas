/** Type arguments as numbers: `"10, 2"` → [10, 2]; any non-numeric argument → []. */
export function parseArgs(typeArgs: string): number[] {
  const parts = typeArgs
    .split(",")
    .map((part) => part.trim())
    .filter((part) => part.length > 0);
  const numbers = parts.map(Number);
  return numbers.every((n) => Number.isFinite(n)) ? numbers : [];
}
