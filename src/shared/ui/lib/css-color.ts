let probe: CanvasRenderingContext2D | null = null;

/**
 * Resolves a CSS custom property (e.g. `--canvas-grid`, any CSS color syntax incl. oklch) to a
 * 0xRRGGBB number for non-DOM renderers such as the canvas engine, as `element` sees it (the
 * document root by default).
 */
export function resolveCssColor(
  variable: string,
  fallback = 0x000000,
  element: Element = document.documentElement,
): number {
  const value = getComputedStyle(element).getPropertyValue(variable).trim();
  if (!value) return fallback;
  probe ??= document.createElement("canvas").getContext("2d", { willReadFrequently: true });
  if (!probe) return fallback;
  probe.clearRect(0, 0, 1, 1);
  probe.fillStyle = value;
  probe.fillRect(0, 0, 1, 1);
  const [r = 0, g = 0, b = 0] = probe.getImageData(0, 0, 1, 1).data;
  return (r << 16) | (g << 8) | b;
}
