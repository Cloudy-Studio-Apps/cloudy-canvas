import { useEditorModules } from "@canvas-ui";
import { designEditor } from "@design/ui/modules/design-editor-points";
import type { LayerBadgesProps } from "./layer-badges.types";

/** The marks modules give a layer after its name (`layerBadges`), in module order. */
export function LayerBadges({ node }: LayerBadgesProps) {
  const { host } = useEditorModules();
  return (
    <>
      {host.get(designEditor.layerBadges).map(({ id, component: Badge }) => (
        <Badge key={id} node={node} />
      ))}
    </>
  );
}
