import type { BindableField, TokenScope } from "@canvas";

/** A board element's color a color variable can drive (boards bind colors only). */
export function colorField(path: string, label: string, scope: TokenScope): BindableField {
  return { path, type: "color", scopes: [scope], label };
}
