import { useEditorModules } from "@canvas-ui";
import { useDesignEngine } from "@design/ui/design-engine-context";
import { dataPreviewSetters } from "../../data.points";
import { scopeLayersAt } from "../../repeat";
import { InScopeRow } from "./in-scope-row";
import { loopPreview } from "./loop-preview";
import type { InScopeProps } from "./in-scope.types";
import { t } from "../../data.i18n";

/**
 * What a layer has in scope, like a debugger's scope view: every loop around it, outermost first
 * (`scopeLayersAt`), its row's name, where it comes from and its row. Nothing when no loop is
 * around it (the sources are in the Data tab).
 */
export function InScope({ nodeId }: InScopeProps) {
  const engine = useDesignEngine();
  const { host } = useEditorModules();
  const layers = scopeLayersAt(engine.doc, nodeId);
  if (layers.length === 0) return null;
  const setters = host.get(dataPreviewSetters);
  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs font-medium text-foreground">{t("scope.title")}</span>
      {layers.map((layer, index) => (
        <InScopeRow
          key={`${layer.owner}:${index}`}
          layer={layer}
          loop={loopPreview(engine.doc, layer, nodeId, setters)}
        />
      ))}
    </div>
  );
}
