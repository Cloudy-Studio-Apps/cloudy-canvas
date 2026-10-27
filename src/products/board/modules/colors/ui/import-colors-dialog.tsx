import { tCommon } from "@shared/core";
import { useMemo, useState } from "react";

import { importConflicts, selectTokens, type ImportChoice, type TokenRecord } from "@canvas";
import { ImportConflicts, useDocumentTokens } from "@canvas-ui";
import { notifyError, toast } from "@shared/stores/toast-store";
import { AppDialog, Button, Checkbox } from "@shared/ui/kit";
import type { ImportColorsBodyProps, ImportColorsDialogProps } from "./colors-ui.types";
import { t } from "../colors.i18n";

/**
 * Importing a file's colors into the board: tick its collections, choose what to do with colors
 * named like the board's, and import in one undo step. Ids are kept, so importing the same file
 * again updates them.
 */
export function ImportColorsDialog({ source, onClose }: ImportColorsDialogProps) {
  return source ? <ImportColorsBody key={source.name} source={source} onClose={onClose} /> : null;
}

function ImportColorsBody({ source, onClose }: ImportColorsBodyProps) {
  const { tokens } = useDocumentTokens();
  const collections = useMemo(() => collectionsOf(source.records), [source]);
  const [ticked, setTicked] = useState(() => new Set(collections.map((c) => c.id)));
  const [choice, setChoice] = useState<ImportChoice>("replace");
  const selected = useMemo(
    () =>
      selectTokens(source.records, {
        collections: [...ticked],
        groups: [],
        styles: [],
        styleTypes: [],
      }).records,
    [source, ticked],
  );
  const conflicts = useMemo(() => importConflicts(tokens.store(), selected), [tokens, selected]);
  const count = selected.filter((r) => r.kind === "variable").length;

  const toggle = (id: string, on: boolean) => {
    const next = new Set(ticked);
    if (on) next.add(id);
    else next.delete(id);
    setTicked(next);
  };
  const run = () => {
    try {
      const plan = tokens.importTokens(selected, choice);
      const parts = [
        plan.added > 0 && t("import.added", { count: plan.added }),
        plan.updated > 0 && t("import.updated", { count: plan.updated }),
        plan.skipped > 0 && t("import.skipped", { count: plan.skipped }),
      ].filter(Boolean);
      toast({ title: t("import.done"), description: parts.join(", ") || t("import.nothing") });
      onClose();
    } catch (error) {
      notifyError(t("import.failed"), error);
    }
  };

  return (
    <AppDialog
      open
      onOpenChange={(open) => !open && onClose()}
      title={t("import.title")}
      description={`${source.name} · ${source.label}`}
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            {tCommon("cancel")}
          </Button>
          <Button onClick={run} disabled={count === 0}>
            {t("import.button", { count })}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-3">
        {collections.length === 0 ? (
          <p className="text-xs text-muted-foreground">{t("import.noColors")}</p>
        ) : (
          <div className="flex flex-col gap-1">
            {collections.map((collection) => (
              <div key={collection.id} className="flex h-7 items-center gap-2 text-xs">
                <Checkbox
                  checked={ticked.has(collection.id)}
                  onCheckedChange={(on) => toggle(collection.id, on)}
                  label={collection.name}
                  className="min-w-0 flex-1"
                />
                <span className="text-muted-foreground">{collection.count}</span>
              </div>
            ))}
          </div>
        )}
        <ImportConflicts
          names={conflicts.map((c) => c.name)}
          choice={choice}
          onChoice={setChoice}
        />
        {source.warnings.length > 0 && (
          <ul className="list-disc pl-4 text-xs text-muted-foreground">
            {source.warnings.map((warning) => (
              <li key={warning}>{warning}</li>
            ))}
          </ul>
        )}
      </div>
    </AppDialog>
  );
}

/** The collections a file's colors are in, with how many colors each holds. */
function collectionsOf(records: readonly TokenRecord[]) {
  return records.flatMap((r) =>
    r.kind === "collection"
      ? [
          {
            id: r.id,
            name: r.name,
            count: records.filter((v) => v.kind === "variable" && v.collectionId === r.id).length,
          },
        ]
      : [],
  );
}
