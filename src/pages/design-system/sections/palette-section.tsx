import { SCALES, STEPS } from "../tokens";
import { Section } from "./section-layout";

export function PaletteSection() {
  return (
    <Section
      title="Palette"
      description="Raw scales. Only semantic tokens (below) should be used in components."
    >
      <div className="space-y-5">
        {SCALES.map(({ name, role }) => (
          <div key={name} className="space-y-2">
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-sm font-medium">{name}</span>
              <span className="text-sm text-muted-foreground">{role}</span>
            </div>
            <div className="grid grid-cols-11 overflow-hidden rounded-card border">
              {STEPS.map((step) => (
                <div key={step}>
                  <div className="h-12" style={{ backgroundColor: `var(--${name}-${step})` }} />
                  <div className="bg-surface px-1.5 py-1 font-mono text-xs text-muted-foreground">
                    {step}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}
