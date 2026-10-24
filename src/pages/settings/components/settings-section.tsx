import type { SettingsSectionProps } from "./settings-section.types";

/** A settings page: its title and description, then its content in a card. */
export function SettingsSection({ id, title, description, children }: SettingsSectionProps) {
  const headingId = `${id}-heading`;
  return (
    <section aria-labelledby={headingId}>
      <div className="space-y-1">
        <h1 id={headingId} className="text-lg font-semibold tracking-tight">
          {title}
        </h1>
        {description && <p className="max-w-prose text-sm text-muted-foreground">{description}</p>}
      </div>
      <div className="mt-5 rounded-card border bg-surface p-5 shadow-soft">{children}</div>
    </section>
  );
}
