import { FolderOpen } from "lucide-react";

import { notifyError } from "@shared/stores/toast-store";
import { Button, Field } from "@shared/ui/kit";
import { baseName } from "../../settings";
import { platformDataServices } from "../hooks/data-services";
import type { FileFieldProps } from "./file-field.types";
import { t } from "../../data.i18n";

/** Asks for the file or folder; `null` when cancelled. */
async function choosePlace(
  spec: FileFieldProps["spec"],
): Promise<{ path: string; name: string } | null> {
  if (spec.kind === "folder") {
    const path = await platformDataServices.pickFolder();
    return path ? { path, name: baseName(path) } : null;
  }
  const file = await platformDataServices.pickFile(spec.extensions);
  return file?.path ? { path: file.path, name: file.name } : null;
}

/**
 * A file (or folder) on this device: its name, a button that asks for another, and, when this
 * device doesn't know where the chosen one is (the design came from another device), a line
 * asking to pick it.
 */
export function FileField({ spec, value, onDevice, onChange, onFilePicked }: FileFieldProps) {
  const folder = spec.kind === "folder";
  const name = baseName(value);
  const choose = async () => {
    try {
      const picked = await choosePlace(spec);
      if (!picked) return;
      onChange(picked.path);
      if (!folder) onFilePicked?.(picked.name);
    } catch (error) {
      notifyError(t(folder ? "source.pickFolderFailed" : "source.pickFailed"), error);
    }
  };

  return (
    <Field label={spec.label}>
      <div className="flex min-w-0 items-center gap-1.5">
        <span
          className="min-w-0 flex-1 truncate text-xs text-muted-foreground"
          title={value || undefined}
        >
          {name || t(folder ? "source.noFolder" : "source.noFile")}
        </span>
        <Button size="xs" variant="outline" onClick={() => void choose()}>
          <FolderOpen />
          {t("source.chooseFile")}
        </Button>
      </div>
      {value !== "" && !onDevice && (
        <p className="text-xs text-warning">
          {t(folder ? "errors.pickFolderAgain" : "errors.pickFileAgain")}
        </p>
      )}
    </Field>
  );
}
