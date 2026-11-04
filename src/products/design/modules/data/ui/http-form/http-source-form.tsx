import { useState } from "react";

import type { SourceFormProps } from "../data.points.types";
import { ConnectionCard } from "./connection-card";
import { ConnectionDialog } from "./connection-dialog";
import type { ConnectionTab } from "./connection-tabs.types";

/**
 * A link's settings form (`dataSourceForms` for `http`): the connection as a card, edited in the
 * Connection dialog, whose "Save and update" saves the settings and updates the source.
 */
export function HttpSourceForm({
  values,
  stored,
  onChange,
  onPreview,
  rowsPath,
  onRowsPathChange,
}: SourceFormProps) {
  // A new link (no URL yet) starts in the dialog.
  const [open, setOpen] = useState(() => typeof values.url !== "string" || values.url === "");
  const [tab, setTab] = useState<ConnectionTab>("params");
  // A fresh dialog per opening, so it starts from the saved settings.
  const [round, setRound] = useState(0);

  return (
    <>
      <ConnectionCard
        values={values}
        stored={stored}
        onOpen={(next) => {
          setTab(next);
          setRound((n) => n + 1);
          setOpen(true);
        }}
      />
      <ConnectionDialog
        key={round}
        open={open}
        onOpenChange={setOpen}
        tab={tab}
        values={values}
        stored={stored}
        onSave={(next) => onChange(next, { update: true })}
        onPreview={onPreview}
        rowsPath={rowsPath ?? null}
        onRowsPathChange={onRowsPathChange}
      />
    </>
  );
}
