import { STICKY_COLORS, type StickyShape } from "../../document";
import { formatName, formatString } from "./dbml-format";

/** A linked sticky as a DBML sticky note. Its color is kept as the note's header color. */
export function serializeNote(sticky: StickyShape): string {
  const settings = sticky.color !== STICKY_COLORS[0].value ? ` [headercolor: ${sticky.color}]` : "";
  return `Note ${formatName(sticky.noteName ?? "note")}${settings} {\n  ${formatString(sticky.text)}\n}`;
}
