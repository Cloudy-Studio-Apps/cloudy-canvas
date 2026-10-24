import { Grip, Plus, Unlink } from "lucide-react";
import { useState } from "react";

import { tokenLeafOf } from "@canvas";
import { useDocumentTokens } from "@canvas-ui";
import { TEXT_STYLE_PATH } from "@design";
import { PanelIconButton } from "@design/ui/components/panel";
import { useDesignEngine } from "@design/ui/design-engine-context";
import { useFieldBinding } from "@design/ui/hooks";
import { Popover, PopoverContent, PopoverTrigger } from "@shared/ui/components/ui/popover";
import { createTextStyle } from "./create-text-style";
import { TextStyleList } from "./text-style-list";
import type { TextStyleControlProps } from "./text-styles.types";

/**
 * The Typography section's style button (Figma's): pick a text style for the selected texts, or
 * save their typography as a new one. With a style, its name shows and can be detached.
 */
export function TextStyleControl({ texts }: TextStyleControlProps) {
  const engine = useDesignEngine();
  const { store } = useDocumentTokens();
  const binding = useFieldBinding(texts, TEXT_STYLE_PATH);
  const [open, setOpen] = useState(false);
  const style = binding.bound ? store.style(binding.bound) : undefined;

  const picker = (
    <PopoverContent align="end" className="w-64 p-1">
      <TextStyleList
        current={binding.bound ?? null}
        onPick={(id) => {
          binding.bind(id);
          setOpen(false);
        }}
      />
      <button
        type="button"
        onClick={() => {
          binding.bind(createTextStyle(engine));
          setOpen(false);
        }}
        className="mt-1 flex h-7 w-full items-center gap-2 rounded-md border-t border-border px-2 text-left text-xs hover:bg-muted"
      >
        <Plus className="size-3.5" /> Create style from this text
      </button>
    </PopoverContent>
  );

  return (
    <div className="flex items-center gap-0.5">
      {binding.bound !== undefined && (
        <span className="max-w-28 truncate text-xs" title={style?.name}>
          {style ? tokenLeafOf(style.name) : "Mixed"}
        </span>
      )}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <span>
            <PanelIconButton label="Text styles">
              <Grip />
            </PanelIconButton>
          </span>
        </PopoverTrigger>
        {picker}
      </Popover>
      {binding.bound !== undefined && (
        <PanelIconButton label="Detach style" onClick={() => binding.bind(null)}>
          <Unlink />
        </PanelIconButton>
      )}
    </div>
  );
}
