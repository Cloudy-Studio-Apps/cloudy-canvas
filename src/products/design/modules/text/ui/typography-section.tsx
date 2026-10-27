import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  ArrowDownToLine,
  ArrowUpToLine,
  FoldVertical,
  MoveHorizontal,
  MoveVertical,
  Square,
  Type,
  UnfoldVertical,
} from "lucide-react";

import type { ElementPatch } from "@canvas";
import { retypeset } from "../retypeset";
import type { DesignNode } from "../../core";
import type { TextNodeElement } from "../text.types";
import {
  BindSlot,
  NodeOptionButtons,
  NumberField,
  PanelSection,
  PropertyGrid,
} from "@design/ui/components/panel";
import type { PropertySectionProps } from "@design/ui/modules";
import { closestVariant } from "@shared/core";
import { DecorationButtons } from "./decoration-buttons";
import { FaceSelect } from "./face-select";
import { facesOf } from "./faces-of";
import { FontPicker } from "./font-picker";
import { RangeColorField } from "./range-color-field";
import { TextContentBind } from "./text-content-bind";
import { TextStyleControl } from "./text-styles";
import { useFontFamilies } from "./use-font-families";
import { useTypographyTarget } from "./use-typography-target";
import { t } from "../text.i18n";

/**
 * For selected texts: font, face, size, line height, letter spacing, decoration, alignment and
 * how the box follows its text. While a text is edited, the type fields (and a color) are its
 * selected characters' (`useTypographyTarget`). Every change lays the text out again.
 */
export function TypographySection({ selection: { nodes } }: PropertySectionProps) {
  const families = useFontFamilies();
  const texts = nodes as readonly TextNodeElement[];
  const target = useTypographyTarget(texts);
  const family = target.read("fontFamily");
  const faces = facesOf(families, family);
  const lineHeight = target.read("lineHeight");

  return (
    <PanelSection
      title={target.range ? t("typography.titleSelection") : t("typography.title")}
      actions={<TextStyleControl texts={texts} />}
    >
      <div className="flex flex-col gap-2">
        {!target.range && <TextContentBind texts={texts} />}
        <BindSlot nodes={target.range ? [] : texts} path="fontFamily">
          <FontPicker
            family={family}
            onPick={(picked) => {
              const weight = target.read("fontWeight") ?? "400";
              const style = target.read("fontStyle") ?? "normal";
              const face = closestVariant(picked.variants, { weight, style });
              target.set({
                fontFamily: picked.family,
                ...(face ? { fontWeight: face.weight, fontStyle: face.style } : {}),
              });
            }}
          />
        </BindSlot>
        <PropertyGrid>
          <BindSlot nodes={target.range ? [] : texts} path="fontStyle">
            <FaceSelect target={target} faces={faces} />
          </BindSlot>
          <BindSlot nodes={target.range ? [] : texts} path="fontSize">
            <NumberField
              prefix={<Type />}
              label={t("fields.fontSize")}
              min={1}
              value={target.read("fontSize")}
              onCommit={(fontSize) => target.set({ fontSize })}
            />
          </BindSlot>
          <BindSlot nodes={target.range ? [] : texts} path="lineHeight">
            <NumberField
              prefix={<UnfoldVertical />}
              label={t("fields.lineHeight")}
              suffix="%"
              min={1}
              value={lineHeight === null ? null : Math.round(lineHeight * 100)}
              onCommit={(percent) => target.set({ lineHeight: percent / 100 })}
            />
          </BindSlot>
          <BindSlot nodes={target.range ? [] : texts} path="letterSpacing">
            <NumberField
              prefix={<MoveHorizontal />}
              label={t("fields.letterSpacing")}
              value={target.read("letterSpacing")}
              onCommit={(letterSpacing) => target.set({ letterSpacing })}
            />
          </BindSlot>
        </PropertyGrid>
        {target.range && <RangeColorField target={target} />}
        <div className="flex flex-wrap justify-between gap-2">
          <DecorationButtons target={target} />
          <NodeOptionButtons
            nodes={texts}
            label={t("typography.alignment")}
            options={[
              { value: "left", label: t("typography.left"), icon: <AlignLeft /> },
              { value: "center", label: t("typography.center"), icon: <AlignCenter /> },
              { value: "right", label: t("typography.right"), icon: <AlignRight /> },
              { value: "justify", label: t("typography.justify"), icon: <AlignJustify /> },
            ]}
            read={(text) => text.textAlign}
            patch={(value) => ({ textAlign: value }) as ElementPatch<DesignNode>}
          />
          <NodeOptionButtons
            nodes={texts}
            label={t("typography.verticalAlignment")}
            options={[
              { value: "top", label: t("typography.top"), icon: <ArrowUpToLine /> },
              { value: "middle", label: t("typography.middle"), icon: <FoldVertical /> },
              { value: "bottom", label: t("typography.bottom"), icon: <ArrowDownToLine /> },
            ]}
            read={(text) => text.verticalAlign}
            patch={(value) => ({ verticalAlign: value }) as ElementPatch<DesignNode>}
          />
        </div>
        <NodeOptionButtons
          nodes={texts}
          label={t("typography.resizing")}
          options={[
            { value: "width", label: t("typography.autoWidth"), icon: <MoveHorizontal /> },
            { value: "height", label: t("typography.autoHeight"), icon: <MoveVertical /> },
            { value: "none", label: t("typography.fixedSize"), icon: <Square /> },
          ]}
          read={(text) => text.autoResize}
          patch={(value, node) =>
            retypeset(node as TextNodeElement, {
              autoResize: value as TextNodeElement["autoResize"],
            }) as ElementPatch<DesignNode>
          }
        />
      </div>
    </PanelSection>
  );
}
