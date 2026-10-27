import { Check } from "lucide-react";

import { cn } from "@shared/ui/kit";
import type { TypeOptionListProps } from "./type-option-list.types";
import { t } from "../../db.i18n";

export function TypeOptionList({ options, current, onPick }: TypeOptionListProps) {
  if (options.length === 0) {
    return <p className="px-2 py-1.5 text-sm text-muted-foreground">Nothing matches</p>;
  }
  return (
    <ul className="max-h-56 overflow-y-auto" role="listbox" aria-label={t("panel.columnTypes")}>
      {options.map((option) => (
        <li key={`${option.kind}:${option.name}`}>
          {/* eslint-disable-next-line no-restricted-syntax -- bespoke: a column type with its args */}
          <button
            type="button"
            role="option"
            aria-selected={option.name === current}
            className={cn(
              "flex w-full cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm outline-none hover:bg-hover focus-visible:bg-hover",
            )}
            onClick={() => onPick(option.name)}
          >
            <Check className={cn("size-3.5 shrink-0", option.name !== current && "invisible")} />
            <span className="min-w-0 flex-1 truncate font-mono text-xs">{option.name}</span>
            {option.kind === "enum" && (
              <span className="text-[11px] font-semibold text-muted-foreground">ENUM</span>
            )}
            {option.detail && (
              <span className="text-xs text-muted-foreground">{option.detail}</span>
            )}
          </button>
        </li>
      ))}
    </ul>
  );
}
