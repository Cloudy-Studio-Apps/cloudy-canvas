import type { FontVariant } from "@shared/core";
import { variantName } from "@shared/core";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@shared/ui/kit";
import type { FaceSelectProps } from "./typography-controls.types";

const faceValue = ({ weight, style }: FontVariant) => `${weight}|${style}`;

/** The face (weight and style) of the typography target ("Mixed" when it differs). */
export function FaceSelect({ target, faces }: FaceSelectProps) {
  const weight = target.read("fontWeight");
  const style = target.read("fontStyle");
  const value = weight && style ? faceValue({ weight, style }) : undefined;
  return (
    <Select
      value={value}
      onValueChange={(picked) => {
        const [fontWeight, fontStyle] = picked.split("|") as [
          FontVariant["weight"],
          FontVariant["style"],
        ];
        target.set({ fontWeight, fontStyle });
      }}
    >
      <SelectTrigger aria-label="Font style" title="Font style" className="h-7 w-full text-xs">
        <SelectValue placeholder="Mixed" />
      </SelectTrigger>
      <SelectContent>
        {faces.map((face) => (
          <SelectItem key={faceValue(face)} value={faceValue(face)}>
            {variantName(face)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
