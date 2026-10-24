import { resolveVariable, tokenLeafOf } from "@canvas";
import { cn } from "@shared/ui/lib/utils";
import { cssColor } from "../css-color";
import { contrastRatio } from "../luminance";
import { useBoard } from "../use-board";
import type { InspectorPartProps } from "./inspector.types";
import { InspectorSection } from "./inspector-section";

/** WCAG grades: AAA from 7:1, AA from 4.5:1, large text only from 3:1. */
function grade(ratio: number): { label: string; tone: string } {
  if (ratio >= 7) return { label: "AAA", tone: "text-success bg-success-soft" };
  if (ratio >= 4.5) return { label: "AA", tone: "text-success bg-success-soft" };
  if (ratio >= 3) return { label: "Large", tone: "text-warning bg-warning-soft" };
  return { label: "Fail", tone: "text-destructive bg-destructive-soft" };
}

/**
 * A color's contrast against the collection's "surface" variable (white without one) in each mode,
 * graded as WCAG does.
 */
export function ContrastList({ variable }: InspectorPartProps) {
  const { store, modes } = useBoard();
  const surface = store
    .variables(variable.collectionId)
    .find((v) => tokenLeafOf(v.name) === "surface" && v.type === "color");
  if (surface?.id === variable.id) return null;
  return (
    <InspectorSection title={`Contrast on ${surface ? "surface" : "white"}`}>
      <div className="flex flex-col gap-1.5">
        {modes.map((mode) => {
          const color = resolveVariable(store, variable.id, mode.context);
          const ground = surface ? resolveVariable(store, surface.id, mode.context) : null;
          if (color?.type !== "color") return null;
          const back = ground?.type === "color" ? ground.color : "#FFFFFFFF";
          const ratio = contrastRatio(color.color, back);
          const { label, tone } = grade(ratio);
          return (
            <div
              key={mode.id}
              className="flex items-center gap-2 rounded-md border border-border px-2 py-1.5 text-xs"
            >
              <span
                className="size-3.5 rounded-xs border border-border"
                style={{ backgroundColor: cssColor(color.color) }}
              />
              {modes.length > 1 ? `on ${mode.name}` : "on surface"}
              <span className="ml-auto font-mono">{ratio.toFixed(1)}:1</span>
              <span className={cn("rounded-xs px-1.5 text-[10px] font-semibold", tone)}>
                {label}
              </span>
            </div>
          );
        })}
      </div>
    </InspectorSection>
  );
}
