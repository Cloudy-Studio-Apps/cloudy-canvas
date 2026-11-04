import { useState } from "react";
import { KeyRound } from "lucide-react";

import { useService } from "@canvas-ui";
import { LayerName } from "../../../layers/ui";
import { DESIGN_DATA_SOURCES } from "../../model";
import { useSourceSecrets } from "../hooks/use-source-secrets";
import { useUpdateSource } from "../hooks/use-update-source";
import { SourceIcon } from "../source-icon";
import { sourceMeta, stageText } from "./source-meta";
import type { SourceRowProps } from "./source-row.types";
import { UpdateButton } from "./update-button";
import { t } from "../../data.i18n";

/**
 * One source: its type's icon, its name (a double-click renames it), its rows and when it was
 * updated (the stage while an Update runs), the last Update's error and whether this device lacks
 * a key it needs, and Update. A click opens its detail.
 */
export function SourceRow({ source, sourceType, onOpen }: SourceRowProps) {
  const sources = useService(DESIGN_DATA_SOURCES);
  const update = useUpdateSource(source.id);
  const { missing } = useSourceSecrets(source);
  const [editing, setEditing] = useState(false);
  const error = sources.error(source.id);

  return (
    <li>
      <div
        role="button"
        tabIndex={0}
        onClick={onOpen}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            onOpen();
          }
        }}
        className="group/row flex cursor-pointer flex-col gap-0.5 rounded-sm px-2 py-1.5 outline-none hover:bg-hover focus-visible:ring-2 focus-visible:ring-ring/40"
      >
        <div className="flex min-w-0 items-center gap-1 text-sm text-foreground">
          <SourceIcon
            name={sourceType?.icon ?? ""}
            className="size-3.5 shrink-0 text-muted-foreground"
          />
          <span
            className="flex min-w-0 flex-1"
            onDoubleClick={(event) => {
              event.stopPropagation();
              setEditing(true);
            }}
          >
            <LayerName
              name={source.name}
              editing={editing}
              onRename={(name) => sources.rename(source.id, name)}
              onDone={() => setEditing(false)}
            />
          </span>
          <span className="shrink-0" onClick={(event) => event.stopPropagation()}>
            <UpdateButton
              stage={update.stage}
              cancellable={update.cancellable}
              onRun={update.run}
              onCancel={update.cancel}
            />
          </span>
        </div>
        <p className="truncate pl-5 text-xs text-muted-foreground">
          {update.stage ? stageText(update.stage) : sourceMeta(source)}
        </p>
        {error !== null && (
          <p className="line-clamp-2 pl-5 text-xs break-words text-destructive" title={error}>
            {error}
          </p>
        )}
        {missing.length > 0 && (
          <p className="flex items-center gap-1 pl-5 text-xs text-warning">
            <KeyRound className="size-3 shrink-0" />
            {t("source.needsKey")}
          </p>
        )}
      </div>
    </li>
  );
}
