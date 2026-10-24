import { useDocumentTokens } from "@canvas-ui";
import type { PropertySectionProps } from "@design/ui/modules";
import { PanelSection } from "@design/ui/components/panel";
import { useDesignEngine } from "@design/ui/design-engine-context";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@shared/ui/components/ui/select";
import { setVariableModes } from "../set-variable-modes";

/** What a container inheriting its mode shows (and picks to inherit again). */
const AUTO = "auto";

/**
 * Which mode of each axis (with several) a frame, section or group and what it holds use: "Auto"
 * follows what holds it, then the file's switch (so a Dark frame can sit beside a Light one).
 */
export function VariableModesSection({ selection: { nodes } }: PropertySectionProps) {
  const engine = useDesignEngine();
  const { store } = useDocumentTokens();
  const axes = store.switchableAxes();
  if (axes.length === 0) return null;
  const ids = nodes.map((node) => node.id);

  return (
    <PanelSection title="Variable modes">
      <div className="flex flex-col gap-1.5">
        {axes.map((axis) => {
          const values = new Set(nodes.map((n) => n.variableModes?.[axis.id] ?? AUTO));
          const value = values.size === 1 ? [...values][0] : undefined;
          return (
            <div key={axis.id} className="flex items-center gap-2">
              <span className="w-20 shrink-0 truncate text-xs" title={axis.name}>
                {axis.name}
              </span>
              <Select
                value={value}
                onValueChange={(mode) =>
                  setVariableModes(engine.doc, ids, axis.id, mode === AUTO ? null : mode)
                }
              >
                <SelectTrigger aria-label={`${axis.name} mode`} className="h-7 flex-1 text-xs">
                  <SelectValue placeholder="Mixed" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={AUTO}>Auto (inherit)</SelectItem>
                  {axis.modes.map((mode) => (
                    <SelectItem key={mode.id} value={mode.id}>
                      {mode.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          );
        })}
      </div>
    </PanelSection>
  );
}
