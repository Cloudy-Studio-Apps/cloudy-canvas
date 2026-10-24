import { DOCUMENT_TOKENS } from "@canvas";
import { runStylePatch, TEXT_STYLE_PATH, type TextNodeElement } from "@design";
import type { StyleBinding } from "@design/ui/components/styles";
import { useNodeStyleBinding } from "@design/ui/components/styles";
import { useDesignEngine } from "@design/ui/design-engine-context";
import { useTypographyTarget } from "../use-typography-target";

/**
 * The text style of the Typography section's target: the selected characters' while a text is
 * being edited (a range's style), otherwise the selected texts' own.
 */
export function useTextStyleBinding(texts: readonly TextNodeElement[]): StyleBinding {
  const engine = useDesignEngine();
  const target = useTypographyTarget(texts);
  const whole = useNodeStyleBinding(texts, TEXT_STYLE_PATH);
  if (!target.range) return whole;
  const own = target.read("textStyle");
  return {
    bound: own === null ? null : own || undefined,
    bind: (styleId) => {
      const style = styleId ? engine.service(DOCUMENT_TOKENS).store().style(styleId) : undefined;
      engine.styleTextRange(
        style ? runStylePatch(style.id, style.value) : { textStyle: undefined },
      );
    },
  };
}
