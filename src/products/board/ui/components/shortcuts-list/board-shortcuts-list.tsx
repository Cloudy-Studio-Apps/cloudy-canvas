import { Fragment, useMemo } from "react";

import { formatShortcut } from "@shared/core";
import { Kbd } from "@shared/ui/components/ui/kbd";
import { boardShortcutGroups } from "./board-shortcut-rows";

/** Every board shortcut, read from the board's keybindings. */
export function BoardShortcutsList() {
  const groups = useMemo(() => boardShortcutGroups(), []);

  return (
    <div className="grid gap-8 sm:grid-cols-2">
      {groups.map((group) => (
        <div key={group.title} className="space-y-2">
          <h3 className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            {group.title}
          </h3>
          <dl className="divide-y">
            {group.rows.map((row) => (
              <div key={row.command} className="flex items-center justify-between gap-4 py-1.5">
                <dt className="text-sm">{row.label}</dt>
                <dd className="flex items-center gap-1.5">
                  {row.shortcuts.map((shortcut, i) => (
                    <Fragment key={i}>
                      {i > 0 && <span className="text-xs text-subtle-foreground">or</span>}
                      <Kbd>{formatShortcut(shortcut)}</Kbd>
                    </Fragment>
                  ))}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      ))}
    </div>
  );
}
