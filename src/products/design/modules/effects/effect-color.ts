/** A hex color and opacity as a premultiplied RGBA for shaders (0–1 each). */
export function premultiplied(hex: string, opacity: number): [number, number, number, number] {
  const [r, g, b] = rgb(hex);
  const a = Math.min(Math.max(opacity, 0), 1);
  return [r * a, g * a, b * a, a];
}

/** A hex color's channels, 0–1 (black when it isn't one). */
export function rgb(hex: string): [number, number, number] {
  const match = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!match) return [0, 0, 0];
  const value = parseInt(match[1]!, 16);
  return [((value >> 16) & 255) / 255, ((value >> 8) & 255) / 255, (value & 255) / 255];
}
