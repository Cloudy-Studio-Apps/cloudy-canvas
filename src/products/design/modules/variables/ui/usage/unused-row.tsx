import { TokenSwatch } from "@canvas-ui";
import { Checkbox, ListRow } from "@shared/ui/kit";
import { typeGlyph } from "../window/group-kinds";
import type { UnusedRowProps } from "./usage-ui.types";
import { t } from "../../variables.i18n";

/** An unused variable or style: a box to pick it, its swatch or glyph, its name and where it is. */
export function UnusedRow({ record, where, color, checked, onCheckedChange }: UnusedRowProps) {
  const icon =
    record.kind === "style" ? (
      <span className="w-4 text-center text-xs text-muted-foreground">S</span>
    ) : color ? (
      <TokenSwatch color={color} />
    ) : (
      <span className="w-4 text-center text-xs text-muted-foreground">{typeGlyph(record)}</span>
    );
  return (
    <ListRow
      icon={
        <span className="flex items-center gap-2">
          <Checkbox
            checked={checked}
            onCheckedChange={onCheckedChange}
            aria-label={t("unused.pick", { name: record.name })}
          />
          {icon}
        </span>
      }
      label={record.name}
      meta={where}
      onSelect={() => onCheckedChange(!checked)}
    />
  );
}
