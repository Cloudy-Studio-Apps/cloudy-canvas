import { useMemo, useState } from "react";
import { Palette } from "lucide-react";

import { ColorPopover } from "@canvas-ui";
import { Button, IconButton } from "@shared/ui/kit";
import { resolveCssHex } from "@shared/ui/lib/css-color";
import { useProjectContext } from "../project-context";
import type { FolderColorButtonProps } from "./folder-color-button.types";
import { t } from "../project.i18n";

/** The palette button on a folder row: pick the folder's color, or go back to the default. */
export function FolderColorButton({ rel, name }: FolderColorButtonProps) {
  const { manifest, actions } = useProjectContext();
  const saved = manifest.folders[rel]?.color;
  const [draft, setDraft] = useState<string | null>(null);
  // A folder without a color shows the muted text color (`FolderGlyph`): the picker starts there.
  const neutral = useMemo(() => resolveCssHex("--muted-foreground"), []);
  const shown = draft ?? saved ?? neutral;

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
