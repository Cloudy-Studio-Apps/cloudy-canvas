import { Grip, Plus, Unlink } from "lucide-react";
import { useState } from "react";

import { tokenLeafOf } from "@canvas";
import { useDocumentTokens } from "@canvas-ui";
import { PanelIconButton } from "@design/ui/components/panel";
import { ListRow, Popover, PopoverContent, PopoverTrigger, Separator } from "@shared/ui/kit";
import { StyleList } from "./style-list";
import type { StyleControlProps } from "./styles.types";
import { t } from "../../core.i18n";

/**
 * A section header's style button (Figma's): pick a style of its type for the selection, or save
 * what it shows as a new one. While a style is applied, Detach unlinks it (keeping the look).
 */
export function StyleControl({
  binding,
  styleType,
  createLabel,
  create,
  showName,
  label = t("styles.styles"),
}: StyleControlProps) {
  const { store } = useDocumentTokens();
  const [open, setOpen] = useState(false);
  const style = binding.bound ? store.style(binding.bound) : undefined;

  return (
    <div className="flex items-center gap-0.5">
      {showName && binding.bound !== undefined && (
        <span className="max-w-28 truncate text-xs" title={style?.name}>
          {style ? tokenLeafOf(style.name) : "Mixed"}
        </span>
      )}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <span>
            <PanelIconButton label={label}>
              <Grip />
            </PanelIconButton>
          </span>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-64 p-1">
          <StyleList
            styleType={styleType}
            current={binding.bound ?? null}
            onPick={(id) => {
              binding.bind(id);
              setOpen(false);
            }}
          />
          <Separator className="my-1" />
          <ListRow
            size="md"
            icon={<Plus />}
            label={createLabel}
            onSelect={() => {
              const id = create();
              if (id) binding.bind(id);
              setOpen(false);
            }}
          />
        </PopoverContent>
      </Popover>
      {binding.bound !== undefined && (
        <PanelIconButton label={t("styles.detach")} onClick={() => binding.bind(null)}>
          <Unlink />
        </PanelIconButton>
      )}
    </div>
  );
}
