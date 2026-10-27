import { useNavigate } from "react-router";
import { ArrowLeft, Bot, Save } from "lucide-react";

import {
  CollaboratorUndoButton,
  DocumentInfoPopover,
  FloatingPanel,
  HistoryControls,
  ModuleSlot,
  PanelDivider,
  SaveIndicator,
  ShareButton,
  ToolButton,
  useCanvasFile,
  useEngine,
} from "@canvas-ui";
import { AgentServerMenu } from "@shared/agent-server";
import { CollaboratorStack } from "@shared/collaborators";
import { useAgentServerStore } from "@shared/stores/agent-server-store";
import { openAbout } from "@shared/about";
import { SealLogo } from "@shared/ui/brand/seal-logo";
import { Badge } from "@shared/ui/components/ui/badge";
import { t } from "../board-ui.i18n";

export function BoardTopBar() {
  const navigate = useNavigate();
  const engine = useEngine();
  const file = useCanvasFile();
  const agentsEnabled = useAgentServerStore((state) => state.enabled);

  return (
    <FloatingPanel className="gap-1 pr-2">
      <ToolButton label={t("topBar.backHome")} side="bottom" onClick={() => void navigate("/")}>
        <ArrowLeft />
      </ToolButton>
      <PanelDivider />
      <ToolButton label={t("topBar.about")} side="bottom" onClick={openAbout}>
        <SealLogo size={22} variant="mark" />
      </ToolButton>
      <DocumentInfoPopover />
      <SaveIndicator />
      <Badge variant="board" className="ml-1">
        {t("topBar.badge")}
      </Badge>
      <PanelDivider className="mx-1.5" />
      <HistoryControls />
      {file.live?.side !== "guest" && (
        <ToolButton
          label={
            file.status === "error"
              ? t("topBar.saveFailed")
              : file.draft
                ? t("topBar.saveToFile")
                : t("topBar.save")
          }
          shortcut={engine.keymap.label("save")}
          side="bottom"
          disabled={file.status === "saving"}
          className={file.status === "error" ? "text-destructive" : undefined}
          onClick={() => void file.save()}
        >
          <Save />
        </ToolButton>
      )}
      <PanelDivider className="mx-1.5" />
      <ModuleSlot slot="topBar" />
      <AgentServerMenu
        followable
        agentActions={(agent) => <CollaboratorUndoButton collaborator={agent} />}
        trigger={
          <ToolButton
            label={agentsEnabled ? t("topBar.agentsOn") : t("topBar.agentsOff")}
            side="bottom"
            className={agentsEnabled ? undefined : "text-muted-foreground"}
          >
            <Bot />
          </ToolButton>
        }
      />
      <CollaboratorStack followable className="ml-1" />
      <ShareButton product="board" look="tool" />
    </FloatingPanel>
  );
}
