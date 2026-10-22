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
import { retypeset, type DesignNode, type TextNodeElement } from "@design";
import {
  NodeNumberField,
  NodeOptionButtons,
  NodeSelectField,
  PanelSection,
  PropertyGrid,
  sharedValue,
} from "@design/ui/components/panel";
import { useDesignEngine } from "@design/ui/design-engine-context";
import { useEditNodes } from "@design/ui/hooks";
import type { PropertySectionProps } from "@design/ui/modules";
import { closestVariant, sortVariants, variantName, type FontVariant } from "@shared/core";
import { FontPicker } from "./font-picker";
import { useFontFamilies } from "./use-font-families";

/** Faces offered for a family the library doesn't know (e.g. a file from another computer). */
const ANY_FACES: FontVariant[] = sortVariants(
  (["400", "700"] as const).flatMap((weight) => [
    { weight, style: "normal" as const },
    { weight, style: "italic" as const },
  ]),
);

const faceValue = ({ weight, style }: FontVariant) => `${weight}|${style}`;

/**
 * For selected texts: font, face, size, line height, letter spacing, alignment and how the box
 * follows its text. Every change lays the text out again, and becomes what new texts use.
 */
export function TypographySection({ selection: { nodes } }: PropertySectionProps) {
  const engine = useDesignEngine();
  const edit = useEditNodes();
  const families = useFontFamilies();
  const texts = nodes as readonly TextNodeElement[];
  const family = sharedValue(texts, (text) => text.fontFamily);
  const faces =
    families?.find((item) => item.family === family)?.variants ?? (family ? ANY_FACES : []);

  /** A typography change to a text, laid out again; it becomes what new texts are typed in. */
  const retype = (node: DesignNode, patch: Partial<TextNodeElement>): ElementPatch<DesignNode> => {
    const text = node as TextNodeElement;
    const { fontFamily, fontSize, fontWeight, fontStyle, lineHeight, letterSpacing } = {
      ...text,
      ...patch,
    };
    engine.setToolOptions({
      textTypography: { fontFamily, fontSize, fontWeight, fontStyle, lineHeight, letterSpacing },
    });
    return retypeset(text, patch) as ElementPatch<DesignNode>;
  };

  return (
    <PanelSection title="Typography">
      <div className="flex flex-col gap-2">
        <FontPicker
          family={family}
          onPick={(picked) =>
            edit(texts, (node) => {
              const text = node as TextNodeElement;
              const face = closestVariant(picked.variants, {
                weight: text.fontWeight,
                style: text.fontStyle,
              });
              return retype(node, {
                fontFamily: picked.family,
                ...(face ? { fontWeight: face.weight, fontStyle: face.style } : {}),
              });
            })
          }
        />
        <PropertyGrid>
          <NodeSelectField
            nodes={texts}
            label="Font style"
            options={faces.map((face) => ({ value: faceValue(face), label: variantName(face) }))}
            read={(text) => faceValue({ weight: text.fontWeight, style: text.fontStyle })}
            patch={(value, node) => {
              const [weight, style] = value.split("|") as [
                FontVariant["weight"],
                FontVariant["style"],
              ];
              return retype(node, { fontWeight: weight, fontStyle: style });
            }}
          />
          <NodeNumberField
            nodes={texts}
            prefix={<Type />}
            label="Font size"
            min={1}
            read={(text) => text.fontSize}
            patch={(size, node) => retype(node, { fontSize: size })}
          />
          <NodeNumberField
            nodes={texts}
            prefix={<UnfoldVertical />}
            label="Line height"
            suffix="%"
            min={1}
            read={(text) => Math.round(text.lineHeight * 100)}
            patch={(percent, node) => retype(node, { lineHeight: percent / 100 })}
          />
          <NodeNumberField
            nodes={texts}
            prefix={<MoveHorizontal />}
            label="Letter spacing"
            read={(text) => text.letterSpacing}
            patch={(spacing, node) => retype(node, { letterSpacing: spacing })}
          />
        </PropertyGrid>
        <div className="flex flex-wrap justify-between gap-2">
          <NodeOptionButtons
            nodes={texts}
            label="Text alignment"
            options={[
              { value: "left", label: "Align left", icon: <AlignLeft /> },
              { value: "center", label: "Align center", icon: <AlignCenter /> },
              { value: "right", label: "Align right", icon: <AlignRight /> },
              { value: "justify", label: "Justify", icon: <AlignJustify /> },
            ]}
            read={(text) => text.textAlign}
            patch={(value) => ({ textAlign: value }) as ElementPatch<DesignNode>}
          />
          <NodeOptionButtons
            nodes={texts}
            label="Vertical alignment"
            options={[
              { value: "top", label: "Align top", icon: <ArrowUpToLine /> },
              { value: "middle", label: "Align middle", icon: <FoldVertical /> },
              { value: "bottom", label: "Align bottom", icon: <ArrowDownToLine /> },
            ]}
            read={(text) => text.verticalAlign}
            patch={(value) => ({ verticalAlign: value }) as ElementPatch<DesignNode>}
          />
        </div>
        <NodeOptionButtons
          nodes={texts}
          label="Resizing"
          options={[
            { value: "width", label: "Auto width", icon: <MoveHorizontal /> },
            { value: "height", label: "Auto height", icon: <MoveVertical /> },
            { value: "none", label: "Fixed size", icon: <Square /> },
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
