import { TEXT_STYLE } from "../../text-style";
import { StyleControl } from "../../../core/ui";
import { useDesignEngine } from "@design/ui/design-engine-context";
import { createTextStyle } from "./create-text-style";
import type { TextStyleControlProps } from "./text-styles.types";
import { useTextStyleBinding } from "./use-text-style-binding";

/**
 * The Typography section's style button (Figma's): a text style for the selected texts, or for
 * the selected characters while one is being edited; or their typography saved as a new style.
 */
export function TextStyleControl({ texts }: TextStyleControlProps) {
  const engine = useDesignEngine();
  return (
    <StyleControl
      binding={useTextStyleBinding(texts)}
      styleType={TEXT_STYLE}
      createLabel="Create style from this text"
      create={() => createTextStyle(engine)}
      showName
    />
  );
}
