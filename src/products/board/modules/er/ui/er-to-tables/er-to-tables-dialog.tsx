import { useState } from "react";
import { CircleX, TriangleAlert } from "lucide-react";

import type { ErHierarchyStrategy } from "@board";
import { useEngine } from "@canvas-ui";
import { Button } from "@shared/ui/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@shared/ui/components/ui/dialog";
import { notifyError, toast } from "@shared/stores/toast-store";
import { useBoardPanelStore } from "@board/ui/stores/board-panel-store";
import { useErModel, useErVersion } from "../model";
import { HierarchyChoice } from "./hierarchy-choice";
import { useErToTablesStore } from "./er-to-tables-store";
import type { ErToTablesBodyProps } from "./er-to-tables.types";

/**
 * "Create tables": the diagram as database tables. Asks how each hierarchy becomes tables, shows
 * the Check diagram's errors (it converts anyway), the notes and the DBML it will write, then
 * writes it into the board's schema (one undo step; tables with the same names are updated),
 * selects the tables and opens the database panel.
 */
export function ErToTablesDialog() {
  const diagramId = useErToTablesStore((state) => state.diagramId);
  const close = useErToTablesStore((state) => state.close);
  return (
    <Dialog open={diagramId !== null} onOpenChange={(open) => !open && close()}>
      {diagramId !== null && <DialogBody key={diagramId} diagramId={diagramId} onDone={close} />}
    </Dialog>
  );
}

function DialogBody({ diagramId, onDone }: ErToTablesBodyProps) {
  const engine = useEngine();
  const er = useErModel();
  useErVersion();
  const diagram = er.diagram(diagramId);
  const shapes = diagram.shapes();
  const [hierarchies, setHierarchies] = useState<Record<string, ErHierarchyStrategy>>({});
  const preview = diagram.tablesPreview({ hierarchies });
  const errors = diagram.check().filter((issue) => issue.severity === "error");
  const label = er.diagrams().find((d) => d.id === diagramId)?.label ?? "the diagram";
  const nameOf = (id: string) => shapes.entities.find((e) => e.id === id)?.name ?? "?";

  const create = () => {
    const result = diagram.createTables({ hierarchies });
    if (!result.applied.ok) {
      notifyError("The tables couldn't be created", new Error(result.applied.error.message));
      return;
    }
    const names = new Set(result.tables);
    const ids = engine
      .elements()
      .filter((el) => el.type === "db-table" && "name" in el && names.has(String(el.name)))
      .map((el) => el.id);
    onDone();
    useBoardPanelStore.getState().setSchemaOpen(true);
    if (ids.length > 0) engine.select(ids);
    toast({ title: `${result.tables.length} tables written`, description: "Undo with Ctrl+Z." });
  };

  return (
    <DialogContent className="max-h-[85vh] max-w-xl overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Create tables from {label}</DialogTitle>
        <DialogDescription>
          Each entity, multivalued attribute and many-to-many relation becomes a table, and the
          other relations foreign keys. Tables that already exist with the same names are updated.
        </DialogDescription>
      </DialogHeader>
      {shapes.isas.length > 0 && (
        <section className="space-y-2">
          <h3 className="text-xs font-medium text-muted-foreground">Hierarchies</h3>
          {shapes.isas.map((isa) => (
            <HierarchyChoice
              key={isa.id}
              label={`${nameOf(isa.parentId)} → ${isa.children.map((c) => nameOf(c.entityId)).join(", ")}`}
              value={hierarchies[isa.id] ?? "per-entity"}
              onChange={(value) => setHierarchies((current) => ({ ...current, [isa.id]: value }))}
            />
          ))}
        </section>
      )}
      {(errors.length > 0 || preview.warnings.length > 0) && (
        <ul className="space-y-1 text-xs">
          {errors.map((issue) => (
            <li key={`${issue.rule}:${issue.shapeId}`} className="flex gap-1.5">
              <CircleX className="mt-px size-3.5 shrink-0 text-destructive" />
              {issue.message}
            </li>
          ))}
          {preview.warnings.map((warning) => (
            <li key={warning} className="flex gap-1.5 text-muted-foreground">
              <TriangleAlert className="mt-px size-3.5 shrink-0 text-warning" />
              {warning}
            </li>
          ))}
        </ul>
      )}
      <section className="space-y-1">
        <h3 className="text-xs font-medium text-muted-foreground">
          {preview.tables.length} tables (DBML)
        </h3>
        <pre className="max-h-72 overflow-auto rounded-md border border-border bg-surface-sunken p-2 font-mono text-xs">
          {preview.dbml || "Nothing to convert yet."}
        </pre>
      </section>
      <DialogFooter>
        <Button variant="ghost" onClick={onDone}>
          Cancel
        </Button>
        <Button disabled={preview.tables.length === 0} onClick={create}>
          Create tables
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}
