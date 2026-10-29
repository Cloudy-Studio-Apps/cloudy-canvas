import type { ModuleHost } from "@shared/core";
import { boardCanvas } from "../../board-points";
import { DbTool } from "./db.tool";
import { DbEnumKind } from "./enum";
import { DbLinks } from "./links";
import { prepareDbCopies, pruneRefs } from "./schema";
import { DbTableKind } from "./table";

/** The db module's canvas side: what draws and edits its elements, without the editor UI. */
export function registerDbCanvas(host: ModuleHost): void {
  host.contribute(boardCanvas.kinds, new DbTableKind(), new DbEnumKind());
  host.contribute(boardCanvas.tools, {
    id: "db",
    create: (ctx) => new DbTool(ctx),
    keys: [{ key: "d" }],
  });
  host.contribute(boardCanvas.options, { dbKind: "table" });
  host.contribute(boardCanvas.links, () => new DbLinks());
  // Relations pointing at deleted tables or columns go with them.
  host.contribute(boardCanvas.onRemove, (doc) => pruneRefs(doc));
  // Copies get free table and enum names.
  host.contribute(boardCanvas.prepareCopies, prepareDbCopies);
}
