import { useId } from "react";

import { CommitInput } from "@canvas-ui";
import { useCollaborationStore } from "@shared/stores/collaboration-store";
import { SettingsSection } from "../../components/settings-section";
import { RelayServerSettings } from "./relay-server-settings";

export function CollaborationSection() {
  const name = useCollaborationStore((s) => s.name);
  const setName = useCollaborationStore((s) => s.setName);
  const nameId = useId();

  return (
    <SettingsSection
      id="collaboration"
      title="Collaboration"
      description="Share an open board or design live: your app hosts it, and the people you let in edit it with you until you stop."
    >
      <div className="space-y-5">
        <div className="space-y-1.5">
          <label htmlFor={nameId} className="text-sm font-medium">
            Your name
          </label>
          <p className="text-sm text-muted-foreground">Shown to others in live sessions.</p>
          <CommitInput
            id={nameId}
            value={name}
            onCommit={(value) => (value.trim() ? setName(value) : "Enter a name")}
            placeholder="Your name"
            maxLength={40}
            className="max-w-xs"
          />
        </div>
        <div className="border-t pt-4">
          <RelayServerSettings />
        </div>
      </div>
    </SettingsSection>
  );
}
