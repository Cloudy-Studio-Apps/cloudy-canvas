import { useState } from "react";

import { tCommon } from "@shared/core";
import { AppDialog, Button, Input } from "@shared/ui/kit";
import type { RenameAssetDialogProps, RenameFormProps } from "./assets-ui.types";
import { t } from "../assets.i18n";

/** Asks for a picture's new name. */
export function RenameAssetDialog({ asset, ...props }: RenameAssetDialogProps) {
  return asset && <RenameForm key={asset.id} name={asset.name} {...props} />;
}

function RenameForm({ name: current, onClose, onRename }: RenameFormProps) {
  const [name, setName] = useState(current);
  const trimmed = name.trim();
  const apply = () => {
    if (trimmed) onRename(trimmed);
    onClose();
  };
  return (
    <AppDialog
      open
      onOpenChange={(open) => !open && onClose()}
      title={t("rename.title")}
      size="sm"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            {tCommon("cancel")}
          </Button>
          <Button onClick={apply} disabled={!trimmed}>
            {t("rename.confirm")}
          </Button>
        </>
      }
    >
      <Input
        autoFocus
        value={name}
        aria-label={t("rename.label")}
        onChange={(event) => setName(event.target.value)}
        onKeyDown={(event) => event.key === "Enter" && apply()}
      />
    </AppDialog>
  );
}
