import type { SettingsSectionProps } from "./settings-section.types";

/** A titled card on the settings page. */
export function SettingsSection({ id, title, description, children }: SettingsSectionProps) {
  const headingId = `${id}-heading`;
  return (
    <section aria-labelledby={headingId} className="rounded-card border bg-surface shadow-soft">
      <div className="space-y-0.5 border-b px-5 py-4">
        <h2 id={headingId} className="text-base font-semibold tracking-tight">
          {title}
        </h2>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}
