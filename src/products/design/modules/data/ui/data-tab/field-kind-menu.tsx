import { useRef } from "react";
import { Pencil } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@shared/ui/kit";
import type { FieldType, ListShow } from "../../source";
import { t } from "../../data.i18n";
import type { FieldKindMenuProps } from "./field-kind-menu.types";
import { fieldTypeOptions } from "./field-type-label";
import { FieldTypeIcon } from "./field-type-icon";

const SHOWS: readonly ListShow[] = ["all", "first", "count"];

/**
 * A field's kind as a menu of icons; a list also says how its items show in a text (all, the
 * first, how many), and Rename gives it a name of its own.
 */
export function FieldKindMenu({ field, children, onChange, onRename }: FieldKindMenuProps) {
  // Renaming focuses the name field: the menu mustn't give the focus back to its button.
  const renaming = useRef(false);
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="w-56"
        onCloseAutoFocus={(event) => {
          if (renaming.current) event.preventDefault();
          renaming.current = false;
        }}
      >
        <DropdownMenuLabel>{t("fields.kindMenu.showAs")}</DropdownMenuLabel>
        <DropdownMenuRadioGroup
          value={field.type}
          onValueChange={(type) => onChange({ ...field, type: type as FieldType })}
        >
          {fieldTypeOptions().map((option) => (
            <DropdownMenuRadioItem key={option.value} value={option.value}>
              <FieldTypeIcon type={option.value} className="size-3.5 text-muted-foreground" />
              {option.label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
        {field.type === "list" && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>{t("fields.kindMenu.listShow")}</DropdownMenuLabel>
            <DropdownMenuRadioGroup
              value={field.format?.list ?? "all"}
              onValueChange={(list) =>
                onChange({ ...field, format: { ...field.format, list: list as ListShow } })
              }
            >
              {SHOWS.map((show) => (
                <DropdownMenuRadioItem key={show} value={show}>
                  {t(`fields.kindMenu.list.${show}`)}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={() => {
            renaming.current = true;
            onRename();
          }}
        >
          <Pencil />
          {t("fields.kindMenu.rename")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
