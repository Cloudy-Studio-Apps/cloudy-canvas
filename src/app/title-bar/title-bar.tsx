import { useFileTabs } from "@canvas-ui";
import { windowChrome } from "@platform";
import { cn } from "@shared/ui/lib/utils";
import { HomeTabButton } from "./home-tab-button";
import { NewTabButton } from "./new-tab-button";
import { SealMenu } from "./seal-menu";
import { TabButton } from "./tab-button";
import { useTabReorder } from "./use-tab-reorder";
import { useWindowTitle } from "./use-window-title";
import { WindowControls } from "./window-controls";

/**
 * The window's title bar on desktop: the seal menu, the Home tab, the file tabs and `+`, then
 * empty space that drags the window (double-click maximizes) and the window controls. Where the
 * system draws the controls (macOS) it leaves room for them on the left.
 */
export function TitleBar() {
  const tabs = useFileTabs((s) => s.tabs);
  const activeId = useFileTabs((s) => s.activeId);
  const reorder = useTabReorder();
  useWindowTitle();
  return (
    <div
      role="tablist"
      data-tauri-drag-region
      className={cn(
        "flex h-9 shrink-0 items-stretch border-b bg-surface-sunken",
        windowChrome?.drawsControls === false && "ps-20",
      )}
    >
      <div className="flex shrink-0 items-center" data-tauri-drag-region>
        <SealMenu />
      </div>
      <HomeTabButton active={activeId === null} />
      <div className="flex min-w-0 items-stretch gap-px ps-1">
        {tabs.map((tab) => (
          <TabButton
            key={tab.id}
            tab={tab}
            active={tab.id === activeId}
            dragging={reorder.drag?.id === tab.id}
            dropSide={reorder.dropSideOf(tab.id)}
            rowProps={reorder.rowProps(tab.id)}
          />
        ))}
      </div>
      <div className="flex shrink-0 items-center">
        <NewTabButton />
      </div>
      <div className="min-w-8 flex-1" data-tauri-drag-region />
      <WindowControls />
    </div>
  );
}
