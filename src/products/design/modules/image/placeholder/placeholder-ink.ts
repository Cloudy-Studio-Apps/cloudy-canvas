import { hexToRgba, rgbaToHex } from "@canvas";

/**
 * The color a placeholder draws its seal and "?" with on `background`: the background darkened on
 * light colors, lightened on dark ones, so the art reads on any fill without shouting.
 */
export function placeholderInk(background: string): string {
  const { r, g, b } = hexToRgba(background);
  const light = 0.2126 * r + 0.7152 * g + 0.0722 * b > 0.5;
  const toward = light ? 0 : 1;
  const amount = light ? 0.45 : 0.5;
  const mix = (v: number) => v + (toward - v) * amount;
  return rgbaToHex({ r: mix(r), g: mix(g), b: mix(b), a: 1 });
}
