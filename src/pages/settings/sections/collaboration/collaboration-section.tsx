import { useId } from "react";

import { CommitInput } from "@canvas-ui";
import { RELAY_CHOICE_IN_SETTINGS } from "@shared/stores/built-in-relay";
import { useCollaborationStore } from "@shared/stores/collaboration-store";
import { SettingsSection } from "../../components/settings-section";
import { RelayServerSettings } from "./relay-server-settings";
import { RelayStatus } from "./relay-status";
import { t } from "../../settings.i18n";

export function CollaborationSection() {
  const name = useCollaborationStore((s) => s.name);
  const setName = useCollaborationStore((s) => s.setName);
  const nameId = useId();

  return (
    <SettingsSection
      id="collaboration"
      title={t("nav.collaboration")}
      description={t("collaboration.description")}
    >
      <div className="space-y-5">
        <div className="space-y-1.5">
          <label htmlFor={nameId} className="text-sm font-medium">
            {t("collaboration.yourName")}
          </label>
          <p className="text-sm text-muted-foreground">{t("collaboration.nameHint")}</p>
          <CommitInput
            id={nameId}
            value={name}
            onCommit={(value) => (value.trim() ? setName(value) : t("collaboration.enterName"))}
            placeholder={t("collaboration.yourName")}
            maxLength={40}
            className="max-w-xs"
          />
        </div>
        <div className="border-t pt-4">
          {RELAY_CHOICE_IN_SETTINGS ? <RelayServerSettings /> : <RelayStatus />}
        </div>
      </div>
    </SettingsSection>
  );
}
