import { useState } from "react";
import { Palette } from "lucide-react";

import { ColorPopover } from "@canvas-ui";
import { Button, IconButton } from "@shared/ui/kit";
import { useProjectContext } from "../project-context";
import type { FolderColorButtonProps } from "./folder-color-button.types";
import { t } from "../project.i18n";

/** The palette button on a folder row: pick the folder's color, or go back to the default. */
export function FolderColorButton({ rel, name }: FolderColorButtonProps) {
  const { manifest, actions } = useProjectContext();
  const saved = manifest.folders[rel]?.color;
  const [draft, setDraft] = useState<string | null>(null);
  const shown = draft ?? saved ?? "#8a8a8a";

  return (
    <ColorPopover
      color={shown}
      label={t("folder.colorLabel", { name })}
      side="right"
      onChange={(next, info) => {
        setDraft(next.color);
        if (info.done) {
          void actions.setFolderColor(rel, next.color).then(() => setDraft(null));
        }
      }}
      trigger={
        <IconButton label={t("folder.color", { name })} size="xs" tooltip={false}>
          <Palette />
        </IconButton>
      }
    >
      {saved && (
        <Button variant="ghost" size="sm" onClick={() => void actions.setFolderColor(rel, null)}>
          {t("folder.colorReset")}
        </Button>
      )}
    </ColorPopover>
  );
}
