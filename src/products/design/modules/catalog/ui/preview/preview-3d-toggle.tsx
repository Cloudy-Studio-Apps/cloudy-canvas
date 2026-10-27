import { cn, Switch } from "@shared/ui/kit";
import { useCatalogViewStore } from "../stores/catalog-view-store";
import type { Preview3dToggleProps } from "./preview.types";
import { t } from "../../catalog.i18n";

/** Turns the preview's 3D booklet on (the default) or off (the pages flat), remembered. */
export function Preview3dToggle({ className }: Preview3dToggleProps) {
  const on = useCatalogViewStore((state) => state.preview3d);
  const set = useCatalogViewStore((state) => state.setPreview3d);
  return (
    <label className={cn("flex cursor-pointer items-center gap-2 text-sm text-surface", className)}>
      <Switch checked={on} onCheckedChange={set} aria-label={t("preview.toggle3d")} />
      {t("preview.view3d")}
    </label>
  );
}
