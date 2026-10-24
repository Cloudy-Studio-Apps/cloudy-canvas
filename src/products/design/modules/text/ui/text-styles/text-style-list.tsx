import { Check } from "lucide-react";

import { tokenLeafOf } from "@canvas";
import { useDocumentTokens } from "@canvas-ui";
import { readTextStyle, TEXT_STYLE, textStyleSummary } from "@design";
import { cn } from "@shared/ui/lib/utils";
import type { TextStyleListProps } from "./text-styles.types";

/** The file's text styles to pick from (the Typography section's style menu). */
export function TextStyleList({ current, onPick }: TextStyleListProps) {
  const { store } = useDocumentTokens();
  const styles = store.styles(TEXT_STYLE);
  if (styles.length === 0) {
    return <p className="px-2 py-2 text-xs text-muted-foreground">No text styles yet.</p>;
  }
  return (
    <div className="flex max-h-64 flex-col overflow-y-auto">
      {styles.map((style) => {
        const value = readTextStyle(style.value);
        return (
          // eslint-disable-next-line no-restricted-syntax -- bespoke: a text style in its own font
          <button
            key={style.id}
            type="button"
            onClick={() => onPick(style.id)}
            className={cn(
              "flex h-7 items-center gap-2 rounded-md px-2 text-left text-xs hover:bg-muted",
              style.id === current && "bg-primary/10",
            )}
          >
            <span
              className="w-4 shrink-0 text-center text-[13px] leading-none"
              style={{ fontFamily: value.fontFamily, fontWeight: value.fontWeight }}
            >
              Ag
            </span>
            <span className="min-w-0 flex-1 truncate" title={style.name}>
              {tokenLeafOf(style.name)}
            </span>
            <span className="text-subtle-foreground">{textStyleSummary(style)}</span>
            {style.id === current && <Check className="size-3.5 text-primary" />}
          </button>
        );
      })}
    </div>
  );
}
