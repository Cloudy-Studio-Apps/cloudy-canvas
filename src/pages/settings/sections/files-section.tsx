import { useEffect, useId, useState } from "react";
import { Copy, FolderOpen, Trash2 } from "lucide-react";

import { clipboard, revealFile, storage } from "@platform";
import { useAutosaveStore } from "@shared/stores/autosave-store";
import { useRecentFilesStore } from "@shared/stores/recent-files-store";
import { notifyError, toast } from "@shared/stores/toast-store";
import { Button } from "@shared/ui/components/ui/button";
import { Switch } from "@shared/ui/components/ui/switch";
import { SettingsSection } from "../components/settings-section";

export function FilesSection() {
  const count = useRecentFilesStore((s) => s.files.length);
  const refresh = useRecentFilesStore((s) => s.refresh);
  const clear = useRecentFilesStore((s) => s.clear);
  const [location, setLocation] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);
  const autosave = useAutosaveStore((s) => s.enabled);
  const setAutosave = useAutosaveStore((s) => s.setEnabled);
  const autosaveId = useId();

  useEffect(() => {
    void refresh();
    void storage.indexLocation().then(setLocation);
  }, [refresh]);

  const copyLocation = (path: string) =>
    void clipboard.writeText(path).then(
      () => toast({ title: "Path copied", description: path }),
      (error: unknown) => notifyError("Couldn't copy to the clipboard", error),
    );
  const showLocation = (path: string) =>
    void revealFile(path).catch((error: unknown) =>
      notifyError("The folder couldn't be opened", error),
    );

  return (
    <SettingsSection
      id="files"
      title="Files & storage"
      description="Boards and designs are saved wherever you choose. The app only remembers which ones you opened."
    >
      <div className="space-y-5">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-0.5">
            <label htmlFor={autosaveId} className="text-sm font-medium">
              Autosave
            </label>
            <p className="text-sm text-muted-foreground">
              Saves open files a moment after each change. Boards you haven&apos;t saved yet are
              kept as drafts in the app data folder until you choose where they go.
            </p>
          </div>
          <Switch id={autosaveId} checked={autosave} onCheckedChange={setAutosave} />
        </div>
        <div className="space-y-1.5 border-t pt-4">
          <p className="text-sm font-medium">Recent files list</p>
          {location ? (
            <>
              <p className="rounded-md border bg-surface-sunken px-2.5 py-2 font-mono text-xs break-all text-muted-foreground">
                {location}
              </p>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" onClick={() => showLocation(location)}>
                  <FolderOpen />
                  Show in folder
                </Button>
                <Button variant="ghost" size="sm" onClick={() => copyLocation(location)}>
                  <Copy />
                  Copy path
                </Button>
              </div>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">Kept by the desktop app only.</p>
          )}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-4">
          <div className="space-y-0.5">
            <p className="text-sm font-medium">
              {count === 1 ? "1 recent file" : `${count} recent files`}
            </p>
            <p className="text-sm text-muted-foreground">
              Clearing the list leaves the files on disk and keeps drafts.
            </p>
          </div>
          {confirming ? (
            <div className="flex items-center gap-2">
              <span className="text-sm">Clear {count === 1 ? "1 file" : `${count} files`}?</span>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => {
                  setConfirming(false);
                  void clear();
                }}
              >
                Clear
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setConfirming(false)}>
                Cancel
              </Button>
            </div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              disabled={count === 0}
              onClick={() => setConfirming(true)}
              className="text-destructive"
            >
              <Trash2 />
              Clear recent files
            </Button>
          )}
        </div>
      </div>
    </SettingsSection>
  );
}
