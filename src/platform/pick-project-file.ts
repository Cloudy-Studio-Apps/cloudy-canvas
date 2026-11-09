import { isTauri } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-dialog";

import { PROJECT_EXTENSION } from "@shared/core";
import { t } from "./platform.i18n";

/** Asks for a project's `.cproject` file; its path, `null` when cancelled (or in a browser). */
export async function pickProjectFile(title: string): Promise<string | null> {
  if (!isTauri()) return null;
  const picked = await open({
    title,
    multiple: false,
    directory: false,
    filters: [{ name: t("filters.project"), extensions: [PROJECT_EXTENSION] }],
  });
  return typeof picked === "string" ? picked : null;
}
