import { useEditorModules } from "@canvas-ui";
import { designStyleTypes } from "../core.points";
import type { StyleTypeEntry } from "../core.points.types";

/** The entry of a style type (its preview, summary and editor), if a module gives one. */
export function useStyleType(styleType: string | undefined): StyleTypeEntry | undefined {
  const { host } = useEditorModules();
  return styleType === undefined ? undefined : host.find(designStyleTypes, styleType);
}
