/** `#RRGGBBAA` as CSS (the alpha kept). */
export function cssColor(color: string): string {
  const n = parseInt(color.slice(1, 7), 16);
  const alpha = color.length >= 9 ? parseInt(color.slice(7, 9), 16) / 255 : 1;
  return `rgba(${n >> 16}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
}
