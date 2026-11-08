import { useDocumentTokens } from "@canvas-ui";
import { SegmentedControl } from "@shared/ui/kit";
import { t } from "../colors.i18n";

/** The mode the whole board shows, per axis with more than one mode that a color varies by (Light / Dark). */
export function BoardModes() {
  const { tokens, store } = useDocumentTokens();
  // Only axes some color varies by: a library's other records may use axes of their own.
  const colorAxes = new Set(
    store
      .collections()
      .flatMap((collection) => store.variables(collection.id))
      .filter((variable) => variable.type === "color")
      .map((variable) => variable.axisId),
  );
  const axes = store.axes().filter((axis) => axis.modes.length > 1 && colorAxes.has(axis.id));
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
