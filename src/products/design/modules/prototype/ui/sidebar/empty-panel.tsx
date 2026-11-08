import { PanelSection } from "@design/ui/components/panel";
import { EmptyState, SegmentedControl } from "@shared/ui/kit";
import { t } from "../../prototype.i18n";
import { usePrototypeViewStore } from "../stores/prototype-view-store";
import type { PrototypeShowLinks } from "../stores/prototype-view-store.types";
import { InteractionRow } from "./interaction-row";

/** The panel with nothing selected: what to select, and which links the canvas shows. */
export function EmptyPanel() {
  const showLinks = usePrototypeViewStore((state) => state.showLinks);
  const setShowLinks = usePrototypeViewStore((state) => state.setShowLinks);
  return (
    <>
      <EmptyState title={t("sidebar.emptyTitle")} description={t("sidebar.empty")} />
      <PanelSection title={t("canvas.title")}>
        <InteractionRow label={t("canvas.showLinks")}>
          <SegmentedControl<PrototypeShowLinks>
            label={t("canvas.showLinks")}
            value={showLinks}
            options={[
              { value: "all", label: t("canvas.all") },
              { value: "selection", label: t("canvas.selection") },
            ]}
            fullWidth
            onChange={setShowLinks}
          />
        </InteractionRow>
      </PanelSection>
    </>
  );
}
