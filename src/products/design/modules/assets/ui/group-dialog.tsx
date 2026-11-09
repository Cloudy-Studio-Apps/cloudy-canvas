import { useState } from "react";

import { tCommon } from "@shared/core";
import { AppDialog, Button, Input } from "@shared/ui/kit";
import { normalizeGroup } from "./asset-tree";
import type { GroupDialogProps } from "./assets-ui.types";
import { t } from "../assets.i18n";

/** Asks for the group (a slash path like `Brand/Logo`) the next uploads go to. */
export function GroupDialog({ open, ...props }: GroupDialogProps) {
  return open && <GroupForm {...props} />;
}

function GroupForm({ group, onClose, onApply }: Omit<GroupDialogProps, "open">) {
  const [text, setText] = useState(group);
  const apply = () => {
    onApply(normalizeGroup(text));
    onClose();
  };
  return (
    <AppDialog
      open
      onOpenChange={(next) => !next && onClose()}
      title={t("group.title")}
      description={t("group.description")}
      size="sm"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            {tCommon("cancel")}
          </Button>
          <Button onClick={apply}>{t("group.confirm")}</Button>
        </>
      }
    >
      <Input
        autoFocus
        value={text}
        placeholder={t("group.placeholder")}
        aria-label={t("group.title")}
        onChange={(event) => setText(event.target.value)}
        onKeyDown={(event) => event.key === "Enter" && apply()}
      />
    </AppDialog>
  );
}
