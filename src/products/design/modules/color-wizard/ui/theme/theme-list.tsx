import { THEME_SPEC } from "../..";
import { useWizardTheme } from "../store";
import { ThemeListCell } from "./theme-list-cell";

/** Every token per mode, grouped, with what it's for. */
export function ThemeList() {
  const { theme } = useWizardTheme();
  const columns = { gridTemplateColumns: `210px repeat(${theme.modes.length}, minmax(0, 1fr))` };
  return (
    <div className="flex flex-col">
      <div className="grid gap-2 border-b border-border pb-1.5" style={columns}>
        <span />
        {theme.modes.map((m) => (
          <span
            key={m}
            className="text-[11px] font-semibold tracking-wide text-muted-foreground uppercase"
          >
            {m}
          </span>
        ))}
      </div>
      {theme.tokens.map((token, i) => {
        const heading = token.group !== theme.tokens[i - 1]?.group;
        return (
          <div key={token.name}>
            {heading && (
              <div className="mt-3 mb-0.5 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
                {token.group}
              </div>
            )}
            <div className="grid items-center gap-2 py-1" style={columns}>
              <span className="text-xs">
                <b>{token.name}</b>
                <br />
                <span className="text-muted-foreground">
                  {THEME_SPEC.find((s) => s.name === token.name)?.description}
                </span>
              </span>
              {theme.modes.map((m) => (
                <ThemeListCell key={m} name={token.name} mode={m} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
