/** Modes named differently in Pixi or in our files than in CSS. */
const CSS_NAMES: Readonly<Record<string, string>> = {
  add: "plus-lighter",
  "linear-burn": "plus-darker",
};

/** The `mix-blend-mode` of a Pixi or document blend mode, or `null` for plain drawing. */
export function cssBlendMode(mode: string | undefined): string | null {
  if (!mode || mode === "normal" || mode === "inherit" || mode === "pass-through") return null;
  return CSS_NAMES[mode] ?? mode;
}
