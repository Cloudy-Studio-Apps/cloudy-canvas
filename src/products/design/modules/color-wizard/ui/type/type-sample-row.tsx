import type { TypeSampleRowProps } from "./type.types";

const SAMPLES: Record<string, string> = {
  "4xl": "Ideas, shipped.",
  "3xl": "Plan, ship and grow",
  "2xl": "Everything in one place",
  xl: "Weekly report",
  lg: "Automations",
  md: "Everything your team needs to move from idea to launch, without the busywork.",
  sm: "Updated 2 minutes ago by Ada",
  xs: "FIGURE 1 · REVENUE BY MONTH",
};

/** A text style: its name and numbers, and a line set in it. */
export function TypeSampleRow({ step, color, muted }: TypeSampleRowProps) {
  const small = !step.heading && step.name !== "md";
  return (
    <div className="grid grid-cols-[120px_minmax(0,1fr)] items-baseline gap-3.5 border-b border-border py-2.5">
      <span className="text-xs">
        <b>Type/{step.name}</b>
        <br />
        <span className="text-muted-foreground">
          {step.font} · {step.size}/{Math.round(step.size * step.lineHeight)} · {step.weight}
        </span>
      </span>
      <span
        className="truncate"
        style={{
          fontFamily: `"${step.font}"`,
          fontSize: Math.min(step.size, 64),
          lineHeight: step.lineHeight,
          fontWeight: Number(step.weight),
          color: small ? muted : color,
        }}
      >
        {SAMPLES[step.name] ?? "The quick brown fox jumps over the lazy dog"}
      </span>
    </div>
  );
}
