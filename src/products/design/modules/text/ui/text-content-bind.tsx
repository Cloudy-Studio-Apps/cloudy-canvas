import { Type } from "lucide-react";

import { BindSlot } from "@design/ui/components/panel";
import type { TextContentBindProps } from "./text-content-bind.types";
import { t } from "../text.i18n";

/**
 * The selected texts' content as a field a text variable can drive (a label, a translation by a
 * "Language" mode): hover to bind it; bound, the variable's chip shows. Typing in the text unlinks
 * it, keeping what was typed.
 */
export function TextContentBind({ texts }: TextContentBindProps) {
  return (
    <BindSlot nodes={texts} path="text">
      <span className="flex h-6 items-center gap-1.5 px-1 text-xs text-muted-foreground">
        <Type className="size-3.5" /> {t("bind.textContent")}
      </span>
    </BindSlot>
  );
}
