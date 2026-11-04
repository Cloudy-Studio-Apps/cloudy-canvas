import { useState } from "react";
import { Database } from "lucide-react";

import { EmptyState } from "@shared/ui/kit";
import { useDataRegistry } from "../hooks/use-data-registry";
import { useDataSources } from "../hooks/use-data-sources";
import { AddSourceMenu } from "./add-source-menu";
import type { DataTabView } from "./data-tab.types";
import { SourceDetail } from "./source-detail";
import { SourceList } from "./source-list";
import { UpdateAllButton } from "./update-all-button";
import { t } from "../../data.i18n";

/**
 * The left panel's Data tab: the design's data sources with Update and Update all, "+" to add
 * one (pick a type, fill its form), and a source's detail (its settings, format, fields and rows)
 * on a click. A source that goes away (undo, an agent) brings the list back.
 */
export function DataTab() {
  const sources = useDataSources();
  const { types } = useDataRegistry();
  const [view, setView] = useState<DataTabView>({ kind: "list" });
  const toList = () => setView({ kind: "list" });

  if (view.kind === "create") {
    const sourceType = types.find((type) => type.id === view.type);
    return (
      <SourceDetail
        source={null}
        sourceType={sourceType}
        onBack={toList}
        onCreated={(id) => setView({ kind: "detail", id })}
      />
    );
  }
  const open = view.kind === "detail" ? sources.find((s) => s.id === view.id) : undefined;
  if (open) {
    return (
      <SourceDetail
        source={open}
        sourceType={types.find((type) => type.id === open.sourceType)}
        onBack={toList}
        onCreated={(id) => setView({ kind: "detail", id })}
      />
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <header className="flex h-10 shrink-0 items-center justify-between px-3">
        <h2 className="text-xs font-semibold text-foreground">
          {t("tab.sources")}{" "}
          <span className="font-normal text-muted-foreground">{sources.length}</span>
        </h2>
        <div className="flex items-center gap-0.5">
          <UpdateAllButton disabled={sources.length === 0} />
          <AddSourceMenu types={types} onPick={(type) => setView({ kind: "create", type })} />
        </div>
      </header>
      <div className="min-h-0 flex-1 overflow-y-auto">
        {sources.length === 0 ? (
          <EmptyState
            icon={<Database />}
            title={t("tab.empty.title")}
            description={t("tab.empty.description")}
          />
        ) : (
          <SourceList
            sources={sources}
            types={types}
            onOpen={(id) => setView({ kind: "detail", id })}
          />
        )}
      </div>
    </div>
  );
}
