import { t } from "../db-export.i18n";
import type { CodeWarning, CodeWarningId } from "./warnings.types";

/** A warning about a table or column (see `CodeWarningId`). */
export function warn(
  id: CodeWarningId,
  params: Readonly<Record<string, string>> = {},
  at: { table?: string; column?: string } = {},
): CodeWarning {
  return { id, params, ...at };
}

/** A warning's text in the current locale (the UI's; agent tools return `id` and `params`). */
export function warningText(warning: CodeWarning): string {
  return t(`warnings.${warning.id}`, warning.params);
}
