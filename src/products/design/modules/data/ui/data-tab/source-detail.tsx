import { ArrowLeft } from "lucide-react";

import { IconButton } from "@shared/ui/kit";
import { SourceIcon } from "../source-icon";
import { CreateSourceForm } from "./create-source-form";
import { SourceSections } from "./source-sections";
import type { SourceDetailProps } from "./source-detail.types";
import { SourceUpdateButton } from "./source-update-button";
import { t } from "../../data.i18n";

/** A source's page in the tab (or a new one's form), with a back arrow to the list. */
export function SourceDetail({ source, sourceType, onBack, onCreated }: SourceDetailProps) {
  const title = source ? source.name : t("source.new", { type: sourceType?.label ?? "" });

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
        <h2 className="min-w-0 flex-1 truncate text-xs font-semibold text-foreground">{title}</h2>
        {source && <SourceUpdateButton sourceId={source.id} />}
      </header>
      {source ? (
        <SourceSections source={source} sourceType={sourceType} onRemoved={onBack} />
      ) : (
        sourceType && (
          <CreateSourceForm sourceType={sourceType} onCreated={onCreated} onCancel={onBack} />
        )
      )}
    </div>
  );
}
