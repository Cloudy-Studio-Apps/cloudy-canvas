import { tCommon } from "@shared/core";
import { useDocumentTokens } from "@canvas-ui";
import { AppDialog, Button } from "@shared/ui/kit";
import type { DeleteColorDialogProps } from "./colors-ui.types";
import { t } from "../colors.i18n";

/**
 * Asks before deleting a board color something uses: the elements keep their color, unlinked,
 * and the colors following it keep its color as their own.
 */
export function DeleteColorDialog({ variable, onClose }: DeleteColorDialogProps) {
  const { tokens } = useDocumentTokens();
  const usage = variable ? tokens.usageOf(variable.id) : null;
  const elements = usage?.layers.length ?? 0;
  const aliases = usage?.aliases.length ?? 0;
  const remove = () => {
    if (variable) tokens.deleteVariables([variable.id]);
    onClose();
  };
  const uses = [
    elements > 0 ? t("deleteColor.elements", { count: elements }) : null,
    aliases > 0 ? t("deleteColor.colors", { count: aliases }) : null,
  ].filter(Boolean);
  return (
    <AppDialog
      open={!!variable}
      onOpenChange={(open) => !open && onClose()}
      size="sm"
      title={t("deleteColor.title", { name: variable?.name ?? "" })}
      description={t("deleteColor.description", { uses: uses.join(t("deleteColor.and")) })}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            {tCommon("cancel")}
          </Button>
          <Button variant="destructive" onClick={remove}>
            {tCommon("delete")}
          </Button>
        </>
      }
    />
  );
}
