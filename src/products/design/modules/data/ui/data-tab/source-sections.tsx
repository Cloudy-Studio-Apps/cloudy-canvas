import { KeyRound } from "lucide-react";

import { useService } from "@canvas-ui";
import { PanelSection } from "@design/ui/components/panel";
import { notifyError } from "@shared/stores/toast-store";
import { detectFormat } from "../../formats";
import { DESIGN_DATA_SOURCES } from "../../model";
import type { SettingValue } from "../../source";
import { useDataRegistry } from "../hooks/use-data-registry";
import { useSourceSecrets } from "../hooks/use-source-secrets";
import { FieldList } from "./field-list";
import { FormatSelect } from "./format-select";
import { RemoveSourceButton } from "./remove-source-button";
import { RowsTable } from "./rows-table";
import { SourceSettingsForm } from "./source-settings-form";
import type { SourceSectionsProps } from "./source-sections.types";
import { t } from "../../data.i18n";

/**
 * A source's detail: its settings (each change saved at once, secrets to this device), how it is
 * read, its fields, its first rows, and Remove.
 */
export function SourceSections({ source, sourceType, onRemoved }: SourceSectionsProps) {
  const sources = useService(DESIGN_DATA_SOURCES);
  const { formats } = useDataRegistry();
  const secrets = useSourceSecrets(source);
  const rows = sources.rows(source.id);

  const save = (values: Record<string, SettingValue>) => {
    sources.setSettings(source.id, values).then(secrets.refresh, (error: unknown) => {
      notifyError(t("source.saveFailed"), error);
    });
  };
  const proposeFormat = (name: string) => {
    const format = detectFormat({ fileName: name }, formats);
    if (format && format.id !== source.format) sources.setFormat(source.id, format.id, {});
  };

  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      <PanelSection title={t("source.settings")}>
        {sourceType ? (
          <div className="flex flex-col gap-2">
            <SourceSettingsForm
              sourceType={sourceType}
              values={source.settings}
              stored={secrets.stored}
              onChange={save}
              onFilePicked={proposeFormat}
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
        <FormatSelect
          formats={formats}
          format={source.format}
          options={source.formatOptions}
          onChange={(format, options) => sources.setFormat(source.id, format, options)}
        />
      </PanelSection>
      <PanelSection title={t("fields.title")}>
        <FieldList source={source} rows={rows} />
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
