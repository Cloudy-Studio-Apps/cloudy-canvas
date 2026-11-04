import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  MenuItemContent,
} from "@shared/ui/kit";
import { pickedName } from "./picked-label";
import type { PickerName } from "./picker-names.types";
import type { FieldPickerProps } from "./field-picker.types";
import { t } from "../../data.i18n";

function byGroup(names: readonly PickerName[]): [string, PickerName[]][] {
  const groups = new Map<string, PickerName[]>();
  for (const name of names) groups.set(name.group, [...(groups.get(name.group) ?? []), name]);
  return [...groups];
}

/**
 * Picks a data field: the names in scope under their source, each by its alias with the first
 * row's value. Picking hands the expression as the scope wrote it.
 */
export function FieldPicker({ names, value, onPick, children }: FieldPickerProps) {
  const chosen = value === undefined ? undefined : pickedName(names, value)?.expr;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="max-h-80 w-64 overflow-y-auto">
        {names.length === 0 && (
          <DropdownMenuItem disabled className="text-xs">
            {t("section.fields.none")}
          </DropdownMenuItem>
        )}
        {byGroup(names).map(([group, items]) => (
          <div key={group}>
            <DropdownMenuLabel className="text-xs text-muted-foreground">{group}</DropdownMenuLabel>
            {items.map((name) => (
              <DropdownMenuItem
                key={name.expr}
                className="text-xs"
                title={name.expr}
                onSelect={() => onPick(name.expr)}
              >
                <MenuItemContent
                  checked={name.expr === chosen}
                  label={
                    <span className="flex min-w-0 items-baseline gap-2">
                      <span className="truncate">{name.label}</span>
                      {name.sample !== "" && (
                        <span className="ml-auto max-w-28 truncate text-muted-foreground">
                          {name.sample}
                        </span>
                      )}
                    </span>
                  }
                />
              </DropdownMenuItem>
            ))}
          </div>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
