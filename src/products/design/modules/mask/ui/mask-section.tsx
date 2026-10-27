import { SquareDashed } from "lucide-react";

import { Button } from "@shared/ui/kit";

import type { ElementPatch } from "@canvas";
import { isDesignNode, layerNameOf, type DesignNode } from "../../core";
import { maskOverNode } from "../mask-edits";
import { useDesignEngine } from "@design/ui/design-engine-context";
import { BindSlot, NodeCheckbox, NodeSelectField, PanelSection } from "@design/ui/components/panel";
import type { PropertySectionProps } from "@design/ui/modules";
import { MASK_TYPE_OPTIONS } from "./mask-type-options";
import { MaskSectionButton } from "./mask-section-button";
import { t } from "../mask.i18n";

/**
 * For selected masks: how they mask, inverted or not, and their masked layers or releasing them.
 * For other layers: Use as mask (Ctrl+Alt+M), and for one masked layer the mask over it.
 */
export function MaskSection({ selection: { nodes, kinds, elements } }: PropertySectionProps) {
  const engine = useDesignEngine();
  const run = (command: string) => engine.commands[command]?.();

  if (!nodes.every((node) => node.isMask)) {
    const [node] = nodes;
    const maskId = nodes.length === 1 && node ? maskOverNode(node.id, elements) : null;
    const mask = elements.find((el) => el.id === maskId);
    const masked = mask && isDesignNode(mask) ? mask : null;
    return (
      <PanelSection
        title={t("title")}
        actions={
          masked && (
            <MaskSectionButton label={t("panel.selectMask")} onClick={() => run("selectMask")} />
          )
        }
      >
        <div className="flex flex-col gap-2">
          {masked && (
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <SquareDashed className="size-3.5 shrink-0" />
              <span className="truncate">
                {t("panel.maskedBy", { name: layerNameOf(masked, kinds) })}
              </span>
            </p>
          )}
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            title={nodes.length > 1 ? t("panel.groupsHint") : t("panel.aboveHint")}
            onClick={() => run("useAsMask")}
          >
            <SquareDashed />
            {t("commands.use")}
            <span className="ml-auto text-xs text-muted-foreground">
              {engine.keymap.label("useAsMask")}
            </span>
          </Button>
        </div>
      </PanelSection>
    );
  }

  return (
    <PanelSection
      title={t("title")}
      actions={
        <>
          <MaskSectionButton label={t("panel.selectMasked")} onClick={() => run("selectMasked")} />
          <MaskSectionButton label={t("panel.release")} onClick={() => run("releaseMask")} />
        </>
      }
    >
      <div className="flex flex-col gap-2">
        <NodeSelectField
          nodes={nodes}
          label={t("panel.type")}
          options={MASK_TYPE_OPTIONS}
          read={(node) => node.maskType}
          patch={(maskType) => ({ maskType }) as ElementPatch<DesignNode>}
        />
        <BindSlot nodes={nodes} path="maskInverted">
          <NodeCheckbox
            nodes={nodes}
            label={t("panel.invert")}
            read={(node) => node.maskInverted}
            patch={(maskInverted) => ({ maskInverted }) as ElementPatch<DesignNode>}
          />
        </BindSlot>
      </div>
    </PanelSection>
  );
}
