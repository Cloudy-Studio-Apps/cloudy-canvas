import { readEffectStyle } from "../../../core";
import type { StylePreviewProps } from "../../../core/ui";

/** An effect style's picture: a small card with its first shadow (or a plain one). */
export function EffectStylePreview({ style }: StylePreviewProps) {
  const effects = readEffectStyle(style.value)?.effects ?? [];
  const shadow = effects.find((effect) => effect.type === "drop-shadow" && effect.visible);
  const blur = typeof shadow?.blur === "number" ? Math.min(4, shadow.blur / 4) : 2;
  return (
    <span
      className="size-4 shrink-0 rounded-xs border border-border bg-surface"
      style={{ boxShadow: `0 ${Math.max(1, blur / 2)}px ${blur}px var(--foreground)` }}
    />
  );
}
