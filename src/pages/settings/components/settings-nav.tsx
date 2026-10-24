import { NavLink } from "react-router";

import { cn } from "@shared/ui/lib/utils";
import { SETTINGS_GROUPS, SETTINGS_SECTIONS } from "../settings-sections";

/** The settings' sections, grouped: a sidebar, or a scrolling row in a narrow window. */
export function SettingsNav() {
  return (
    <nav
      aria-label="Settings"
      className="shrink-0 overflow-x-auto border-b bg-surface-sunken md:w-56 md:overflow-x-visible md:overflow-y-auto md:border-r md:border-b-0"
    >
      <div className="flex gap-1 p-2 md:flex-col md:gap-5 md:px-3 md:py-5">
        {SETTINGS_GROUPS.map((group) => (
          <div key={group.id} className="flex gap-1 md:flex-col md:gap-0.5">
            <p className="hidden px-2.5 pb-1.5 text-xs font-medium tracking-wider text-muted-foreground uppercase md:block">
              {group.label}
            </p>
            {SETTINGS_SECTIONS.filter((section) => section.group === group.id).map(
              ({ id, label, icon: Icon }) => (
                <NavLink
                  key={id}
                  to={`/settings/${id}`}
                  className={({ isActive }) =>
                    cn(
                      "relative flex h-8 shrink-0 items-center gap-2.5 rounded-md px-2.5 text-sm whitespace-nowrap transition-colors outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40",
                      isActive
                        ? "bg-surface font-medium text-foreground shadow-xs before:absolute before:inset-y-1.5 before:left-0 before:w-0.5 before:bg-primary"
                        : "text-muted-foreground hover:bg-surface/60 hover:text-foreground",
                    )
                  }
                >
                  <Icon aria-hidden="true" className="size-4 shrink-0" />
                  {label}
                </NavLink>
              ),
            )}
          </div>
        ))}
      </div>
    </nav>
  );
}
