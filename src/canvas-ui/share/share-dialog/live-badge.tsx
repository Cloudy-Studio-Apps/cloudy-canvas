import { Eye, Radio } from "lucide-react";

import type { LiveBadgeProps } from "./share-dialog.types";

/** In a session joined as a guest: whose file it is, and whether the guest only views it. */
export function LiveBadge({ live }: LiveBadgeProps) {
  const viewing = live.role === "view";
  return (
    <span
      className="flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs"
      title={viewing ? `${live.host.name} lets you view this file` : `${live.host.name}'s file`}
    >
      {viewing ? <Eye className="size-3.5" /> : <Radio className="size-3.5 text-primary" />}
      <span className="max-w-32 truncate">
        {viewing ? "Viewing" : "Live"} · {live.host.name}
      </span>
    </span>
  );
}
