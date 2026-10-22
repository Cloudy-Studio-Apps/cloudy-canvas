import { Gem, Layers, Puzzle, Settings } from "lucide-react";

import { ToolButton } from "@canvas-ui";
import { DesignMainMenu } from "./design-main-menu";
import type { DesignRailProps, DesignRailTab } from "./design-rail.types";

const TABS: { id: DesignRailTab; label: string; icon: typeof Layers }[] = [
  { id: "layers", label: "Layers", icon: Layers },
  { id: "assets", label: "Assets", icon: Gem },
  { id: "plugins", label: "Plugins", icon: Puzzle },
];

/** The narrow strip on the far left: the main menu, the left panel's tabs and settings. */
export function DesignRail({ tab, onTabChange, onHome }: DesignRailProps) {
  return (
    <nav className="flex w-12 shrink-0 flex-col items-center gap-1 border-r bg-surface py-2">
      <DesignMainMenu onHome={onHome} />
      {TABS.map(({ id, label, icon: Icon }) => (
        <ToolButton
          key={id}
          label={label}
          side="bottom"
          active={tab === id}
          onClick={() => onTabChange(id)}
        >
          <Icon />
        </ToolButton>
      ))}
      <div className="flex-1" />
      <ToolButton label="Settings" side="top">
        <Settings />
      </ToolButton>
    </nav>
  );
}
