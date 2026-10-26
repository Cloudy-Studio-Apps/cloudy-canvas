import { readTextStyle } from "@design";
import type { StylePreviewProps } from "../../../core/ui";

/** A text style's picture: "Ag" in its font. */
export function TextStylePreview({ style }: StylePreviewProps) {
  const value = readTextStyle(style.value);
  return (
    <span
      className="w-4 shrink-0 text-center text-[13px] leading-none text-foreground"
      style={{
        fontFamily: value.fontFamily,
        fontWeight: value.fontWeight,
        fontStyle: value.fontStyle,
      }}
    >
      Ag
    </span>
  );
}
