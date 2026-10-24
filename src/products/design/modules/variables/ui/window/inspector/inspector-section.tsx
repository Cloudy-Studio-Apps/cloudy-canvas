import type { InspectorSectionProps } from "./inspector.types";

/** A titled block of the inspector. */
export function InspectorSection({ title, actions, children }: InspectorSectionProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        {title}
        {actions}
      </div>
      {children}
    </div>
  );
}
