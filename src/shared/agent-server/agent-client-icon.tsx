import { cn } from "@shared/ui/lib/utils";
import type { AgentClientIconViewProps } from "./agent-client-icon.types";

/** An agent app's logo on a square tile. */
export function AgentClientIconView({ icon, className }: AgentClientIconViewProps) {
  const Icon = "hex" in icon ? null : icon;
  return (
    <span
      className={cn(
        "flex size-9 shrink-0 items-center justify-center rounded-md border bg-surface text-foreground [&_svg]:size-5",
        className,
      )}
      aria-hidden
    >
      {Icon ? (
        <Icon />
      ) : (
        "hex" in icon && (
          <svg viewBox="0 0 24 24" fill={`#${icon.hex}`}>
            <path d={icon.path} />
          </svg>
        )
      )}
    </span>
  );
}
