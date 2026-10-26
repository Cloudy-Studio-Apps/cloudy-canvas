import { clamp } from "@canvas";

import {
  between,
  colorDistance,
  colorOklch,
  harmonize,
  HARMONIES,
  hexToHsvColor,
  hsvToHexColor,
  midColor,
  oklchColor,
  pickOne,
  seededRandom,
  type Hsv,
} from "../..";
import { useColorWizardStore } from "./color-wizard-store";
import type { PaletteColor } from "./color-wizard-store.types";

const MIN_COLORS = 2;
export const MAX_COLORS = 8;

const state = () => useColorWizardStore.getState();

/** A new palette, one undo step of the wizard's own history; roles and the picked card reset. */
export function commitPalette(next: PaletteColor[]): void {
  const { palette, past } = state();
  state().set({
    palette: next,
    past: [...past, palette].slice(-100),
    future: [],
    roles: [],
    picked: null,
  });
}

/** Colors at the same places, keeping the locked ones. */
export function setColors(colors: readonly (string | Omit<PaletteColor, "locked">)[]): void {
  const { palette } = state();
  commitPalette(
    colors.map((c, i) => {
      const kept = palette[i];
      if (kept?.locked) return kept;
      return typeof c === "string" ? { hex: c, locked: false } : { ...c, locked: false };
    }),
  );
}

export function undoPalette(): void {
  const { past, palette, future } = state();
  const previous = past.at(-1);
  if (!previous) return;
  state().set({
    palette: previous,
    past: past.slice(0, -1),
    future: [palette, ...future],
    roles: [],
  });
}

export function redoPalette(): void {
  const { past, palette, future } = state();
  const next = future[0];
  if (!next) return;
  state().set({ palette: next, past: [...past, palette], future: future.slice(1), roles: [] });
}

/** The palette made from `base` in the current harmony (locked colors stay). */
export function applyHarmony(base: Hsv): void {
  const { harmony, palette } = state();
  setColors(harmonize(base, harmony, palette.length).map(hsvToHexColor));
}

/** A random harmony from a random base. */
export function randomizePalette(): void {
  const random = seededRandom((Math.random() * 2 ** 32) >>> 0);
  const harmony = pickOne(
    random,
    HARMONIES.filter((h) => h.id !== "custom"),
  ).id;
  const base = {
    h: between(random, 0, 360),
    s: between(random, 0.45, 0.85),
    v: between(random, 0.55, 0.95),
  };
  state().set({ harmony, brightness: base.v });
  applyHarmony(base);
}

/** More or fewer colors: the harmony's, or (custom) one more following the last. */
export function resizePalette(n: number): void {
  const { palette, harmony } = state();
  const size = clamp(n, MIN_COLORS, MAX_COLORS);
  if (size === palette.length) return;
  if (harmony !== "custom") {
    const hsvs = harmonize(hexToHsvColor(palette[0]!.hex), harmony, size);
    commitPalette(
      hsvs.map((h, i) =>
        palette[i]?.locked ? palette[i]! : { hex: hsvToHexColor(h), locked: false },
      ),
    );
    return;
  }
  const next = palette.slice(0, size);
  while (next.length < size) {
    const last = colorOklch(next[next.length - 1]!.hex);
    next.push({
      hex: oklchColor(clamp(1.25 - last.L, 0.2, 0.95), last.C, last.h + 40),
      locked: false,
    });
  }
  commitPalette(next);
}

/** A color halfway between the ones at `at - 1` and `at`. */
export function insertColor(at: number): void {
  const { palette } = state();
  const [a, b] = [palette[at - 1], palette[at]];
  if (!a || !b || palette.length >= MAX_COLORS) return;
  commitPalette([
    ...palette.slice(0, at),
    { hex: midColor(a.hex, b.hex), locked: false },
    ...palette.slice(at),
  ]);
  state().set({ harmony: "custom" });
}

export function removeColor(at: number): void {
  const { palette } = state();
  if (palette.length <= MIN_COLORS) return;
  commitPalette(palette.filter((_, i) => i !== at));
  state().set({ harmony: "custom" });
}

/** One color changed by hand (the harmony becomes custom). */
export function setColorAt(at: number, hex: string): void {
  const { palette } = state();
  if (!palette[at] || palette[at].hex === hex) return;
  commitPalette(palette.map((c, i) => (i === at ? { ...c, hex } : c)));
  state().set({ harmony: "custom" });
}

export function toggleLock(at: number): void {
  const { palette } = state();
  state().set({ palette: palette.map((c, i) => (i === at ? { ...c, locked: !c.locked } : c)) });
}

/** Lightest first. */
export function sortPalette(): void {
  commitPalette([...state().palette].sort((a, b) => colorOklch(b.hex).L - colorOklch(a.hex).L));
}

/** A whole palette from a source (gallery, image, file, import), up to the most colors. */
export function takePalette(colors: readonly Omit<PaletteColor, "locked">[]): void {
  commitPalette(colors.slice(0, MAX_COLORS).map((c) => ({ ...c, locked: false })));
  state().set({ harmony: "custom" });
}

/**
 * The brand colors first, locked and named primary, secondary, accent; the rest from the chosen
 * harmony around the first, leaving out any too close to a brand color.
 */
export function buildFromBrand(brand: readonly string[]): void {
  const first = brand[0];
  if (!first) return;
  const { brand: settings } = state();
  const size = Math.max(5, brand.length + 2);
  const rest = harmonize(hexToHsvColor(first), settings.harmony, size + 1)
    .slice(1)
    .map(hsvToHexColor)
    .filter((hex) => brand.every((b) => colorDistance(b, hex) > 0.05));
  const names = ["primary", "secondary", "accent"];
  commitPalette([
    ...brand.map((hex, i) => ({ hex, locked: true, name: names[i] })),
    ...rest.slice(0, size - brand.length).map((hex) => ({ hex, locked: false })),
  ]);
  state().set({ harmony: "custom" });
}
