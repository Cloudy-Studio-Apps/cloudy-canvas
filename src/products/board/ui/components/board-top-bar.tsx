import { useNavigate } from "react-router";
import { ArrowLeft, Bot, Save } from "lucide-react";

import {
  FloatingPanel,
  HistoryControls,
  ModuleSlot,
  PanelDivider,
  ToolButton,
  useEngine,
} from "@canvas-ui";
import { AgentServerMenu } from "@shared/agent-server";
import { useAgentServerStore } from "@shared/stores/agent-server-store";
import { SealLogo } from "@shared/ui/brand/seal-logo";
import { Badge } from "@shared/ui/components/ui/badge";
import { useBoardFile } from "../file";
import { DocumentInfoPopover } from "./document-info";
import { SaveIndicator } from "./save-indicator";

export function BoardTopBar() {
  const navigate = useNavigate();
  const engine = useEngine();
  const file = useBoardFile();
  const agentsEnabled = useAgentServerStore((state) => state.enabled);

  return (
    <FloatingPanel className="gap-1 pr-2">
      <ToolButton label="Back to home" side="bottom" onClick={() => void navigate("/")}>
        <ArrowLeft />
      </ToolButton>
      <PanelDivider />
      <SealLogo size={22} variant="mark" />
      <DocumentInfoPopover />
      <SaveIndicator />
      <Badge variant="board" className="ml-1">
        Board
      </Badge>
      <PanelDivider className="mx-1.5" />
      <HistoryControls />
      <ToolButton
        label={
          file.status === "error"
            ? "Couldn't save. Try again"
            : file.draft
              ? "Save to a file"
              : "Save"
        }
        shortcut={engine.keymap.label("save")}
        side="bottom"
        disabled={file.status === "saving"}
        className={file.status === "error" ? "text-destructive" : undefined}
        onClick={() => void file.save()}
      >
        <Save />
      </ToolButton>
      <PanelDivider className="mx-1.5" />
      <ModuleSlot slot="topBar" />
      <AgentServerMenu
        trigger={
          <ToolButton
            label={agentsEnabled ? "Agents: on" : "Agents: off"}
            side="bottom"
            className={agentsEnabled ? undefined : "text-muted-foreground"}
          >
            <Bot />
          </ToolButton>
        }
      />
    </FloatingPanel>
  );
}
