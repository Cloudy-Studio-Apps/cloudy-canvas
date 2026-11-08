import { Play, Trash2 } from "lucide-react";

import { PanelSection } from "@design/ui/components/panel";
import { CommitInput, useService } from "@canvas-ui";
import { Button, SelectField, SwitchField } from "@shared/ui/kit";
import { DESIGN_PROTOTYPE } from "../../model";
import { t } from "../../prototype.i18n";
import { PLATFORM_ICONS } from "../flows-tab/platform-icons";
import { usePrototypePage } from "../hooks/use-prototype-page";
import { usePrototypeViewStore } from "../stores/prototype-view-store";
import { DeviceFields } from "./device-fields";
import { InteractionRow } from "./interaction-row";
import type { FlowPanelProps } from "./flow-panel.types";

/** The Prototype panel of a picked flow: name, start, device, hotspots; Play and Delete. */
export function FlowPanel({ id }: FlowPanelProps) {
  const prototype = useService(DESIGN_PROTOTYPE);
  const { screens, flows } = usePrototypePage();
  const flow = flows.find((candidate) => candidate.id === id);
  if (!flow) return null;
  const Icon = PLATFORM_ICONS[flow.platform];

  const remove = () => {
    usePrototypeViewStore.getState().selectFlow(null);
    prototype.removeFlow(flow.id);
  };

  return (
    <>
      <div className="flex flex-col gap-0.5 border-b px-3 py-2.5">
        <strong className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
          <Icon className="size-3.5 shrink-0 text-muted-foreground" />
          <span className="truncate">{flow.name}</span>
        </strong>
        <span className="text-xs text-muted-foreground">{t("flow.kind")}</span>
      </div>
      <PanelSection title={t("flow.title")}>
        <div className="flex flex-col gap-2">
          <InteractionRow label={t("flow.name")}>
            <CommitInput
              aria-label={t("flow.name")}
              value={flow.name}
              onCommit={(name) => {
                if (name.trim() === "") return t("flow.nameEmpty");
                prototype.updateFlow(flow.id, { name });
              }}
            />
          </InteractionRow>
          <InteractionRow label={t("flow.startsAt")}>
            <SelectField
              label={t("flow.startsAt")}
              value={flow.start}
              options={screens.map((screen) => ({ value: screen.id, label: screen.name }))}
              onChange={(start) => prototype.updateFlow(flow.id, { start })}
            />
          </InteractionRow>
        </div>
      </PanelSection>
      <PanelSection title={t("device.title")}>
        <DeviceFields flow={flow} />
      </PanelSection>
      <PanelSection title={t("flow.playback")}>
        <div className="flex flex-col gap-2">
          <SwitchField
            label={t("flow.hints")}
            checked={flow.hints}
            onChange={(hints) => prototype.updateFlow(flow.id, { hints })}
          />
          {/* The player arrives later: until then it can't be played. */}
          <Button variant="outline" size="sm" disabled>
            <Play />
            {t("flows.play", { name: flow.name })}
          </Button>
          <Button variant="ghost" size="sm" className="text-destructive" onClick={remove}>
            <Trash2 />
            {t("flow.delete")}
          </Button>
        </div>
      </PanelSection>
    </>
  );
}
