import { Strikethrough, Underline } from "lucide-react";

import { PanelIconButton } from "@design/ui/components/panel";
import type { TypographyControlProps } from "./typography-controls.types";
import { t } from "../text.i18n";

/** Underline and strikethrough toggles for the typography target. */
export function DecorationButtons({ target }: TypographyControlProps) {
  const decoration = target.read("textDecoration");
  const toggle = (value: "underline" | "strikethrough") =>
    target.set({ textDecoration: decoration === value ? "none" : value });
  return (
    <div
      role="group"
      aria-label={t("typography.decoration")}
      className="flex rounded-sm bg-muted p-0.5"
    >
      <PanelIconButton
        label={t("typography.underline")}
        active={decoration === "underline"}
        onClick={() => toggle("underline")}
      >
        <Underline />
      </PanelIconButton>
      <PanelIconButton
        label={t("typography.strikethrough")}
        active={decoration === "strikethrough"}
        onClick={() => toggle("strikethrough")}
      >
        <Strikethrough />
      </PanelIconButton>
    </div>
  );
}
