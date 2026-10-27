import { Eye, List } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { Button, CheckboxField, SegmentedControl, type SegmentedOption } from "@shared/ui/kit";
import type { ModeSet } from "../..";
import { useColorWizardStore, useWizardTheme } from "../store";
import { ThemeList } from "./theme-list";
import { ThemePane } from "./theme-pane";
import { ThemePartsContext } from "./theme-parts-context";
import { ThemeStrip } from "./theme-strip";
import type { ThemeHover } from "./theme.types";
import { t } from "../../color-wizard.i18n";

const MODES: readonly SegmentedOption<ModeSet>[] = [
  { value: "both", label: t("theme.lightDark") },
  { value: "light", label: t("theme.lightOnly") },
  { value: "dark", label: t("theme.darkOnly") },
];
const VIEWS = [
  { value: "visual", label: t("theme.visual"), icon: <Eye /> },
  { value: "list", label: t("theme.list"), icon: <List /> },
] as const;

/** Step 3: the Theme, edited on live previews (Visual) or token by token (List). */
export function ThemeStep() {
  const { theme } = useWizardTheme();
  const view = useColorWizardStore((s) => s.themeView);
  const options = useColorWizardStore((s) => s.options);
  const changed = useColorWizardStore((s) =>
    Object.values(s.overrides).reduce((n, modes) => n + Object.keys(modes).length, 0),
  );
  const selection = useColorWizardStore((s) => s.themeSelection);
  const set = useColorWizardStore((s) => s.set);
  const [hover, setHover] = useState<ThemeHover | null>(null);
  const context = useMemo(() => ({ theme, hover, setHover }), [theme, hover]);
  const hasToken = theme.tokens.some((t) => t.name === selection.name);
  const hasMode = theme.modes.includes(selection.mode);
  // A selection outside the shown modes or tokens moves to one that is.
  useEffect(() => {
    if (hasToken && hasMode) return;
    const { themeSelection } = useColorWizardStore.getState();
    set({
      themeSelection: {
        name: hasToken ? themeSelection.name : "surface",
        mode: hasMode ? themeSelection.mode : (theme.modes[0] ?? "Light"),
      },
    });
  }, [hasToken, hasMode, theme.modes, set]);
  return (
    <div className="flex h-full flex-col gap-3 overflow-auto px-4 py-3.5">
      <div className="flex flex-wrap items-center gap-2.5">
        <SegmentedControl
          label={t("theme.view")}
          size="sm"
          value={view}
          options={VIEWS}
          onChange={(themeView) => set({ themeView })}
        />
        <span className="text-xs text-muted-foreground">
          {view === "visual" ? t("theme.visualHint") : t("theme.listHint")}
        </span>
        <div className="ml-auto" />
        {changed > 0 && (
          <Button variant="ghost" size="sm" onClick={() => set({ overrides: {} })}>
            {t("theme.resetAll", { count: changed })}
          </Button>
        )}
        <CheckboxField
          label={t("theme.createTheme")}
          checked={options.theme}
          onChange={(checked) => set({ options: { ...options, theme: checked } })}
        />
        <SegmentedControl
          label={t("theme.modes")}
          size="sm"
          value={options.modes}
          options={MODES}
          onChange={(modes) => set({ options: { ...options, modes } })}
        />
      </div>
      {!options.theme && (
        <p className="rounded-lg border border-border bg-surface-sunken p-2.5 text-xs text-muted-foreground">
          {t("theme.collectionOff")}
        </p>
      )}
      <ThemePartsContext.Provider value={context}>
        {view === "visual" ? (
          <>
            <div
              className="grid gap-3.5"
              style={{ gridTemplateColumns: `repeat(${theme.modes.length}, minmax(0, 1fr))` }}
            >
              {theme.modes.map((m) => (
                <ThemePane key={m} mode={m} />
              ))}
            </div>
            <ThemeStrip />
          </>
        ) : (
          <>
            <div className="sticky -top-3.5 z-30 shadow-popover">
              <ThemeStrip />
            </div>
            <ThemeList />
          </>
        )}
      </ThemePartsContext.Provider>
    </div>
  );
}
