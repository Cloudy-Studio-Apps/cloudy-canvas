import { useState } from "react";
import { ArrowLeft } from "lucide-react";

import { useService } from "@canvas-ui";
import { LayerName } from "../../../layers/ui";
import { DESIGN_DATA_SOURCES } from "../../model";

import { IconButton } from "@shared/ui/kit";
import { SourceIcon } from "../source-icon";
import { CreateSourceForm } from "./create-source-form";
import { SourceSections } from "./source-sections";
import type { SourceDetailProps } from "./source-detail.types";
import { SourceUpdateButton } from "./source-update-button";
import { t } from "../../data.i18n";

/**
 * A source's page in the tab (or a new one's form), with a back arrow to the list; a double-click
 * on the name renames the source.
 */
export function SourceDetail({ source, sourceType, issues, onBack, onCreated }: SourceDetailProps) {
  const sources = useService(DESIGN_DATA_SOURCES);
  const [editing, setEditing] = useState(false);
  const title = t("source.new", { type: sourceType?.label ?? "" });

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <header className="flex h-10 shrink-0 items-center gap-1 border-b border-border px-1.5">
        <IconButton size="xs" label={t("source.back")} onClick={onBack}>
          <ArrowLeft />
        </IconButton>
        <SourceIcon
          name={sourceType?.icon ?? ""}
          className="size-3.5 shrink-0 text-muted-foreground"
        />
        {source ? (
          <h2
            className="flex min-w-0 flex-1 text-xs font-semibold text-foreground"
            title={t("source.renameHint")}
            onDoubleClick={() => setEditing(true)}
          >
            <LayerName
              name={source.name}
              editing={editing}
              onRename={(name) => sources.rename(source.id, name)}
              onDone={() => setEditing(false)}
            />
          </h2>
        ) : (
          <h2 className="min-w-0 flex-1 truncate text-xs font-semibold text-foreground">{title}</h2>
        )}
        {source && <SourceUpdateButton sourceId={source.id} disabled={!sourceType} />}
      </header>
      {source ? (
        <SourceSections
          source={source}
          sourceType={sourceType}
          issues={issues.filter((issue) => issue.sourceId === source.id)}
          onRemoved={onBack}
        />
      ) : (
        sourceType && (
          <CreateSourceForm sourceType={sourceType} onCreated={onCreated} onCancel={onBack} />
        )
      )}
    </div>
  );
}
