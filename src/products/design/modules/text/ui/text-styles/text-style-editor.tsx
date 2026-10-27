import { MoveHorizontal, Type, UnfoldVertical } from "lucide-react";

import { DOCUMENT_TOKENS } from "@canvas";
import { NumberField, PropertyGrid } from "@design/ui/components/panel";
import { StyleEditorFrame, type StyleEditorProps } from "../../../core/ui";
import { useDesignEngine } from "@design/ui/design-engine-context";
import { closestVariant } from "@shared/core";
import { DecorationButtons } from "../decoration-buttons";
import { FaceSelect } from "../face-select";
import { facesOf } from "../faces-of";
import { FontPicker } from "../font-picker";
import { useFontFamilies } from "../use-font-families";
import { styleTypographyTarget } from "./style-typography-target";
import { t } from "../../text.i18n";

/**
 * A text style's typography, edited with the Typography section's own controls (in the shared
 * style editor frame); the texts using it follow every change.
 */
export function TextStyleEditor({ style, onDelete }: StyleEditorProps) {
  const engine = useDesignEngine();
  const tokens = engine.service(DOCUMENT_TOKENS);
  const families = useFontFamilies();
  const target = styleTypographyTarget(tokens, style);
  const family = target.read("fontFamily");
  const lineHeight = target.read("lineHeight");

  return (
    <StyleEditorFrame style={style} onDelete={onDelete}>
      <div className="flex flex-col gap-2">
        <FontPicker
          family={family}
          onPick={(picked) => {
            const face = closestVariant(picked.variants, {
              weight: target.read("fontWeight") ?? "400",
              style: target.read("fontStyle") ?? "normal",
            });
            target.set({
              fontFamily: picked.family,
              ...(face ? { fontWeight: face.weight, fontStyle: face.style } : {}),
            });
          }}
        />
        <PropertyGrid>
          <FaceSelect target={target} faces={facesOf(families, family)} />
          <NumberField
            prefix={<Type />}
            label={t("fields.fontSize")}
            min={1}
            value={target.read("fontSize")}
            onCommit={(fontSize) => target.set({ fontSize })}
          />
          <NumberField
            prefix={<UnfoldVertical />}
            label={t("fields.lineHeight")}
            suffix="%"
            min={1}
            value={lineHeight === null ? null : Math.round(lineHeight * 100)}
            onCommit={(percent) => target.set({ lineHeight: percent / 100 })}
          />
          <NumberField
            prefix={<MoveHorizontal />}
            label={t("fields.letterSpacing")}
            value={target.read("letterSpacing")}
            onCommit={(letterSpacing) => target.set({ letterSpacing })}
          />
        </PropertyGrid>
        <DecorationButtons target={target} />
      </div>
    </StyleEditorFrame>
  );
}
