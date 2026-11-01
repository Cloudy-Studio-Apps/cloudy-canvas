import { Download } from "lucide-react";

import { OverwriteDialog } from "@canvas-ui";
import { PanelAddButton, PanelSection } from "@design/ui/components/panel";
import { useDesignEngine } from "@design/ui/design-engine-context";
import { useEditNodes } from "@design/ui/hooks";
import type { PropertySectionProps } from "@design/ui/modules";
import { canSaveToFolder, type ExportDestination } from "@platform";
import { Button, SegmentedControl } from "@shared/ui/kit";
import type { NodeExport } from "../../core";
import { t } from "../layer-export.i18n";
import { createNodeExport } from "../node-exports";
import { useExportDestinationStore } from "./export-destination-store";
import { ExportRow } from "./export-row";
import { useExportNodes } from "./use-export-nodes";

/**
 * The exports saved on the selected layers: "+" adds a row, and the button makes all their files,
 * into a folder or a zip when there are several. Without rows, the button opens the export dialog
 * for the selection (or the page when nothing is selected).
 */
export function ExportSection({ selection: { nodes } }: PropertySectionProps) {
  const engine = useDesignEngine();
  const edit = useEditNodes();
  const { count, busy, run, overwrite } = useExportNodes(nodes);
  const { destination, setDestination } = useExportDestinationStore();
  const first = nodes[0]?.exports ?? [];
  const mixed = nodes.some((node) => JSON.stringify(node.exports) !== JSON.stringify(first));
  const setRows = (rows: NodeExport[]) => edit(nodes, () => ({ exports: rows }));
  const destinations: { value: ExportDestination; label: string }[] = [
    { value: "folder", label: t("folder") },
    { value: "zip", label: t("zip") },
  ];
  const label =
    nodes.length === 1 && nodes[0]
      ? t("exportOne", { name: nodes[0].name })
      : t("exportMany", { count: nodes.filter((node) => node.exports.length > 0).length });

  return (
    <PanelSection
      title={t("title")}
      actions={
        nodes.length > 0 && (
          <PanelAddButton
            label={t("add")}
            onClick={() =>
              setRows(mixed ? [createNodeExport([])] : [...first, createNodeExport(first)])
            }
          />
        )
      }
    >
      <div className="grid gap-2">
        {mixed ? (
          <p className="text-xs text-muted-foreground">{t("mixed")}</p>
        ) : (
          first.map((row) => (
            <ExportRow
              key={row.id}
              row={row}
              onChange={(next) => setRows(first.map((item) => (item.id === row.id ? next : item)))}
              onRemove={() => setRows(first.filter((item) => item.id !== row.id))}
            />
          ))
        )}
        {count > 1 && canSaveToFolder() && (
          <SegmentedControl
            label={t("saveAs")}
            value={destination}
            options={destinations}
            onChange={setDestination}
            size="sm"
            fullWidth
          />
        )}
        {count > 0 ? (
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            disabled={busy}
            onClick={() => void run()}
          >
            <Download />
            <span className="truncate">{label}</span>
          </Button>
        ) : (
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => engine.commands.export?.()}
          >
            <Download />
            {t("open")}
            <span className="ml-auto text-xs text-muted-foreground">
              {engine.keymap.label("export")}
            </span>
          </Button>
        )}
      </div>
      <OverwriteDialog request={overwrite.request} onAnswer={overwrite.answer} />
    </PanelSection>
  );
}
