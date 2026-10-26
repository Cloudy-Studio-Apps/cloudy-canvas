import { useState } from "react";
import { Settings2 } from "lucide-react";

import {
  NodeNumberField,
  NodeOptionButtons,
  NodeSelectField,
  PanelIconButton,
  PropertyGrid,
  sharedValue,
} from "@design/ui/components/panel";
import { Popover, PopoverContent, PopoverTrigger } from "@shared/ui/kit";
import { DashPatternField } from "./dash-pattern-field";
import { dashStyle, dashStylePatch } from "./stroke-dashes";
import type { DashStyle } from "./stroke-dashes.types";
import { CAPS, DASH_STYLES, JOINS } from "./stroke-options";
import { SettingsRow } from "./settings-row";
import { StrokePreview } from "./stroke-preview";
import type { StrokeSettingsProps } from "./stroke-settings.types";

/**
 * The stroke settings popover: its dash style (with a live preview, the dash and gap or a custom
 * pattern), its ends (when there are open ends or dashes), its corners and miter angle.
 */
export function StrokeSettings({ nodes, openEnds }: StrokeSettingsProps) {
  const [open, setOpen] = useState(false);
  const style = sharedValue(nodes, dashStyle);
  const first = nodes[0];
  const dashed = nodes.some((node) => node.strokeDashes.length > 0);
  const mitered = nodes.some((node) => node.strokeJoin === "miter");
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <span>
          <PanelIconButton label="Stroke settings" active={open}>
            <Settings2 />
          </PanelIconButton>
        </span>
      </PopoverTrigger>
      <PopoverContent side="left" align="start" sideOffset={16} className="w-60 p-3">
        <div className="flex flex-col gap-2.5 text-xs">
          <h3 className="font-semibold text-foreground">Stroke settings</h3>
          {first && style !== null && <StrokePreview node={first} />}
          <NodeSelectField
            nodes={nodes}
            label="Dash style"
            read={dashStyle}
            patch={(value, node) => dashStylePatch(value as DashStyle, node)}
            options={DASH_STYLES}
          />
          {style === "dashed" && (
            <PropertyGrid>
              <NodeNumberField
                nodes={nodes}
                prefix="D"
                label="Dash length"
                min={0}
                read={(node) => node.strokeDashes[0] ?? 0}
                patch={(dash, node) => ({ strokeDashes: [dash, node.strokeDashes[1] ?? dash] })}
              />
              <NodeNumberField
                nodes={nodes}
                prefix="G"
                label="Gap length"
                min={0}
                read={(node) => node.strokeDashes[1] ?? 0}
                patch={(gap, node) => ({ strokeDashes: [node.strokeDashes[0] ?? gap, gap] })}
              />
            </PropertyGrid>
          )}
          {style === "dotted" && (
            <NodeNumberField
              nodes={nodes}
              prefix="G"
              label="Space between dots"
              min={0}
              read={(node) => node.strokeDashes[1] ?? 0}
              patch={(gap) => ({ strokeDashes: [0, gap] })}
            />
          )}
          {style === "custom" && <DashPatternField nodes={nodes} />}
          {(openEnds || dashed) && (
            <SettingsRow label={dashed ? "Ends and dashes" : "Ends"}>
              <NodeOptionButtons
                nodes={nodes}
                label="Stroke cap"
                read={(node) => node.strokeCap}
                patch={(strokeCap) => ({ strokeCap: strokeCap as "none" })}
                options={CAPS}
              />
            </SettingsRow>
          )}
          <SettingsRow label="Corners">
            <NodeOptionButtons
              nodes={nodes}
              label="Stroke join"
              read={(node) => node.strokeJoin}
              patch={(strokeJoin) => ({ strokeJoin: strokeJoin as "miter" })}
              options={JOINS}
            />
          </SettingsRow>
          {mitered && (
            <NodeNumberField
              nodes={nodes}
              prefix="∠"
              label="Miter angle: sharper corners are beveled"
              suffix="°"
              min={1}
              max={180}
              read={(node) => node.strokeMiterAngle}
              patch={(strokeMiterAngle) => ({ strokeMiterAngle })}
            />
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
