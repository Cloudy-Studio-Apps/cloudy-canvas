import type { ModuleHost } from "@shared/core";
import { boardCanvas } from "../../board-points";
import { SECTION_COLORS } from "../../palette";
import { boardSections } from "./board-sections";
import { sectionAlignTarget, withSectionMembers } from "./section-members";
import { SectionKind } from "./section.kind";
import { SectionTool } from "./section.tool";

/** The section module's canvas side: what draws and edits its elements, without the editor UI. */
export function registerSectionCanvas(host: ModuleHost): void {
  host.contribute(boardCanvas.kinds, new SectionKind());
  host.contribute(boardCanvas.tools, {
    id: "section",
    create: (ctx) => new SectionTool(ctx),
    keys: [{ key: "s", shift: true }],
  });
  host.contribute(boardCanvas.options, {
    sectionColor: SECTION_COLORS[0].value,
    sectionColorToken: null,
  });
  host.contribute(boardCanvas.withMembers, (ids, elements, _purpose, kinds) =>
    withSectionMembers(ids, elements, kinds),
  );
  host.contribute(boardCanvas.alignTarget, sectionAlignTarget);
  host.contribute(boardCanvas.frames, boardSections);
}
