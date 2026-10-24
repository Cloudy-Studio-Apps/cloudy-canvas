import { MoveHorizontal, Trash2, Type, UnfoldVertical } from "lucide-react";

import { DOCUMENT_TOKENS } from "@canvas";
import { CommitInput, CommitTextarea } from "@canvas-ui";
import { NumberField, PropertyGrid } from "@design/ui/components/panel";
import { useDesignEngine } from "@design/ui/design-engine-context";
import { closestVariant } from "@shared/core";
import { Button } from "@shared/ui/components/ui/button";
import { DecorationButtons } from "../decoration-buttons";
import { FaceSelect } from "../face-select";
import { facesOf } from "../faces-of";
import { FontPicker } from "../font-picker";
import { useFontFamilies } from "../use-font-families";
import { styleTypographyTarget } from "./style-typography-target";
import type { TextStyleEditorProps } from "./text-styles.types";

/**
 * A text style's name, typography and description, edited with the Typography section's own
 * controls; the texts using it follow every change.
 */
export function TextStyleEditor({ style, onDelete }: TextStyleEditorProps) {
  const engine = useDesignEngine();
  const tokens = engine.service(DOCUMENT_TOKENS);
  const families = useFontFamilies();
  const target = styleTypographyTarget(tokens, style);
  const family = target.read("fontFamily");
  const lineHeight = target.read("lineHeight");

  return (
    <div className="flex flex-col gap-3 text-xs">
      <label className="flex flex-col gap-1">
        <span className="text-muted-foreground">Name</span>
        <CommitInput
          aria-label="Style name"
          value={style.name}
          onCommit={(name) => tokens.updateStyle(style.id, { name })}
          className="h-7 text-xs"
        />
      </label>
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
            label="Font size"
            min={1}
            value={target.read("fontSize")}
            onCommit={(fontSize) => target.set({ fontSize })}
          />
          <NumberField
            prefix={<UnfoldVertical />}
            label="Line height"
            suffix="%"
            min={1}
            value={lineHeight === null ? null : Math.round(lineHeight * 100)}
            onCommit={(percent) => target.set({ lineHeight: percent / 100 })}
          />
          <NumberField
            prefix={<MoveHorizontal />}
            label="Letter spacing"
            value={target.read("letterSpacing")}
            onCommit={(letterSpacing) => target.set({ letterSpacing })}
          />
        </PropertyGrid>
        <DecorationButtons target={target} />
      </div>
      <label className="flex flex-col gap-1">
        <span className="text-muted-foreground">Description</span>
        <CommitTextarea
          aria-label="Description"
          value={style.description}
          onCommit={(description) => tokens.updateStyle(style.id, { description })}
          className="min-h-12 text-xs"
        />
      </label>
      <Button
        variant="ghost"
        size="sm"
        onClick={onDelete}
        className="justify-start text-destructive"
      >
        <Trash2 /> Delete style
      </Button>
    </div>
  );
}
