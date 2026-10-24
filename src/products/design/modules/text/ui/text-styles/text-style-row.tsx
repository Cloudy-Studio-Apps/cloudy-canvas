import { readTextStyle, textStyleSummary } from "@design";
import { tokenLeafOf } from "@canvas";
import type { StyleRowProps } from "@design/modules/variables/ui";
import { Popover, PopoverContent, PopoverTrigger } from "@shared/ui/components/ui/popover";
import { cn } from "@shared/ui/lib/utils";
import { TextStyleEditor } from "./text-style-editor";

/** A text style in the Styles section, Figma's way: "Ag" in its font, its name, "16/120%". */
export function TextStyleRow({ style, editing, setEditing, onDelete }: StyleRowProps) {
  const value = readTextStyle(style.value);
  return (
    <Popover open={editing} onOpenChange={setEditing}>
      <PopoverTrigger asChild>
        <button
          type="button"
          title={style.description || style.name}
          className={cn(
            "flex h-7 w-full items-center gap-2 rounded-md px-1.5 text-left text-xs hover:bg-muted",
            editing && "bg-primary/10",
          )}
        >
          <span
            className="w-4 shrink-0 text-center text-[13px] leading-none"
            style={{
              fontFamily: value.fontFamily,
              fontWeight: value.fontWeight,
              fontStyle: value.fontStyle,
            }}
          >
            Ag
          </span>
          <span className="min-w-0 truncate">{tokenLeafOf(style.name)}</span>
          <span className="shrink-0 text-subtle-foreground">· {textStyleSummary(style)}</span>
        </button>
      </PopoverTrigger>
      <PopoverContent side="left" align="start" className="max-h-[80vh] w-72 overflow-y-auto">
        <TextStyleEditor style={style} onDelete={onDelete} />
      </PopoverContent>
    </Popover>
  );
}
