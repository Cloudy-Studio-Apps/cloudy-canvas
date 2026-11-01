import { FolderDown } from "lucide-react";
import { useMemo, useState } from "react";

import { OverwriteDialog, useCanvasFile, useService } from "@canvas-ui";
import { useDesignEngine } from "@design/ui/design-engine-context";
import { canSaveToFolder, type ExportDestination } from "@platform";
import { tCommon } from "@shared/core";
import { notifyError, toast, toastProgress } from "@shared/stores/toast-store";
import { AppDialog, Button, EmptyState, Field, SegmentedControl } from "@shared/ui/kit";
import { DESIGN_PAGES } from "../../pages";
import { exportItems, renderAcrossPages } from "../export-all";
import { uniqueFolderName } from "../export-file-name";
import { plannedExports } from "../export-nodes";
import { t } from "../layer-export.i18n";
import { ExportAllList } from "./export-all-list";
import { useExportAllStore } from "./export-all-store";
import type { ExportAllBodyProps, ExportAllGroup, ExportAllScope } from "./export-all.types";
import { useExportDestinationStore } from "./export-destination-store";
import { ExportRow } from "./export-row";
import { useSaveExports } from "./use-save-exports";

/** The workspace files are drawn in, so the user's page never changes. */
const WORKSPACE = "layer-export:all";

/**
 * Export all, as in Figma: every frame of this page or the whole file, ticked off as wanted. A
 * layer's own rows win, the others use the default row, and the files go into a folder or a zip.
 */
export function ExportAllDialog() {
  const open = useExportAllStore((state) => state.open);
  const setOpen = useExportAllStore((state) => state.setOpen);
  return open ? <ExportAllBody onClose={() => setOpen(false)} /> : null;
}

function ExportAllBody({ onClose }: ExportAllBodyProps) {
  const engine = useDesignEngine();
  const pages = useService(DESIGN_PAGES);
  const { name } = useCanvasFile();
  const { row, setRow } = useExportAllStore();
  const { destination, setDestination } = useExportDestinationStore();
  const { save, overwrite } = useSaveExports();
  const [scope, setScope] = useState<ExportAllScope>("page");
  const [skipped, setSkipped] = useState<ReadonlySet<string>>(new Set());
  const [busy, setBusy] = useState(false);

  const groups = useMemo<ExportAllGroup[]>(() => {
    const shown = pages
      .pages()
      .filter((page) => !page.hidden && (scope === "all" || page.id === engine.scope));
    return shown.flatMap(({ id, name: pageName }) => {
      const items = exportItems(pages.nodes(id), engine.kinds);
      return items.length > 0 ? [{ id, name: pageName, items }] : [];
    });
  }, [pages, engine, scope]);

  const planned = useMemo(() => {
    const used = new Set<string>();
    const folders = new Map(groups.map((g) => [g.id, uniqueFolderName(g.name, used)]));
    const nodes = groups.flatMap((g) => g.items).filter((node) => !skipped.has(node.id));
    return plannedExports(engine, nodes, {
      fallback: row,
      folderOf: scope === "all" ? (node) => folders.get(node.pageId) ?? "" : undefined,
    });
  }, [engine, groups, skipped, row, scope]);

  const toggle = (id: string, on: boolean) => {
    const next = new Set(skipped);
    if (on) next.delete(id);
    else next.add(id);
    setSkipped(next);
  };

  const run = async () => {
    setBusy(true);
    const count = planned.length;
    try {
      const workspace = engine.workspace(WORKSPACE);
      const files = await toastProgress(() => renderAcrossPages(workspace, planned), {
        loading: t("progress", { count }),
        error: t("failed"),
      });
      if (files && (await save(files, name))) {
        toast({ title: t("done", { count }) });
        onClose();
      }
    } catch (error) {
      notifyError(t("saveError"), error);
    } finally {
      engine.dropWorkspace(WORKSPACE);
      setBusy(false);
    }
  };

  const scopes: { value: ExportAllScope; label: string }[] = [
    { value: "page", label: t("all.thisPage") },
    { value: "all", label: t("all.allPages") },
  ];
  const destinations: { value: ExportDestination; label: string }[] = [
    { value: "folder", label: t("folder") },
    { value: "zip", label: t("zip") },
  ];

  return (
    <>
      <AppDialog
        open
        onOpenChange={(next) => !next && onClose()}
        title={t("all.title")}
        description={t("all.description")}
        size="md"
        bodyClassName="flex h-[min(480px,65vh)] flex-col gap-3"
        footer={
          <>
            <Button variant="outline" onClick={onClose}>
              {tCommon("cancel")}
            </Button>
            <Button disabled={busy || planned.length === 0} onClick={() => void run()}>
              {t("all.action", { count: planned.length })}
            </Button>
          </>
        }
      >
        <SegmentedControl
          label={t("all.scope")}
          value={scope}
          options={scopes}
          onChange={setScope}
          size="sm"
          fullWidth
        />
        <Field label={t("all.defaults")} layout="stacked">
          <ExportRow row={row} onChange={setRow} />
        </Field>
        {groups.length === 0 ? (
          <EmptyState
            icon={<FolderDown />}
            title={t("all.empty")}
            description={t("all.emptyHint")}
            className="flex-1"
          />
        ) : (
          <ExportAllList
            groups={groups}
            named={scope === "all"}
            skipped={skipped}
            onToggle={toggle}
          />
        )}
        {planned.length > 1 && canSaveToFolder() && (
          <SegmentedControl
            label={t("saveAs")}
            value={destination}
            options={destinations}
            onChange={setDestination}
            size="sm"
            fullWidth
          />
        )}
      </AppDialog>
      <OverwriteDialog request={overwrite.request} onAnswer={overwrite.answer} />
    </>
  );
}
