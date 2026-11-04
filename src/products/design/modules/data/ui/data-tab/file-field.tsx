import { FolderOpen } from "lucide-react";

import { notifyError } from "@shared/stores/toast-store";
import { Button, Field } from "@shared/ui/kit";
import { baseName } from "../../settings";
import { platformDataServices } from "../hooks/data-services";
import type { FileFieldProps } from "./file-field.types";
import { t } from "../../data.i18n";

/**
 * A file on this device: its name, a button that asks for another, and, when this device doesn't
 * know where the chosen file is (the design came from another device), a line asking to pick it.
 */
export function FileField({ spec, value, onDevice, onChange, onFilePicked }: FileFieldProps) {
  const name = baseName(value);
  const choose = async () => {
    try {
      const file = await platformDataServices.pickFile(spec.extensions);
      if (!file?.path) return;
      onChange(file.path);
      onFilePicked?.(file.name);
    } catch (error) {
      notifyError(t("source.pickFailed"), error);
    }
  };

  return (
    <Field label={spec.label}>
      <div className="flex min-w-0 items-center gap-1.5">
        <span
          className="min-w-0 flex-1 truncate text-xs text-muted-foreground"
          title={value || undefined}
        >
          {name || t("source.noFile")}
        </span>
        <Button size="xs" variant="outline" onClick={() => void choose()}>
          <FolderOpen />
          {t("source.chooseFile")}
        </Button>
      </div>
      {value !== "" && !onDevice && (
        <p className="text-xs text-warning">{t("errors.pickFileAgain")}</p>
      )}
    </Field>
  );
}
