import { Loader2, X } from "lucide-react";

import { FileTypeIcon } from "@shared/ui/components/file-type-icon";
import { cn } from "@shared/ui/lib/utils";
import { closeTab } from "../tabs/close-tab";
import { tabKeymap } from "../tabs/tab-keybindings";
import { fileTabs } from "../tabs/file-tabs-instance";
import { TabAvatars } from "./tab-avatars";
import { t } from "./title-bar.i18n";
import type { TabButtonProps } from "./title-bar.types";

/**
 * A file tab: its product's icon (a spinner while it loads), its name, who is in it, and the close
 * button, which an unsaved dot stands in for until the tab is hovered. Middle-click closes.
 */
export function TabButton({ tab, active, dropSide, dragging, rowProps }: TabButtonProps) {
  const loading = tab.load.status === "loading";
  return (
    <div
      role="tab"
      tabIndex={0}
      aria-selected={active}
      title={tab.name}
      {...rowProps}
      onClick={() => fileTabs.activate(tab.id)}
      onAuxClick={(event) => {
        if (event.button !== 1) return;
        event.preventDefault();
        void closeTab(tab.id);
      }}
      onMouseDown={(event) => {
        if (event.button === 1) event.preventDefault();
      }}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          fileTabs.activate(tab.id);
        }
      }}
      className={cn(
        "group/tab relative flex h-full max-w-56 min-w-24 shrink cursor-pointer items-center gap-1.5 rounded-t-md ps-2.5 pe-1 text-sm text-muted-foreground transition-colors outline-none select-none hover:bg-hover hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/40",
        active && "bg-background text-foreground hover:bg-background",
        dragging && "opacity-60",
      )}
    >
      {active && <span className="absolute inset-x-0 top-0 h-0.5 bg-primary" />}
      {dropSide && (
        <span
          className={cn(
            "absolute inset-y-1 w-0.5 bg-primary",
            dropSide === "before" ? "-left-px" : "-right-px",
          )}
        />
      )}
      {loading ? (
        <Loader2 className="size-4 shrink-0 animate-spin" aria-label={t("opening")} />
      ) : (
        <FileTypeIcon type={tab.type} size="sm" className="size-5 rounded-sm [&_svg]:size-3.5" />
      )}
      <span className="min-w-0 flex-1 truncate">{tab.name}</span>
      <TabAvatars tab={tab} active={active} />
      <span className="relative flex size-5 shrink-0 items-center justify-center">
        {tab.unsaved && (
          <span
            role="img"
            aria-label={t("unsaved")}
            className="absolute size-2 rounded-full bg-primary group-focus-within/tab:hidden group-hover/tab:hidden"
          />
        )}
        {/* eslint-disable-next-line no-restricted-syntax -- bespoke: the close button inside a tab */}
        <button
          type="button"
          aria-label={t("closeTab")}
          title={`${t("closeTab")} (${tabKeymap.label("tab.close")})`}
          onClick={(event) => {
            event.stopPropagation();
            void closeTab(tab.id);
          }}
          className={cn(
            "flex size-5 cursor-pointer items-center justify-center rounded-sm text-muted-foreground outline-none hover:bg-hover hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/40",
            tab.unsaved
              ? "invisible group-focus-within/tab:visible group-hover/tab:visible"
              : "opacity-0 group-focus-within/tab:opacity-100 group-hover/tab:opacity-100",
            active && !tab.unsaved && "opacity-100",
          )}
        >
          <X className="size-3.5" />
        </button>
      </span>
    </div>
  );
}
