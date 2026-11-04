import { useService } from "@canvas-ui";
import type { DesignNode } from "../../../core";
import { DESIGN_BROCHURES } from "../../model/design-brochures";
import { pageItemTag } from "../../model/page-items/page-item-fields";

/** The master a layer is a copy of (its name, the brochure's and the master layer's id), or `null`. */
export function useMasterOf(
  node: DesignNode | undefined,
): { master: string; brochure: string; source: string } | null {
  const brochures = useService(DESIGN_BROCHURES);
  const tag = pageItemTag(node);
  if (!tag) return null;
  const brochure = brochures.get(tag.brochure);
  const master = brochure?.masters.list().find((item) => item.id === tag.master);
  return { master: master?.name ?? "", brochure: brochure?.name ?? "", source: tag.source };
}
