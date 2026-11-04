import { useRef, useState } from "react";

import { useService } from "@canvas-ui";
import { PanelSection } from "@design/ui/components/panel";
import { tCommon } from "@shared/core";
import { notifyError } from "@shared/stores/toast-store";
import { Button } from "@shared/ui/kit";
import { detectFormat } from "../../formats";
import { DESIGN_DATA_SOURCES } from "../../model";
import { holdsDevicePath, isAbsolutePath } from "../../settings";
import { filePathKey } from "../../update";
import type { SettingValue } from "../../source";
import { startUpdate } from "../hooks/run-update";
import { useDataRegistry } from "../hooks/use-data-registry";
import { FormatSelect } from "./format-select";
import { SourceSettingsForm } from "./source-settings-form";
import type { CreateSourceFormProps } from "./create-source-form.types";
import { translatedError } from "./error-text";
import { t } from "../../data.i18n";

/** A file just picked here holds its path in this form: it counts as known on this device. */
function pickedFiles(
  sourceType: CreateSourceFormProps["sourceType"],
  values: Record<string, SettingValue>,
) {
  return new Set(
    sourceType.settings.flatMap((spec) => {
      const value = values[spec.key];
      return holdsDevicePath(spec) && typeof value === "string" && isAbsolutePath(value)
        ? [filePathKey(spec.key)]
        : [];
    }),
  );
}

/** A new source's form: its settings and format, then "Create and update". */
export function CreateSourceForm({ sourceType, onCreated, onCancel }: CreateSourceFormProps) {
  const sources = useService(DESIGN_DATA_SOURCES);
  const { formats } = useDataRegistry();
  const [values, setValues] = useState<Record<string, SettingValue>>({});
  const [format, setFormat] = useState("auto");
  const [options, setOptions] = useState<Record<string, SettingValue>>({});
  const [rowsPath, setRowsPath] = useState<string | null>(null);
  // A form's "Save and update" picks the list and saves in one go: read the latest here.
  const latestPath = useRef<string | null>(null);
  const [busy, setBusy] = useState(false);

  const create = async (settings = values) => {
    setBusy(true);
    try {
      const source = await sources.create({
        sourceType: sourceType.id,
        settings,
        format,
        formatOptions: options,
        rowsPath: latestPath.current,
      });
      onCreated(source.id);
      startUpdate(sources, source.id);
    } catch (error) {
      notifyError(t("source.createFailed"), translatedError(error));
      setBusy(false);
    }
  };

  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      <PanelSection title={t("source.settings")}>
        <SourceSettingsForm
          sourceType={sourceType}
          values={values}
          stored={pickedFiles(sourceType, values)}
          onChange={(next, change) => {
            setValues(next);
            // The form's own "Save and update" creates the source right away.
            if (change?.update) void create(next);
          }}
          onPreview={(settings, path, signal) =>
            sources.preview(
              {
                sourceType: sourceType.id,
                settings,
                format,
                formatOptions: options,
                rowsPath: path,
              },
              signal,
            )
          }
          rowsPath={rowsPath}
          onRowsPathChange={(path) => {
            latestPath.current = path;
            setRowsPath(path);
          }}
          onFilePicked={(name) => {
            const found = detectFormat({ fileName: name }, formats);
            if (found && found.id !== format) {
              setFormat(found.id);
              setOptions({});
            }
          }}
        />
      </PanelSection>
      <PanelSection title={t("source.formatTitle")}>
        <FormatSelect
          formats={formats}
          format={format}
          options={options}
          onChange={(next, nextOptions) => {
            setFormat(next);
            setOptions(nextOptions);
          }}
        />
      </PanelSection>
      <div className="flex justify-end gap-2 px-3 py-3">
        <Button size="sm" variant="outline" onClick={onCancel}>
          {tCommon("cancel")}
        </Button>
        <Button size="sm" disabled={busy} onClick={() => void create()}>
          {t("source.create")}
        </Button>
      </div>
    </div>
  );
}
