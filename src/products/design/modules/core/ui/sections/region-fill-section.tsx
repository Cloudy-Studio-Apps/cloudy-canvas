import { Layers } from "lucide-react";

import type { ElementPatch } from "@canvas";
import type { DesignNode } from "../../node/design-node.types";
import { solidPaint } from "../../node/solid-paint";
import { setRegionFills } from "../../network/network-region-fills";
import { regionPaints } from "../../network/region-paints";
import type { VectorNetwork } from "../../network/network.types";
import { PanelIconButton } from "@design/ui/components/panel";
import { useEditNodes } from "@design/ui/hooks";
import { PaintStackSection } from "./paint-stack-section";
import type { RegionFillSectionProps } from "./region-fill-section.types";
import { t } from "../../core.i18n";

/** New fills are a light gray, like new rectangles. */
const NEW_FILL = "#D9D9D9";

/**
 * The Fill section while areas of a vector are picked in its edit mode: it edits those areas'
 * own fills, as in Figma, and "Use layer fill" gives them the layer's fills back. Area fills
 * can't be bound to styles or variables yet.
 */
export function RegionFillSection({ node, regions }: RegionFillSectionProps) {
  const edit = useEditNodes();
  const { network } = node;
  const picked = regions.flatMap((i) => (network.regions[i] ? [network.regions[i]] : []));
  const ownFills = picked.some((region) => region.fills !== undefined);

  const write = (next: (net: VectorNetwork) => VectorNetwork, checkpoint: boolean) =>
    edit(
      [node],
      (current) => {
        const net = (current as RegionFillSectionProps["node"]).network;
        return { network: next(net) } as ElementPatch<DesignNode>;
      },
      { checkpoint },
    );

  return (
    <PaintStackSection
      title={t("sections.fills")}
      stacks={picked.map((region) => regionPaints(region, node))}
      newPaint={() => solidPaint(NEW_FILL)}
      allowImage
      size={{ w: node.w, h: node.h }}
      note={
        regions.length === 1
          ? t("sections.selectedArea")
          : t("sections.selectedAreas", { count: regions.length })
      }
      onChange={(paints, checkpoint) =>
        write(
          (net) =>
            regions.reduce((acc, i) => {
              const region = acc.regions[i];
              return region ? setRegionFills(acc, [i], paints(regionPaints(region, node))) : acc;
            }, net),
          checkpoint,
        )
      }
      actions={
        ownFills && (
          <PanelIconButton
            label={t("paints.useLayerFill")}
            onClick={() => write((net) => setRegionFills(net, regions, undefined), true)}
          >
            <Layers className="size-3.5" />
          </PanelIconButton>
        )
      }
    />
  );
}
