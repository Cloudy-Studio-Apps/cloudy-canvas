import { useState } from "react";
import { Trash2 } from "lucide-react";

import { useService } from "@canvas-ui";
import { notifyError } from "@shared/stores/toast-store";
import { tCommon } from "@shared/core";
import { AppDialog, Button } from "@shared/ui/kit";
import { DESIGN_DATA_SOURCES } from "../../model";
import type { RemoveSourceButtonProps } from "./remove-source-button.types";
import { t } from "../../data.i18n";

/**
 * Remove source, after asking: undo brings the source back, but not the keys this device saved
 * for it, which are deleted with it.
 */
export function RemoveSourceButton({ source, onRemoved }: RemoveSourceButtonProps) {
  const sources = useService(DESIGN_DATA_SOURCES);
  const [open, setOpen] = useState(false);

  const remove = async () => {
    setOpen(false);
    try {
      await sources.remove(source.id);
      onRemoved();
    } catch (error) {
      notifyError(t("source.removeFailed"), error);
    }
  };

  return (
    <>
      <Button
        size="sm"
        variant="outline"
        className="self-start text-destructive"
        onClick={() => setOpen(true)}
      >
        <Trash2 />
        {t("source.remove")}
      </Button>
      <AppDialog
        open={open}
        onOpenChange={setOpen}
        size="sm"
        title={t("source.removeTitle", { name: source.name })}
        description={t("source.removeMessage")}
        footer={
          <>
            <Button variant="outline" onClick={() => setOpen(false)}>
              {tCommon("cancel")}
            </Button>
            <Button variant="destructive" onClick={() => void remove()}>
              {t("source.remove")}
            </Button>
          </>
        }
      />
    </>
  );
}
