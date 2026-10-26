import { onColor, themeColor } from "../..";
import { ThemePart as P } from "./theme-part";
import { useThemeParts } from "./theme-parts-context";
import type { ThemePaneProps } from "./theme.types";

const STATUS = ["success", "warning", "error", "info"] as const;

/** A small page in one mode, every part drawn with (and tagged by) its token. */
export function ThemePane({ mode }: ThemePaneProps) {
  const { theme } = useThemeParts();
  const t = (name: string) =>
    themeColor(theme, name, mode) ?? themeColor(theme, "primary", mode) ?? "transparent";
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <span className="text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
        {mode}
      </span>
      <P
        name="background"
        mode={mode}
        className="flex flex-col gap-3 rounded-lg border border-border p-4.5"
        style={{ background: t("background"), color: t("foreground") }}
      >
        <P
          name="foreground"
          mode={mode}
          className="text-lg font-bold"
          style={{ color: t("foreground") }}
        >
          Good morning, Ada
        </P>
        <P
          name="surface"
          mode={mode}
          className="flex flex-col gap-2.5 rounded-lg p-3.5"
          style={{ background: t("surface"), border: `1px solid ${t("border")}` }}
        >
          <P
            name="foreground"
            mode={mode}
            className="text-[15px] font-bold"
            style={{ color: t("foreground") }}
          >
            Weekly report
          </P>
          <P
            name="muted-foreground"
            mode={mode}
            className="text-xs"
            style={{ color: t("muted-foreground") }}
          >
            Your team shipped 12 changes.
          </P>
          <P
            name="border"
            mode={mode}
            className="flex h-7.5 items-center rounded-md px-2 text-xs"
            style={{ border: `1.5px solid ${t("border")}`, color: t("muted-foreground") }}
          >
            Search…
          </P>
          <div className="flex flex-wrap items-center gap-2">
            <P
              name="primary"
              mode={mode}
              as="span"
              className="inline-flex rounded-md px-3 py-1.5"
              style={{ background: t("primary") }}
            >
              <P
                name="primary-foreground"
                mode={mode}
                as="span"
                className="text-xs font-semibold"
                style={{ color: t("primary-foreground") }}
              >
                Open
              </P>
            </P>
            <P
              name="primary-soft"
              mode={mode}
              as="span"
              className="inline-flex rounded-md px-3 py-1.5 text-xs font-semibold"
              style={{ background: t("primary-soft"), color: t("primary") }}
            >
              Later
            </P>
            <P
              name="accent"
              mode={mode}
              as="span"
              className="rounded-md px-2 py-0.5 text-[11px] font-bold"
              style={{ background: t("accent"), color: onColor(t("accent")) }}
            >
              New
            </P>
            <P
              name="primary"
              mode={mode}
              as="span"
              className="text-xs underline"
              style={{ color: t("primary") }}
            >
              View all
            </P>
          </div>
          <div className="flex flex-wrap gap-3">
            {STATUS.map((s) => (
              <P
                key={s}
                name={s}
                mode={mode}
                as="span"
                className="inline-flex items-center gap-1 text-xs font-semibold"
                style={{ color: t(s) }}
              >
                <span className="size-2 rounded-full bg-current" />
                {s}
              </P>
            ))}
          </div>
        </P>
      </P>
    </div>
  );
}
