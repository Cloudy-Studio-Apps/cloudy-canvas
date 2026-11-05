import { KeyRound } from "lucide-react";

import { useService } from "@canvas-ui";
import { PanelSection } from "@design/ui/components/panel";
import { notifyError } from "@shared/stores/toast-store";
import { detectFormat } from "../../formats";
import { DESIGN_DATA_SOURCES } from "../../model";
import type { SettingValue } from "../../source";
import type { SourceFormChangeOptions } from "../data.points.types";
import { startUpdate } from "../hooks/run-update";
import { useDataRegistry } from "../hooks/use-data-registry";
import { useSourceSecrets } from "../hooks/use-source-secrets";
import { FieldTreeView } from "./field-tree-view";
import { FormatSelect } from "./format-select";
import { ImageFailuresLine } from "./image-failures-line";
import { UpdateWarningsLine } from "./update-warnings-line";
import { RemoveSourceButton } from "./remove-source-button";
import { RowsFromField } from "./rows-from-field";
import { RowsTable } from "./rows-table";
import { ShapeStep } from "./shape-step";
import { SourceIssues } from "./source-issues";
import { SourceSettingsForm } from "./source-settings-form";
import type { SourceSectionsProps } from "./source-sections.types";
import { translatedError } from "./error-text";
import { t } from "../../data.i18n";

/**
 * A source's detail: its settings (each change saved at once, secrets to this device), how it is
 * read, its fields, its first rows, and Remove.
 */
export function SourceSections({ source, sourceType, issues, onRemoved }: SourceSectionsProps) {
  const sources = useService(DESIGN_DATA_SOURCES);
  const { formats } = useDataRegistry();
  const secrets = useSourceSecrets(source);
  const rows = sources.rows(source.id);

  const save = (values: Record<string, SettingValue>, options?: SourceFormChangeOptions) => {
    sources.setSettings(source.id, values).then(
      () => {
        secrets.refresh();
        if (options?.update) startUpdate(sources, source.id);
      },
      (error: unknown) => {
        notifyError(t("source.saveFailed"), translatedError(error));
      },
    );
  };
  const preview = (
    values: Record<string, SettingValue>,
    rowsPath: string | null,
    signal: AbortSignal,
  ) =>
    sources.preview(
      {
        sourceType: source.sourceType,
        settings: values,
        sourceId: source.id,
        format: source.format,
        formatOptions: source.formatOptions,
        rowsPath,
        shape: source.shape,
        fields: source.fields,
      },
      signal,
    );
  // "Automatic" stays automatic: it reads the new file's extension by itself.
  const proposeFormat = (name: string) => {
    if (source.format === "auto") return;
    const format = detectFormat({ fileName: name }, formats);
    if (format && format.id !== source.format) sources.setFormat(source.id, format.id, {});
  };

  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      <SourceIssues issues={issues} />
      <PanelSection title={t("source.settings")}>
        {sourceType ? (
          <div className="flex flex-col gap-2">
            <SourceSettingsForm
              sourceType={sourceType}
              values={source.settings}
              stored={secrets.stored}
              onChange={save}
              onFilePicked={proposeFormat}
              onPreview={preview}
              rowsPath={source.rowsPath}
              onRowsPathChange={(rowsPath) => sources.setRowsPath(source.id, rowsPath)}
            />
            {secrets.missing.length > 0 && (
              <p className="flex items-center gap-1 text-xs text-warning">
                <KeyRound className="size-3 shrink-0" />
                {t("source.needsKeyHint")}
              </p>
            )}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">
            {t("source.unknownType", { type: source.sourceType })}
          </p>
        )}
      </PanelSection>
      <PanelSection title={t("source.formatTitle")}>
        <div className="flex flex-col gap-2.5">
          <FormatSelect
            formats={formats}
            format={source.format}
            options={source.formatOptions}
            onChange={(format, options) => sources.setFormat(source.id, format, options)}
          />
          <RowsFromField source={source} />
          <ShapeStep source={source} />
        </div>
      </PanelSection>
      <PanelSection title={t("fields.title")}>
        <div className="flex flex-col gap-1">
          <ImageFailuresLine sourceId={source.id} />
          <UpdateWarningsLine sourceId={source.id} />
          <FieldTreeView source={source} rows={rows} />
        </div>
      </PanelSection>
      <PanelSection title={t("source.table.title")}>
        <RowsTable rows={rows} fields={source.fields} />
      </PanelSection>
      <div className="flex px-3 py-3">
        <RemoveSourceButton source={source} onRemoved={onRemoved} />
      </div>
    </div>
  );
}
