import type { DesignEffect, DesignEffectType } from "./effect.types";

/** What each new effect starts as (Figma's defaults where it has the effect). */
export const EFFECT_DEFAULTS = {
  "drop-shadow": {
    color: "#000000",
    opacity: 0.25,
    x: 0,
    y: 4,
    blur: 4,
    spread: 0,
    showBehind: false,
  },
  "inner-shadow": { color: "#000000", opacity: 0.25, x: 0, y: 4, blur: 4, spread: 0 },
  "layer-blur": {
    radius: 4,
    progressive: false,
    start: { x: 0.5, y: 0 },
    end: { x: 0.5, y: 1 },
    startRadius: 0,
  },
  "background-blur": { radius: 4 },
  noise: {
    noiseType: "mono",
    color: "#000000",
    secondColor: "#ffffff",
    opacity: 0.25,
    size: 1,
    density: 0.5,
  },
  texture: { size: 4, radius: 2, clipToShape: true },
  glass: {
    lightAngle: 135,
    lightIntensity: 0.6,
    refraction: 0.5,
    depth: 16,
    dispersion: 0.25,
    frost: 2,
    splay: 0.5,
  },
  // The shader-effect module fills in its starting code.
  shader: { code: "", params: {} },
} satisfies {
  [T in DesignEffectType]: Omit<Extract<DesignEffect, { type: T }>, "id" | "type" | "visible">;
};
