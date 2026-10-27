import { Badge, Swatch } from "@shared/ui/kit";
import type { AddedRowProps } from "./roles.types";
import { ShadeStrip } from "./shade-strip";
import { useColorWizardStore } from "../store";
import { t } from "../../color-wizard.i18n";

/** A color an option adds (the neutral, a status color). */
export function AddedRow({ color, exists }: AddedRowProps) {
  const shades = useColorWizardStore((s) => s.options.shades);
  return (
    <div className="grid grid-cols-[20px_32px_170px_minmax(0,1fr)] items-center gap-2.5 border-b border-border py-2.5">
      <span />
      <Swatch color={color.hex} className="size-8 rounded-md" />
      <span className="flex items-center gap-1.5 text-xs">
        <b>{color.name}</b>
        <span className="text-muted-foreground">{t("roles.addedTag")}</span>
        {exists && (
          <Badge variant="outline" className="text-warning">
            {t("roles.updatesTag")}
          </Badge>
        )}
      </span>
      <ShadeStrip hex={color.hex} group={color.name} shades={shades} />
    </div>
  );
}
