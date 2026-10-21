import { RADII, SHADOWS } from "../tokens";
import { Labeled, Section } from "./section-layout";

export function ShapeSection() {
  return (
    <Section
      title="Shape & elevation"
      description="Sharp by design: nothing in the UI goes above 8px."
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="flex flex-wrap gap-4">
          {RADII.map(({ token, className, value }) => (
            <Labeled key={token} label={`${token} · ${value}`}>
              <div className={`size-16 border-2 border-primary bg-primary-soft ${className}`} />
            </Labeled>
          ))}
        </div>
        <div className="flex flex-wrap gap-5 rounded-card bg-surface-sunken p-5">
          {SHADOWS.map(({ token, className }) => (
            <Labeled key={token} label={token}>
              <div className={`size-16 rounded-card bg-surface ${className}`} />
            </Labeled>
          ))}
        </div>
      </div>
    </Section>
  );
}
