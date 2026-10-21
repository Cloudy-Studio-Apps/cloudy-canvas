import type { CanvasElement, ElementBuildContext, ElementKinds } from "../elements";
import type { ToolArgs } from "./agent-tool.types";
import { optionalNumber, optionalString, stringArg } from "./tool-args";

/** Element types agents can create (read live, so plugin types count). */
export function creatableTypes(kinds: ElementKinds): string[] {
  return kinds
    .all()
    .filter((kind) => kind.creatable)
    .map((kind) => kind.type);
}

/** A new element from an agent's spec. `x`/`y` are the top-left corner in world units. */
export function buildElement(
  kinds: ElementKinds,
  spec: ToolArgs,
  index: string,
  lookup: ElementBuildContext["lookup"] = () => undefined,
): CanvasElement {
  const type = stringArg(spec, "type");
  const kind = kinds.get(type);
  if (!kind?.creatable) {
    throw new Error(
      `Can't create "${type}" elements. Use one of: ${creatableTypes(kinds).join(", ")}.`,
    );
  }
  return kind.build(
    {
      x: optionalNumber(spec, "x") ?? 0,
      y: optionalNumber(spec, "y") ?? 0,
      w: optionalNumber(spec, "w"),
      h: optionalNumber(spec, "h"),
      text: optionalString(spec, "text"),
      color: optionalString(spec, "color"),
      kind: optionalString(spec, "kind"),
      fill: optionalString(spec, "fill"),
      stroke: optionalString(spec, "stroke"),
      args: spec,
    },
    index,
    { lookup, kinds },
  );
}
