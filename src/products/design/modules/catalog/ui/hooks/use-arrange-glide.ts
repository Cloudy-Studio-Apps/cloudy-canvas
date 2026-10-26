import { useEffect } from "react";

import { useService } from "@canvas-ui";
import { DESIGN_BROCHURES } from "../../model/design-brochures";
import { useDesignEngine } from "@design/ui/design-engine-context";

/** Has the frames and layers a brochure's arrange moves glide to their new place. */
export function useArrangeGlide(): void {
  const engine = useDesignEngine();
  const brochures = useService(DESIGN_BROCHURES);
  useEffect(() => brochures.onArranged((moved) => engine.animateMoves(moved)), [brochures, engine]);
}
