import type { ElementPatch } from "@canvas";
import { clearRunFields } from "@canvas";
import {
  rangeStyleValue,
  unstyledRangePatch,
  retypeset,
  textStyleValue,
  type DesignNode,
  type TextNodeElement,
  type TextNodeRun,
} from "@design";
import { useDesignEngine, useDesignState } from "@design/ui/design-engine-context";
import { useEditNodes } from "@design/ui/hooks";
import type { TypographyTarget } from "./typography-target.types";

/**
 * The Typography section's target: the selected characters while one selected text is being
 * edited (each change one step of the editor's own undo), otherwise the selected texts, all of
 * each (one undo step; the field is cleared from their ranges, and new texts take it).
 */
export function useTypographyTarget(texts: readonly TextNodeElement[]): TypographyTarget {
  const engine = useDesignEngine();
  const edit = useEditNodes();
  // Re-read whenever the edited text's selection, text or ranges change.
  useDesignState((state) => state.textSelection);
  const editing = engine.editingText();
  const edited = texts.length === 1 && editing?.id === texts[0]?.id ? texts[0] : undefined;

  if (edited && editing) {
    const runs = editing.runs as readonly TextNodeRun[];
    const current = { ...edited, text: editing.text, runs: [...runs] };
    return {
      range: true,
      read: (field) => rangeStyleValue(current, runs, editing.start, editing.end, field),
      set: (patch) => engine.styleTextRange(unstyledRangePatch(patch)),
    };
  }

  return {
    range: false,
    read: (field) => {
      const first = texts[0];
      if (!first) return null;
      const value = textStyleValue(first, field);
      return texts.every((text) => same(textStyleValue(text, field), value)) ? value : null;
    },
    set: (patch) => {
      edit(texts, (node: DesignNode) => {
        const text = node as TextNodeElement;
        // The whole text's typography also unlinks its ranges' text styles.
        const fields = Object.keys(unstyledRangePatch(patch));
        const runs = clearRunFields(text.runs, fields, text.text.length);
        const next = { ...text, ...patch };
        engine.setToolOptions({
          textTypography: {
            fontFamily: next.fontFamily,
            fontSize: next.fontSize,
            fontWeight: next.fontWeight,
            fontStyle: next.fontStyle,
            lineHeight: next.lineHeight,
            letterSpacing: next.letterSpacing,
          },
        });
        return retypeset(text, { ...patch, runs }) as ElementPatch<DesignNode>;
      });
    },
  };
}

function same(a: unknown, b: unknown): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}
