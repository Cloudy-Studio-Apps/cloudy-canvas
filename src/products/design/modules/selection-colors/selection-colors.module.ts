import { defineModule } from "@shared/core";
import { designEditor } from "@design/ui/modules/design-editor-points";
import { hasSelectionColors } from "./ui/has-selection-colors";
import { SelectionColorsSection } from "./ui/selection-colors-section";
import * as selectionColorsApi from ".";
import * as selectionColorsUi from "./ui";

/**
 * Selection colors: a properties panel section listing every color the selection and what it
 * holds use, each changed everywhere at once.
 */
export const selectionColorsModule = defineModule({
  id: "selection-colors",
  tier: "feature",
  requires: ["core", "text"],
  exports: { ...selectionColorsApi, ...selectionColorsUi },
  register(host) {
    host.contribute(designEditor.propertySections, {
      id: "selection-colors",
      order: 75,
      when: hasSelectionColors,
      component: SelectionColorsSection,
    });
  },
});
