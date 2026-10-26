import { resolveVariable, type ModeContext } from "@canvas";

import type { GeneratedSpec, SheetBuildContext, SheetGroup } from "../styleguide.types";
import type { BuildSheetInput } from "./build-sheet.types";
import { modeColumns } from "./mode-columns";
import { SHEET_LOOK } from "./sheet-look";
import { label, stack } from "./spec-builders";
import { templateChoice } from "./template-choice";

/** The key of a group's section in a sheet (what the Design system tab zooms to). */
export function sectionKey(groupId: string): string {
  return `group:${groupId}`;
}

/**
 * A sheet's whole content, as the layers it's made of: for a category, its heading then a
 * section per group (its title, then its template's body); for a group, that section alone. With
 * `modeView` "all", each body is drawn once per mode side by side.
 */
export function buildSheet(input: BuildSheetInput): GeneratedSpec[] {
  const { sheet, category, settings, templates, context, modes } = input;
  const groups = sheet.group
    ? input.groups.filter((group) => group.id === sheet.group)
    : input.groups.filter((group) => !input.hiddenGroups.has(group.id));
  const contextIn = (at: ModeContext): SheetBuildContext => ({
    ...context,
    modes: at,
    resolve: (id) => resolveVariable(context.store, id, at),
  });
  const body = (group: SheetGroup): GeneratedSpec[] => {
    const choice = templateChoice(settings, sheet, group.id, category, templates);
    if (!choice) return [];
    const draw = (at: ModeContext): GeneratedSpec[] => {
      try {
        return choice.template.build(group, choice.options, contextIn(at));
      } catch (error) {
        // A template that fails (a plugin's) draws nothing; the edit itself goes on.
        console.warn(`The design system's "${choice.template.id}" template failed:`, error);
        return [];
      }
    };
    return input.modeView === "all" ? modeColumns(group, context.store, modes, draw) : draw(modes);
  };
  const sections = groups.map((group) => {
    const title = group.title || (groups.length > 1 ? category.label : "");
    return stack(
      sectionKey(group.id),
      "vertical",
      [
        ...(title ? [label("title", title, { size: SHEET_LOOK.title, weight: "600" })] : []),
        ...body(group),
      ],
      { gap: SHEET_LOOK.titleGap, name: title || category.label },
    );
  });

  const heading =
    category.untitled || sheet.group
      ? []
      : [label("heading", category.label, { size: SHEET_LOOK.heading, weight: "700" })];
  return [...heading, ...sections];
}
