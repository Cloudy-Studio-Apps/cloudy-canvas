import { PanelSection } from "@design/ui/components/panel";
import { useBrochure } from "../hooks/use-brochure";
import { useBrochureRepeat } from "../hooks/use-brochure-repeat";
import { BrochureRepeatSettings } from "./brochure-repeat-settings";
import { BrochureRepeatStart } from "./brochure-repeat-start";
import type { BrochureRepeatSectionProps } from "./brochure-repeat-section.types";
import { t } from "../../catalog.i18n";

/**
 * A brochure section's ("{name}: Repeat for each row") or page's ("Repeat this page") repeat: a
 * button that asks for a list in scope while it doesn't repeat, else its settings.
 */
export function BrochureRepeatSection({ target }: BrochureRepeatSectionProps) {
  const { brochure } = useBrochure();
  const state = useBrochureRepeat(target);
  const section =
    "section" in target
      ? brochure?.record()?.sections.find((item) => item.id === target.section)
      : undefined;
  const title = section ? t("repeat.sectionTitle", { name: section.name }) : t("repeat.pageTitle");
  return (
    <PanelSection title={title}>
      {state.repeat ? (
        <BrochureRepeatSettings state={state} repeat={state.repeat} />
      ) : (
        <BrochureRepeatStart state={state} />
      )}
    </PanelSection>
  );
}
