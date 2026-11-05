import { documentScopes, layeredScope } from "../../../data";
import { runRepeat, useDataSources } from "../../../data/ui";
import { useDesignEngine } from "@design/ui/design-engine-context";
import { loopsAround, type RepeatTarget } from "../../model/repeats";
import { useBrochure } from "./use-brochure";
import type { BrochureRepeatState } from "./use-brochure-repeat.types";

/**
 * The open brochure's section or page repeat (`target`): its repeat, the scope its list is read
 * in (the sources, then the loops around it at their preview rows, `loopsAround`) and a setter
 * that reports a refusal. Read again when the document or a source changes.
 */
export function useBrochureRepeat(target: RepeatTarget): BrochureRepeatState {
  // Rows come from the sources: follow their Updates.
  useDataSources();
  const engine = useDesignEngine();
  const { brochure } = useBrochure();
  const record = brochure?.record();
  const item =
    "section" in target
      ? record?.sections.find((section) => section.id === target.section)
      : record?.slots.find((slot) => slot.id === target.slot);
  const root = documentScopes(engine.doc).root;
  const scope =
    brochure && record
      ? layeredScope(root, loopsAround(record, brochure.expansion(), target))
      : root;
  return {
    target,
    repeat: item?.repeat ?? null,
    scope,
    apply: (patch) => {
      if (brochure) runRepeat(() => brochure.setRepeat(target, patch));
    },
  };
}
