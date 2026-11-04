import { useState, type ReactNode } from "react";

import { getLocale } from "@shared/core";
import { useService } from "@canvas-ui";
import { formatValue } from "../../bindings";
import { DESIGN_DATA_SOURCES } from "../../model";
import type { DataField } from "../../source";
import { readPath } from "../../table";
import { t } from "../../data.i18n";
import { FieldGroupRow } from "./field-group-row";
import { FieldLeafRow } from "./field-leaf-row";
import { countFields, fieldTree } from "./field-tree";
import type { FieldTreeNode } from "./field-tree.types";
import type { FieldTreeViewProps } from "./field-tree-view.types";
import { hasUnsavedImages } from "./unsaved-images";

/** A field's value in a row as a layer would show it (a list as its format says). */
function sampleOf(row: unknown, field: DataField): string {
  try {
    return formatValue(readPath(row, field.path), field, undefined, getLocale());
  } catch {
    return "";
  }
}

/**
 * A source's fields as a tree: groups (an object in each row) open and close, a list of objects
 * opens to show what each item holds; each change is one undo step.
 */
export function FieldTreeView({ source, rows }: FieldTreeViewProps) {
  const sources = useService(DESIGN_DATA_SOURCES);
  // Groups start open, lists of objects closed; what's toggled is remembered here.
  const [toggled, setToggled] = useState<ReadonlySet<string>>(new Set());
  if (source.fields.length === 0) {
    return <p className="text-xs text-muted-foreground">{t("fields.empty")}</p>;
  }
  const tree = fieldTree(source.fields, rows);
  const first = rows[0];
  const failed = new Set(sources.imageFailures(source.id));
  const toggle = (id: string) =>
    setToggled((current) => {
      const next = new Set(current);
      if (!next.delete(id)) next.add(id);
      return next;
    });
  const change = (index: number, next: DataField) =>
    sources.setFields(
      source.id,
      source.fields.map((item, i) => (i === index ? next : item)),
    );

  const render = (nodes: readonly FieldTreeNode[], depth: number): ReactNode =>
    nodes.map((node) =>
      node.kind === "group" ? (
        <FieldGroupRow
          key={node.id}
          node={node}
          depth={depth}
          count={countFields(node.children)}
          open={!toggled.has(node.id)}
          onToggle={() => toggle(node.id)}
        >
          {render(node.children, depth + 1)}
        </FieldGroupRow>
      ) : (
        <FieldLeafRow
          key={node.id}
          node={node}
          depth={depth}
          sample={first ? sampleOf(first, node.field) : ""}
          needsUpdate={hasUnsavedImages(node.field, source, rows, failed)}
          open={toggled.has(node.id)}
          onToggle={() => toggle(node.id)}
          onChange={(next) => change(node.index, next)}
        />
      ),
    );

  return (
    <ul aria-label={t("fields.title")} className="flex flex-col">
      {render(tree, 0)}
    </ul>
  );
}
