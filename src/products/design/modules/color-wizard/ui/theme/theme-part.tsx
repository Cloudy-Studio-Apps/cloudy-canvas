import { useId } from "react";

import { cn } from "@shared/ui/kit";
import { useColorWizardStore } from "../store";
import { useThemeParts } from "./theme-parts-context";
import type { ThemePartProps } from "./theme.types";
import { t } from "../../color-wizard.i18n";

/**
 * A part of a preview drawn with a token: hovering outlines every part using it (and names it
 * above this one), clicking picks it for the strip below.
 */
export function ThemePart({
  name,
  mode,
  as: Tag = "div",
  style,
  className,
  children,
}: ThemePartProps) {
  const part = useId();
  const { theme, hover, setHover } = useThemeParts();
  const selected = useColorWizardStore(
    (s) => s.themeSelection.name === name && s.themeSelection.mode === mode,
  );
  const set = useColorWizardStore((s) => s.set);
  const value = theme.tokens.find((t) => t.name === name)?.values[mode];
  if (!value) return null;
  const lit = hover?.name === name && hover.mode === mode;
  const label = `${name} · ${value.role === "auto" ? t("theme.strip.bestContrast") : value.role === "custom" ? t("theme.strip.customHex", { hex: value.hex }) : value.alias}`;
  return (
    <Tag
      role="button"
      tabIndex={0}
      aria-label={label}
      aria-pressed={selected}
      className={cn(
        "relative cursor-pointer outline-offset-2",
        lit && "outline-2 outline-ring outline-dashed",
        selected && "outline-2 outline-ring outline-solid",
        className,
      )}
      style={style}
      onClick={(event) => {
        event.stopPropagation();
        set({ themeSelection: { name, mode } });
      }}
      onKeyDown={(event) => {
        if (event.key !== "Enter" && event.key !== " ") return;
        event.preventDefault();
        event.stopPropagation();
        set({ themeSelection: { name, mode } });
      }}
      onPointerOver={(event) => {
        event.stopPropagation();
        setHover({ name, mode, part });
      }}
      onPointerLeave={() => setHover(null)}
    >
      {children}
      {lit && hover.part === part && (
        <span className="pointer-events-none absolute bottom-full left-0 z-20 mb-1.5 rounded-sm bg-foreground px-1.5 py-1 font-mono text-[11px] leading-none font-semibold whitespace-nowrap text-background">
          {label}
        </span>
      )}
    </Tag>
  );
}
