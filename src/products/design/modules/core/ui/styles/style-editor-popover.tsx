import { Popover, PopoverContent, PopoverTrigger } from "@shared/ui/kit";
import type { StyleEditorPopoverProps } from "./styles.types";
import { useStyleType } from "./use-style-type";
import { t } from "../../core.i18n";

/** A style's editor in a popover beside the panel, opened by its row or chip. */
export function StyleEditorPopover({
  style,
  open,
  onOpenChange,
  onDelete,
  children,
}: StyleEditorPopoverProps) {
  const entry = useStyleType(style.styleType);
  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent side="left" align="start" className="max-h-[80vh] w-72 overflow-y-auto">
        {entry ? (
          <entry.Editor style={style} onDelete={onDelete} />
        ) : (
          <p className="text-xs text-muted-foreground">{t("styles.noEditor")}</p>
        )}
      </PopoverContent>
    </Popover>
  );
}
