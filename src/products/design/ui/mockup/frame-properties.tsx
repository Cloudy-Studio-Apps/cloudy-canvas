import {
  AlignCenterHorizontal,
  AlignCenterVertical,
  AlignEndHorizontal,
  AlignEndVertical,
  AlignStartHorizontal,
  AlignStartVertical,
  Blend,
  ChevronDown,
  Frame,
  Link2,
  Maximize2,
  RotateCw,
  Scan,
} from "lucide-react";

import type { FramePropertiesProps } from "./frame-properties.types";
import { PanelAddButton, PanelIconButton, PanelSection } from "./panel-section";
import { ColorField, PropertyField, PropertyRow } from "./property-field";

const ALIGN = [
  { label: "Align left", icon: AlignStartVertical },
  { label: "Align horizontal centers", icon: AlignCenterVertical },
  { label: "Align right", icon: AlignEndVertical },
  { label: "Align top", icon: AlignStartHorizontal },
  { label: "Align vertical centers", icon: AlignCenterHorizontal },
  { label: "Align bottom", icon: AlignEndHorizontal },
];

/** What the right panel shows for a selected frame. */
export function FrameProperties({ frame }: FramePropertiesProps) {
  return (
    <>
      <PanelSection
        title="Frame"
        actions={
          <button
            type="button"
            className="flex h-6 cursor-pointer items-center gap-1 rounded-sm px-1.5 text-xs text-muted-foreground hover:bg-hover hover:text-foreground"
          >
            <Frame className="size-3" />
            Desktop
            <ChevronDown className="size-3" />
          </button>
        }
      />

      <PanelSection title="Position">
        <div className="mb-2 flex justify-between rounded-sm bg-muted p-0.5">
          {ALIGN.map(({ label, icon: Icon }) => (
            <PanelIconButton key={label} label={label}>
              <Icon />
            </PanelIconButton>
          ))}
        </div>
        <PropertyRow>
          <PropertyField prefix="X" label="X" value={String(frame.x * 4)} />
          <PropertyField prefix="Y" label="Y" value={String(frame.y * 4)} />
          <PropertyField prefix={<RotateCw />} label="Rotation" value="0" suffix="°" />
        </PropertyRow>
      </PanelSection>

      <PanelSection title="Layout">
        <div className="flex items-center gap-1">
          <PropertyRow className="flex-1">
            <PropertyField prefix="W" label="Width" value={String(frame.w * 4)} />
            <PropertyField prefix="H" label="Height" value={String(frame.h * 4)} />
          </PropertyRow>
          <PanelIconButton label="Constrain proportions">
            <Link2 />
          </PanelIconButton>
        </div>
        <label className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
          <input type="checkbox" defaultChecked className="accent-primary" />
          Clip content
        </label>
      </PanelSection>

      <PanelSection title="Appearance">
        <PropertyRow>
          <PropertyField prefix={<Blend />} label="Opacity" value="100" suffix="%" />
          <PropertyField prefix={<Scan />} label="Corner radius" value="0" />
        </PropertyRow>
      </PanelSection>

      <PanelSection title="Fill" actions={<PanelAddButton label="Add fill" />}>
        <ColorField color={frame.fill} opacity={100} label="Fill" />
      </PanelSection>
      <PanelSection title="Stroke" actions={<PanelAddButton label="Add stroke" />} />
      <PanelSection title="Effects" actions={<PanelAddButton label="Add effect" />} />
      <PanelSection
        title="Export"
        actions={
          <>
            <PanelIconButton label="Preview">
              <Maximize2 />
            </PanelIconButton>
            <PanelAddButton label="Add export setting" />
          </>
        }
      />
    </>
  );
}
