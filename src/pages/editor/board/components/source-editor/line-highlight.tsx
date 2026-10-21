import type { LineHighlightProps } from "./line-highlight.types";

/** A band over some lines of the source textarea; it follows the textarea's scroll. */
export function LineHighlight({ span, lineHeight, paddingTop, scrollTop }: LineHighlightProps) {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-x-px border-l-2 border-primary bg-primary-soft/60 mix-blend-multiply"
      style={{
        top: paddingTop + span.first * lineHeight - scrollTop,
        height: span.count * lineHeight,
      }}
    />
  );
}
