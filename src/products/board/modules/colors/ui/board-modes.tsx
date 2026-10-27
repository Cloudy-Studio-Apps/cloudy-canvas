import { useDocumentTokens } from "@canvas-ui";
import { SegmentedControl } from "@shared/ui/kit";
import { t } from "../colors.i18n";

/** The mode the whole board shows, per axis with more than one mode (Light / Dark). */
export function BoardModes() {
  const { tokens, store } = useDocumentTokens();
  const axes = store.axes().filter((axis) => axis.modes.length > 1);
  if (axes.length === 0) return null;
  return (
    <div className="flex flex-col gap-2 border-b border-border pb-3">
      {axes.map((axis) => (
        <div key={axis.id} className="flex items-center gap-2">
          <span className="w-16 shrink-0 truncate text-xs text-muted-foreground">{axis.name}</span>
          <SegmentedControl
            label={t("panel.modeLabel", { axis: axis.name })}
            size="sm"
            fullWidth
            value={axis.current ?? axis.modes[0]?.id ?? null}
            options={axis.modes.map((mode) => ({ value: mode.id, label: mode.name }))}
            onChange={(mode) => tokens.setCurrentMode(axis.id, mode)}
          />
        </div>
      ))}
    </div>
  );
}
