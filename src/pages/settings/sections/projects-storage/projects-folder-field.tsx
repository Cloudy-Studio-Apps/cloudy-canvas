import { useEffect, useState } from "react";

import { pickFolder } from "@platform";
import { Button } from "@shared/ui/kit";
import {
  resolveProjectsFolder,
  useProjectsSettingsStore,
} from "@shared/stores/projects-settings-store";
import { notifyError } from "@shared/stores/toast-store";
import { t } from "../../settings.i18n";

/** Where new projects go, with Change… (and Use default once another folder is chosen). */
export function ProjectsFolderField() {
  const chosen = useProjectsSettingsStore((s) => s.projectsFolder);
  const setFolder = useProjectsSettingsStore((s) => s.setProjectsFolder);
  const [shown, setShown] = useState("");

  useEffect(() => {
    resolveProjectsFolder().then(setShown, (error: unknown) =>
      notifyError(t("storage.folderFailed"), error),
    );
  }, [chosen]);

  const change = () =>
    void pickFolder(t("storage.pickFolder")).then(
      (folder) => folder && setFolder(folder),
      (error: unknown) => notifyError(t("storage.folderFailed"), error),
    );

  return (
    <div className="space-y-1.5">
      <p className="text-sm font-medium">{t("storage.whereNew")}</p>
      <div className="flex items-center gap-2">
        <p className="min-w-0 flex-1 truncate rounded-md border bg-surface-sunken px-2.5 py-2 font-mono text-xs text-muted-foreground">
          {shown}
        </p>
        <Button variant="outline" size="sm" onClick={change}>
          {t("storage.change")}
        </Button>
        {chosen !== null && (
          <Button variant="ghost" size="sm" onClick={() => setFolder(null)}>
            {t("storage.useDefault")}
          </Button>
        )}
      </div>
      <p className="text-sm text-muted-foreground">{t("storage.whereHint")}</p>
    </div>
  );
}
