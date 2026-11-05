import { Repeat } from "lucide-react";

import { Button } from "@shared/ui/kit";
import { FieldPicker, listNames } from "../../../data/ui";
import type { BrochureRepeatStartProps } from "./brochure-repeat-section.types";
import { t } from "../../catalog.i18n";

/** A section or page that doesn't repeat: the button asks for a list in scope, then repeats it. */
export function BrochureRepeatStart({ state }: BrochureRepeatStartProps) {
  const lists = listNames(state.scope);
  const section = "section" in state.target;
  const hint = section
    ? t("repeat.sectionHint", { token: "{product.name}" })
    : t("repeat.pageHint");
  return (
    <div className="flex flex-col gap-1.5">
      <FieldPicker names={lists} onPick={(source) => state.apply({ source })}>
        <Button variant="secondary" size="sm" className="w-full" disabled={lists.length === 0}>
          <Repeat />
          {section ? t("repeat.startSection") : t("repeat.startPage")}
        </Button>
      </FieldPicker>
      <p className="text-xs text-muted-foreground">
        {lists.length === 0 ? t("repeat.noLists") : hint}
      </p>
    </div>
  );
}
