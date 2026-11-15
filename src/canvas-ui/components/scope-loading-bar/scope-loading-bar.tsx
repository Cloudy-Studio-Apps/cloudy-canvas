import { useEngineState } from "../../engine-context";
import { t } from "../components.i18n";

/**
 * A thin bar along the canvas's top edge while a large page's layers are built (they fade in
 * meanwhile, `EngineState.scopeLoading`); nothing otherwise. Place it over the canvas.
 */
export function ScopeLoadingBar() {
  const share = useEngineState((state) => state.scopeLoading);
  if (share === null) return null;
  return (
    <div
      role="progressbar"
      aria-label={t("loading.page")}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(share * 100)}
      className="pointer-events-none absolute inset-x-0 top-0 z-20 h-0.5 overflow-hidden bg-primary/15"
    >
      <div
        className="h-full bg-primary transition-[width] duration-150 ease-out"
        style={{ width: `${Math.max(share, 0.08) * 100}%` }}
      />
    </div>
  );
}
