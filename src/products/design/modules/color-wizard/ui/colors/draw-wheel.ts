import { mod } from "@canvas";

import { hsvToHexColor, hexToRgb } from "../..";

/** Paints an HSV wheel at a brightness: hue by angle, saturation by distance from the middle. */
export function drawWheel(canvas: HTMLCanvasElement, brightness: number): void {
  const g = canvas.getContext("2d");
  if (!g) return;
  const size = canvas.width;
  const r = size / 2;
  const image = g.createImageData(size, size);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const d = Math.hypot(x - r, y - r);
      if (d > r) continue;
      const h = mod((Math.atan2(y - r, x - r) * 180) / Math.PI, 360);
      const [R, G, B] = hexToRgb(hsvToHexColor({ h, s: d / r, v: brightness }));
      const i = (y * size + x) * 4;
      image.data[i] = R;
      image.data[i + 1] = G;
      image.data[i + 2] = B;
      image.data[i + 3] = 255;
    }
  }
  g.putImageData(image, 0, 0);
}
