import { useEditorModules } from "@canvas-ui";
import { designStyleTypes } from "@design/ui/modules/style-types";
import type { StyleTypeEntry } from "@design/ui/modules/style-types.types";

/** The entry of a style type (its preview, summary and editor), if a module gives one. */
export function useStyleType(styleType: string | undefined): StyleTypeEntry | undefined {
  const { host } = useEditorModules();
  return styleType === undefined ? undefined : host.find(designStyleTypes, styleType);
}
