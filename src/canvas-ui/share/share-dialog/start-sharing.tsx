import { useId, useState } from "react";
import { LoaderCircle, Radio } from "lucide-react";

import { shareTransport } from "@platform";
import { useCollaborationStore, hostingRelay } from "@shared/stores/collaboration-store";
import { usePluginsStore } from "@shared/stores/plugins-store";
import { notifyError } from "@shared/stores/toast-store";
import { Button } from "@shared/ui/components/ui/button";
import { Input } from "@shared/ui/components/ui/input";
import { useEngine } from "../../engine-context";
import { useCanvasFile } from "../../file";
import { startSharing } from "../host-session";
import { RelayNote } from "./relay-note";
import type { StartSharingProps } from "./share-dialog.types";

/** Before sharing: what it means, the user's name (asked once), and Start sharing. */
export function StartSharing({ product }: StartSharingProps) {
  const engine = useEngine();
  const file = useCanvasFile();
  const name = useCollaborationStore((s) => s.name);
  const setName = useCollaborationStore((s) => s.setName);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const nameId = useId();
  const chosenName = name || draft.trim();

  const start = async () => {
    if (!shareTransport || !chosenName) return;
    if (!name) setName(chosenName);
    setBusy(true);
    try {
      const state = useCollaborationStore.getState();
      await startSharing(file.id, {
        doc: engine.doc,
        transport: shareTransport,
        relay: hostingRelay(state),
        file: { product, fileId: file.id, fileName: file.name, plugins: activePlugins(product) },
        identity: { name: chosenName, color: state.color },
        appVersion: __APP_VERSION__,
      });
    } catch (error) {
      notifyError("Couldn't start sharing", error);
    } finally {
      setBusy(false);
    }
  };

  if (!shareTransport) {
    return (
      <p className="px-4 py-4 text-sm text-muted-foreground">Live sessions need the desktop app.</p>
    );
  }

  return (
    <div className="grid gap-4 px-4 py-4">
      <p className="text-sm text-muted-foreground">
        Your app hosts this {file.noun}: people you invite connect to it and edit with you, live. It
        stays on your computer and is saved here; when you stop sharing or close it, they can&apos;t
        see it anymore.
      </p>
      {!name && (
        <div className="space-y-1">
          <label htmlFor={nameId} className="text-sm font-medium">
            Your name
          </label>
          <Input
            id={nameId}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Shown to the people who join"
            maxLength={40}
          />
        </div>
      )}
      <RelayNote />
      <div className="flex justify-end">
        <Button disabled={busy || !chosenName} onClick={() => void start()}>
          {busy ? <LoaderCircle className="animate-spin" /> : <Radio />}
          Start sharing
        </Button>
      </div>
    </div>
  );
}

/** The plugins on for a product, by id: a guest without one can't show its elements. */
function activePlugins(product: string): string[] {
  const { installed, enabled } = usePluginsStore.getState();
  return installed
    .filter((p) => enabled.includes(p.manifest.id) && p.manifest.products.includes(product))
    .map((p) => p.manifest.id);
}
