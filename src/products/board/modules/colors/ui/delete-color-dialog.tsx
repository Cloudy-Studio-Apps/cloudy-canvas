import { useDocumentTokens } from "@canvas-ui";
import { AppDialog, Button } from "@shared/ui/kit";
import type { DeleteColorDialogProps } from "./colors-ui.types";

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
    elements > 0 ? `${elements} element${elements === 1 ? "" : "s"}` : null,
    aliases > 0 ? `${aliases} other color${aliases === 1 ? "" : "s"}` : null,
  ].filter(Boolean);
  return (
    <AppDialog
      open={!!variable}
      onOpenChange={(open) => !open && onClose()}
      size="sm"
      title={`Delete “${variable?.name ?? ""}”?`}
      description={`It's used by ${uses.join(" and ")}. They keep its color, unlinked.`}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={remove}>
            Delete
          </Button>
        </>
      }
    />
  );
}
