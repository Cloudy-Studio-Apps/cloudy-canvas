const NUMERALS: readonly [number, string][] = [
  [1000, "m"],
  [900, "cm"],
  [500, "d"],
  [400, "cd"],
  [100, "c"],
  [90, "xc"],
  [50, "l"],
  [40, "xl"],
  [10, "x"],
  [9, "ix"],
  [5, "v"],
  [4, "iv"],
  [1, "i"],
];

/** `n` (from 1) in roman numerals, lower or upper case; numbers under 1 as they are. */
export function toRoman(n: number, lower: boolean): string {
  if (!Number.isInteger(n) || n < 1) return String(n);
  let rest = n;
  let out = "";
  for (const [value, numeral] of NUMERALS) {
    while (rest >= value) {
      out += numeral;
      rest -= value;
    }
  }
  return lower ? out : out.toUpperCase();
}
