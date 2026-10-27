import { useEffect, useState } from "react";

import type { ExportArea, ExportBackground, ExportFormat } from "@canvas";
import { exportFile } from "@platform";
import { Button } from "@shared/ui/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@shared/ui/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@shared/ui/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@shared/ui/components/ui/select";
import { notifyError, toast, toastProgress } from "@shared/stores/toast-store";
import { useEngine, useEngineState } from "../../engine-context";
import type { ExportDialogProps } from "./export-dialog.types";
import { ExportField } from "./export-field";
import { EXPORT_FORMATS } from "./export-formats";
import { t } from "../components.i18n";

/**
 * Exports the selection or the whole canvas as PNG, JPG, PDF or CSV (tables only). Opened by the
 * `export` command (Ctrl+Shift+E and the context menu), on the selection when there is one.
 */
export function ExportDialog({ name }: ExportDialogProps) {
  const engine = useEngine();
  const hasSelection = useEngineState((state) => state.selectionCount > 0);
  const [open, setOpen] = useState(false);
  const [format, setFormat] = useState<ExportFormat>("png");
  const [background, setBackground] = useState<ExportBackground>("solid");
  const [area, setArea] = useState<ExportArea>("selection");
  const [busy, setBusy] = useState(false);

  useEffect(
    () =>
      engine.handleHostAction("export", () => {
        setArea(engine.selectedIds().length > 0 ? "selection" : "board");
        setOpen(true);
      }),
    [engine],
  );

  const exportArea: ExportArea = area === "selection" && !hasSelection ? "board" : area;
  const csvAvailable = open && engine.canExportCsv(exportArea);
  const chosen: ExportFormat = format === "csv" && !csvAvailable ? "png" : format;
  // Only PNG keeps transparency.
  const solidOnly = chosen !== "png";
  const file = EXPORT_FORMATS.find((f) => f.id === chosen)!;

  const run = async () => {
    setBusy(true);
    try {
      const blob = await toastProgress(
        () =>
          engine.exportElements({
            format: chosen,
            background: solidOnly ? "solid" : background,
            area: exportArea,
          }),
        { loading: t("export.progress", { format: file.name }), error: t("export.failed") },
      );
      if (!blob) return;
      // No spinner here: the save dialog is waiting for the user.
      if (await exportFile(blob, name, file)) {
        setOpen(false);
        toast({ title: t("export.done", { format: file.name }) });
      }
    } catch (error) {
      notifyError(t("export.saveError"), error);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        className="pointer-events-auto"
        // Keys pressed in the dialog aren't canvas shortcuts.
        onKeyDown={(event) => event.stopPropagation()}
      >
        <DialogHeader>
          <DialogTitle>{t("export.title")}</DialogTitle>
          <DialogDescription className="sr-only">{t("export.description")}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 px-4 py-4">
          <ExportField label={t("export.fileType")}>
            <RadioGroup
              value={chosen}
              onValueChange={(value) => setFormat(value as ExportFormat)}
              aria-label={t("export.fileType")}
            >
              {EXPORT_FORMATS.map(({ id, name: formatName }) => (
                <label
                  key={id}
                  className="flex items-center gap-2 py-0.5 text-sm has-disabled:text-muted-foreground"
                >
                  <RadioGroupItem value={id} disabled={id === "csv" && !csvAvailable} />
                  {formatName}
                </label>
              ))}
            </RadioGroup>
          </ExportField>
          <ExportField label={t("export.background")} id="export-background">
            <Select
              value={solidOnly ? "solid" : background}
              onValueChange={(value) => setBackground(value as ExportBackground)}
              disabled={solidOnly}
            >
              <SelectTrigger id="export-background" className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="solid">{t("export.solid")}</SelectItem>
                <SelectItem value="transparent">{t("export.transparent")}</SelectItem>
              </SelectContent>
            </Select>
          </ExportField>
          <ExportField label={t("export.area")} id="export-area">
            <Select value={exportArea} onValueChange={(value) => setArea(value as ExportArea)}>
              <SelectTrigger id="export-area" className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="selection" disabled={!hasSelection}>
                  {t("export.selectionOnly")}
                </SelectItem>
                <SelectItem value="board">{t("export.entireBoard")}</SelectItem>
              </SelectContent>
            </Select>
          </ExportField>
        </div>
        <DialogFooter>
          <Button onClick={() => void run()} disabled={busy}>
            {busy ? t("export.exporting") : t("export.export")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
