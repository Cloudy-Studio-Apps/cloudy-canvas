import type { PersonBadgeProps } from "./share-dialog.types";

/** A person's initials, ringed in their colour (like collaborators' avatars). */
export function PersonBadge({ identity }: PersonBadgeProps) {
  const initials = identity.name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? "")
    .join("");
  return (
    <span
      className="flex size-7 shrink-0 items-center justify-center rounded-md border-2 bg-surface text-[10px] font-semibold"
      style={{ borderColor: identity.color }}
      aria-hidden
    >
      {initials || "?"}
    </span>
  );
}
