import { Badge, cn } from "@shared/ui/kit";
import { contrastResults, onColor } from "../..";
import { useColorWizardStore, useWizardTheme } from "../store";
import type { ThemeListCellProps } from "./theme.types";
import { t } from "../../color-wizard.i18n";

/** A token in one mode: an "Aa" on its color, what it uses, and whether it's automatic. */
export function ThemeListCell({ name, mode }: ThemeListCellProps) {
  const { theme } = useWizardTheme();
  const selected = useColorWizardStore(
    (s) => s.themeSelection.name === name && s.themeSelection.mode === mode,
  );
  const custom = useColorWizardStore((s) => s.overrides[name]?.[mode] !== undefined);
  const set = useColorWizardStore((s) => s.set);
  const value = theme.tokens.find((t) => t.name === name)?.values[mode];
  if (!value) return null;
  const low = contrastResults(theme).find(
    (r) => r.mode === mode && !r.pass && (r.fg === name || r.fix === name),
  );
  const kind = value.role === "custom" ? "custom" : custom ? "changed" : "auto";
  const tag = t(
    kind === "custom"
      ? "theme.cell.custom"
      : kind === "changed"
        ? "theme.cell.changed"
        : "theme.cell.auto",
  );
  const shown =
    value.role === "auto"
      ? t("theme.strip.bestContrast")
      : value.role === "custom"
        ? t("theme.cell.customShort")
        : value.alias;
  return (
    // eslint-disable-next-line no-restricted-syntax -- bespoke: a list cell showing the token's color
    <button
      type="button"
      aria-pressed={selected}
      onClick={() => set({ themeSelection: { name, mode } })}
      className={cn(
        "flex min-w-0 cursor-pointer items-center gap-2 rounded-lg border border-border bg-surface py-1 pr-2 pl-1 text-left hover:bg-hover",
        selected && "border-ring ring-1 ring-ring",
      )}
    >
      <span
        className="grid h-8 w-10 shrink-0 place-items-center rounded-md border border-border font-bold"
        style={{ background: value.hex, color: onColor(value.hex) }}
      >
        Aa
      </span>
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="truncate font-mono text-xs">{shown}</span>
        <span className="text-xs text-muted-foreground">{value.hex}</span>
      </span>
      {low && (
        <Badge variant="outline" className="text-destructive" title={low.label}>
          {low.ratio.toFixed(1)}
        </Badge>
      )}
      <Badge
        variant="outline"
        className={kind === "auto" ? "text-muted-foreground" : "text-warning"}
      >
        {tag}
      </Badge>
    </button>
  );
}
