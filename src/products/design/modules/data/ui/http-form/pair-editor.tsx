import { useState } from "react";

import { createId } from "@shared/core";
import type { PairEditorProps } from "./pair-editor.types";
import { PairEditorRow } from "./pair-editor-row";
import { t } from "../../data.i18n";

/**
 * Names and values as rows that always end in an empty one: typing in it adds a row, so there's
 * no Add to find. The empty row's id becomes the new row's, so the field keeps the focus.
 */
export function PairEditor({
  rows,
  onChange,
  nameLabel,
  autoSecret,
  secrets,
  ...rest
}: PairEditorProps) {
  const [ghostId, setGhostId] = useState(createId);

  return (
    <div className="flex flex-col gap-1.5">
      <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)] gap-1.5 text-xs font-medium text-muted-foreground">
        <span>{nameLabel}</span>
        <span>{t("source.pairValue")}</span>
      </div>
      {/* One list, so the empty row turning into a real one keeps its element (and focus). */}
      {[...rows, null].map((row, index) =>
        row ? (
          <PairEditorRow
            key={row.id}
            row={row}
            ghost={false}
            secrets={secrets}
            {...rest}
            onChange={(next) => {
              const relock = next.name !== row.name && !row.secret && autoSecret?.(next.name);
              const updated = relock ? { ...next, secret: true } : next;
              onChange(rows.map((r, i) => (i === index ? updated : r)));
            }}
            onRemove={() => onChange(rows.filter((_, i) => i !== index))}
          />
        ) : (
          <PairEditorRow
            key={ghostId}
            row={{ id: ghostId, name: "", value: "" }}
            ghost
            secrets={secrets}
            {...rest}
            onChange={(next) => {
              if (next.name === "" && next.value === "") return;
              const secret = secrets === true && autoSecret?.(next.name) === true;
              onChange([...rows, { ...next, secret }]);
              setGhostId(createId());
            }}
            onRemove={() => undefined}
          />
        ),
      )}
    </div>
  );
}
