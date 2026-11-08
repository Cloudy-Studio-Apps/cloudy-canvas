import { useState } from "react";

import { AppDialog, Button } from "@shared/ui/kit";
import { useProjectContext } from "../project-context";
import { parentRel } from "../project-rel";
import { FolderPicker } from "./folder-picker";
import { t } from "../project.i18n";

/** Move to…: pick a folder of the tree to move the chosen file or folder into. */
export function MoveDialog() {
  const { moving, setMoving, actions } = useProjectContext();
  const [target, setTarget] = useState<string | null>(null);
  const close = () => {
    setMoving(null);
    setTarget(null);
  };
  const same = moving !== null && target === parentRel(moving.rel);

  return (
    <AppDialog
      open={moving !== null}
      onOpenChange={(open) => !open && close()}
      title={t("move.title", { name: moving?.name ?? "" })}
      description={t("move.description")}
      footer={
        <>
          <Button variant="ghost" onClick={close}>
            {t("move.cancel")}
          </Button>
          <Button
            disabled={target === null || same}
            onClick={() => {
              if (moving && target !== null) {
                void actions.move(moving.rel, target, moving.kind === "folder");
              }
              close();
            }}
          >
            {t("move.confirm")}
          </Button>
        </>
      }
    >
      {moving && (
        <FolderPicker
          value={target}
          onChange={setTarget}
          exclude={moving.kind === "folder" ? moving.rel : undefined}
        />
      )}
    </AppDialog>
  );
}
