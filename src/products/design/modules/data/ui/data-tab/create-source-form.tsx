import { useState } from "react";

import { useService } from "@canvas-ui";
import { PanelSection } from "@design/ui/components/panel";
import { tCommon } from "@shared/core";
import { notifyError } from "@shared/stores/toast-store";
import { Button } from "@shared/ui/kit";
import { detectFormat } from "../../formats";
import { DESIGN_DATA_SOURCES } from "../../model";
import type { SettingValue } from "../../source";
import { startUpdate } from "../hooks/run-update";
import { useDataRegistry } from "../hooks/use-data-registry";
import { FormatSelect } from "./format-select";
import { SourceSettingsForm } from "./source-settings-form";
import type { CreateSourceFormProps } from "./create-source-form.types";
import { t } from "../../data.i18n";

const NO_SECRETS: ReadonlySet<string> = new Set();

/** A new source's form: its settings and format, then "Create and update". */
export function CreateSourceForm({ sourceType, onCreated, onCancel }: CreateSourceFormProps) {
  const sources = useService(DESIGN_DATA_SOURCES);
  const { formats } = useDataRegistry();
  const [values, setValues] = useState<Record<string, SettingValue>>({});
  const [format, setFormat] = useState("auto");
  const [options, setOptions] = useState<Record<string, SettingValue>>({});
  const [busy, setBusy] = useState(false);

  const create = async () => {
    setBusy(true);
    try {
      const source = await sources.create({
        sourceType: sourceType.id,
        settings: values,
        format,
        formatOptions: options,
      });
      onCreated(source.id);
      startUpdate(sources, source.id);
    } catch (error) {
      notifyError(t("source.createFailed"), error);
      setBusy(false);
    }
  };

  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      <PanelSection title={t("source.settings")}>
        <SourceSettingsForm
          sourceType={sourceType}
          values={values}
          stored={NO_SECRETS}
          onChange={setValues}
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
