/** `#RRGGBB`, with `AA` when it isn't opaque. */
export function hexOf(color: string): string {
  const alpha = color.slice(7, 9).toUpperCase();
  return color.slice(0, 7).toUpperCase() + (alpha && alpha !== "FF" ? alpha : "");
}

function channels(color: string): [number, number, number, number] {
  const n = parseInt(color.slice(1, 7), 16);
  const alpha = color.length >= 9 ? parseInt(color.slice(7, 9), 16) / 255 : 1;
  return [n >> 16, (n >> 8) & 255, n & 255, alpha];
}

/** `rgb(79 70 229)`, or with ` / 50%` when it isn't opaque. */
export function rgbOf(color: string): string {
  const [r, g, b, a] = channels(color);
  return `rgb(${r} ${g} ${b}${a < 1 ? ` / ${Math.round(a * 100)}%` : ""})`;
}

/** `hsl(243 75% 59%)`, or with ` / 50%` when it isn't opaque. */
export function hslOf(color: string): string {
  const [r, g, b, a] = channels(color).map((c, i) => (i < 3 ? c / 255 : c)) as [
    number,
    number,
    number,
    number,
  ];
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  const d = max - min;
  const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
  let h = 0;
  if (d !== 0) {
    if (max === r) h = ((g - b) / d) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
  }
  const hue = Math.round((h * 60 + 360) % 360);
  const alpha = a < 1 ? ` / ${Math.round(a * 100)}%` : "";
  return `hsl(${hue} ${Math.round(s * 100)}% ${Math.round(l * 100)}%${alpha})`;
}
