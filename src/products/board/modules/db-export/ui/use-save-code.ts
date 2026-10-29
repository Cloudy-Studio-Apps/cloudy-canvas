import { useState } from "react";

import { clipboard, exportFile, exportFiles } from "@platform";
import { notifyError, toast } from "@shared/stores/toast-store";
import type { CodeFile } from "../targets";
import type { OverwriteRequest } from "./use-save-code.types";
import { t } from "../db-export.i18n";

/**
 * Copy and Save for the generated files: one file goes through the save dialog, several into a
 * folder (asking first, through `overwrite`, when files there would be replaced).
 */
export function useSaveCode(name: string) {
  const [overwrite, setOverwrite] = useState<OverwriteRequest | null>(null);

  const copy = async (file: CodeFile) => {
    try {
      await clipboard.writeText(file.content);
      toast({ title: t("copy.done"), description: file.path });
    } catch (error) {
      notifyError(t("copy.error"), error);
    }
  };

  const save = async (files: readonly CodeFile[]): Promise<boolean> => {
    try {
      const [only] = files;
      if (files.length === 1 && only) {
        const fileName = only.path.split("/").pop() ?? only.path;
        const dot = fileName.lastIndexOf(".");
        const extension = dot > 0 ? fileName.slice(dot + 1) : "txt";
        const base = dot > 0 ? fileName.slice(0, dot) : fileName;
        const blob = new Blob([only.content], { type: "text/plain" });
        const saved = await exportFile(blob, base, { extension, label: fileName });
        if (saved) toast({ title: t("save.done", { count: 1 }) });
        return saved;
      }
      const confirm = (existing: string[]) =>
        new Promise<boolean>((resolve) => {
          setOverwrite({ existing, resolve });
        });
      const saved = await exportFiles(files, name, confirm);
      if (saved) toast({ title: t("save.done", { count: files.length }) });
      return saved;
    } catch (error) {
      notifyError(t("save.error"), error);
      return false;
    }
  };

  const answer = (replace: boolean) => {
    overwrite?.resolve(replace);
    setOverwrite(null);
  };

  return { copy, save, overwrite, answer };
}
