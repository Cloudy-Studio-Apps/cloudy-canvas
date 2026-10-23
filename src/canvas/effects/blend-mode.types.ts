/**
 * How a layer's colors combine with what's under it (Figma's and the W3C compositing spec's
 * modes; `plus-darker` and `plus-lighter` are linear burn and linear dodge). Products with layer
 * groups add "pass-through" on top of these, which isn't a way of drawing.
 */
export type BlendMode =
  | "normal"
  | "darken"
  | "multiply"
  | "plus-darker"
  | "color-burn"
  | "lighten"
  | "screen"
  | "plus-lighter"
  | "color-dodge"
  | "overlay"
  | "soft-light"
  | "hard-light"
  | "difference"
  | "exclusion"
  | "hue"
  | "saturation"
  | "color"
  | "luminosity";
