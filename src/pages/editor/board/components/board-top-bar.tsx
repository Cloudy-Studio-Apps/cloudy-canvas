import { useNavigate } from "react-router";
import { ArrowLeft } from "lucide-react";

import { SealLogo } from "@ui/brand/seal-logo";
import { Badge } from "@ui/components/ui/badge";
import { FloatingPanel, PanelDivider } from "./floating-panel";
import { HistoryControls } from "./history-controls";
import { ToolButton } from "./tool-button";

export function BoardTopBar() {
  const navigate = useNavigate();

  return (
    <FloatingPanel className="gap-1 pr-2">
      <ToolButton label="Back to home" side="bottom" onClick={() => void navigate("/")}>
        <ArrowLeft />
      </ToolButton>
      <PanelDivider />
      <SealLogo size={22} variant="mark" />
      <h1 className="ml-1 text-sm font-medium">Untitled board</h1>
      <Badge variant="board" className="ml-1">
        Board
      </Badge>
      <PanelDivider className="mx-1.5" />
      <HistoryControls />
    </FloatingPanel>
  );
}
