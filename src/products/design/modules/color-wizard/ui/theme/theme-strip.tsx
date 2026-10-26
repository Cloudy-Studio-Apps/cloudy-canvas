import { ColorPopover } from "@canvas-ui";
import { Button, SelectField } from "@shared/ui/kit";
import { candidatePasses, onColor, shadesOf, SPECIAL_COLORS, THEME_SPEC, themeColor } from "../..";
import {
  clearThemeChoice,
  defaultThemeValue,
  mirrorThemeChoice,
  setThemeChoice,
  useColorWizardStore,
  useWizardTheme,
} from "../store";
import { StripCell } from "./strip-cell";

/**
 * The selected token's choices in one strip: Automatic (the wizard's default), best contrast for
 * a `*-foreground`, white, the shades of a palette role, black, or any custom color.
 */
export function ThemeStrip() {
  const { theme, colors } = useWizardTheme();
  const { name, mode } = useColorWizardStore((s) => s.themeSelection);
  const custom = useColorWizardStore((s) => s.overrides[name]?.[mode] !== undefined);
  const value = theme.tokens.find((t) => t.name === name)?.values[mode];
  const spec = THEME_SPEC.find((s) => s.name === name);
  if (!value || !spec) return null;
  const automatic = defaultThemeValue(name, mode);
  const fromPalette = colors.some((c) => c.name === value.role);
  const automaticRole = colors.some((c) => c.name === automatic?.role)
    ? automatic?.role
    : undefined;
  const roleName = fromPalette ? value.role : (automaticRole ?? colors[0]?.name);
  const src = colors.find((c) => c.name === roleName);
  const passes = (hex: string) => candidatePasses(theme, name, mode, hex);
  const other = theme.modes.find((m) => m !== mode);
  const special = (key: "white" | "black") => (
    <StripCell
      hex={SPECIAL_COLORS[key]!}
      label={key === "white" ? "White" : "Black"}
      title={key === "white" ? "Plain white" : "Plain black"}
      selected={custom && value.role === key}
      passes={passes(SPECIAL_COLORS[key]!)}
      onPick={() => setThemeChoice(name, mode, { role: key })}
    />
  );
  const shown =
    value.role === "auto"
      ? "best contrast"
      : value.role === "custom"
        ? `custom ${value.hex}`
        : value.alias;
  return (
    <div className="flex flex-col gap-2.5 rounded-lg border border-border bg-surface p-3">
      <div className="flex flex-wrap items-center gap-2">
        <span
          className="size-6 rounded-md border border-border"
          style={{ background: value.hex }}
        />
        <span className="text-sm">
          <b>{name}</b>{" "}
          <span className="text-muted-foreground">
            in {mode} · {custom ? shown : `automatic (${shown})`}
          </span>
        </span>
        <span className="ml-auto text-xs text-muted-foreground">Shades of</span>
        <SelectField
          label="Which color's shades"
          value={roleName ?? ""}
          options={colors.map((c) => ({ value: c.name, label: c.name }))}
          onChange={(role) => setThemeChoice(name, mode, { role, stop: value.stop ?? 500 })}
          className="w-32"
        />
        {other && (
          <Button variant="outline" size="sm" onClick={() => mirrorThemeChoice(name, mode, other)}>
            Mirror to {other}
          </Button>
        )}
      </div>
      <div className="flex overflow-hidden rounded-lg border border-border-strong max-md:flex-wrap">
        {automatic && (
          <StripCell
            wide
            hex={automatic.hex}
            label="Automatic"
            title={`The wizard's choice: ${automatic.alias}`}
            selected={!custom}
            passes={passes(automatic.hex)}
            onPick={() => clearThemeChoice(name, mode)}
          />
        )}
        {spec.on && (
          <StripCell
            hex={onColor(themeColor(theme, spec.on, mode) ?? SPECIAL_COLORS.white!)}
            label="Contrast"
            title={`White or black, whichever reads better on ${spec.on}`}
            selected={custom && value.role === "auto"}
            passes={null}
            onPick={() => setThemeChoice(name, mode, { role: "auto" })}
          />
        )}
        {special("white")}
        {src &&
          shadesOf(src.hex).map((s) => (
            <StripCell
              key={s.stop}
              hex={s.hex}
              label={String(s.stop)}
              title={`${src.name}/${s.stop} ${s.hex}`}
              selected={custom && value.role === src.name && value.stop === s.stop}
              passes={passes(s.hex)}
              onPick={() => setThemeChoice(name, mode, { role: src.name, stop: s.stop })}
            />
          ))}
        {special("black")}
        <ColorPopover
          color={value.hex.toLowerCase()}
          label={`${name} in ${mode}`}
          onChange={(next, info) =>
            info.done &&
            setThemeChoice(name, mode, { role: "custom", hex: next.color.toUpperCase() })
          }
          trigger={
            <StripCell
              hex={value.role === "custom" ? value.hex : SPECIAL_COLORS.white!}
              label="Custom"
              title="Any color"
              selected={custom && value.role === "custom"}
              passes={value.role === "custom" ? passes(value.hex) : null}
              onPick={() => undefined}
            />
          }
        />
      </div>
    </div>
  );
}
