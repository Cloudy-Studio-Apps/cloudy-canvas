import { Library } from "lucide-react";
import { useState } from "react";

import {
  ConfirmDialog,
  Popover,
  PopoverContent,
  PopoverTrigger,
  SwitchField,
} from "@shared/ui/kit";
import type { LibraryEntry } from "@shared/core";
import { useProjectLibrariesState } from "./project-libraries-context";
import { useFileLibraries } from "./use-file-libraries";
import { t } from "./libraries.i18n";

/**
 * The libraries button of a section of variables or colors, in a file of a project: each project library with a
 * switch saying whether the file uses it. Turning off one that layers use asks first, with how
 * many. Only while the project's libraries are open; files of no project get no button.
 */
export function FileLibrariesMenu() {
  const { status } = useProjectLibrariesState();
  const libraries = useFileLibraries();
  const [leaving, setLeaving] = useState<{ entry: LibraryEntry; users: number }>();
  if (status === "none") return null;

  const toggle = (entry: LibraryEntry, on: boolean) => {
    const users = on ? 0 : libraries.users(entry.id);
    if (users > 0) setLeaving({ entry, users });
    else libraries.setUsed(entry.id, on);
  };

  return (
    <>
      <Popover>
        <PopoverTrigger
          aria-label={t("libraries.title")}
          title={t("libraries.title")}
          className="flex size-6 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground [&_svg]:size-3.5"
        >
          <Library />
        </PopoverTrigger>
        <PopoverContent align="end" className="flex w-64 flex-col gap-2 p-3">
          <p className="text-xs font-medium">
            {libraries.projectName
              ? t("libraries.ofProject", { project: libraries.projectName })
              : t("libraries.title")}
          </p>
          {!libraries.ready ? (
            <p className="text-xs text-muted-foreground">{t("libraries.unavailable")}</p>
          ) : libraries.entries.length === 0 ? (
            <p className="text-xs text-muted-foreground">{t("libraries.none")}</p>
          ) : (
            <div className="flex flex-col gap-1.5">
              {libraries.entries.map((entry) => (
                <SwitchField
                  key={entry.id}
                  label={
                    libraries.unreadable.has(entry.id)
                      ? t("libraries.unreadable", { name: entry.name })
                      : entry.name
                  }
                  checked={libraries.used.has(entry.id)}
                  onChange={(on) => toggle(entry, on)}
                />
              ))}
              <p className="text-[11px] text-subtle-foreground">{t("libraries.hint")}</p>
            </div>
          )}
        </PopoverContent>
      </Popover>
      <ConfirmDialog
        open={leaving !== undefined}
        onOpenChange={(open) => !open && setLeaving(undefined)}
        title={t("libraries.leaveTitle", { name: leaving?.entry.name ?? "" })}
        description={t("libraries.leaveText", { count: leaving?.users ?? 0 })}
        confirmLabel={t("libraries.leave")}
        destructive
        onConfirm={() => leaving && libraries.setUsed(leaving.entry.id, false)}
      />
    </>
  );
}
