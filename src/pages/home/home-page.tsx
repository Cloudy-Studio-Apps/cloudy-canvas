import { useEffect, useMemo } from "react";
import { useNavigate } from "react-router";

import { createId, type FileInfo, type FileType } from "@shared/core";
import { useRecentFilesStore } from "@shared/stores/recent-files-store";
import { useHotkey } from "@shared/ui/hooks/use-hotkey";
import { PageContainer } from "@shared/ui/layout/page-container";
import { ContinueSection } from "./components/continue-section";
import { DropOverlay } from "./components/drop-overlay";
import { RecentFiles } from "./components/recent-files";
import { StartersRow } from "./components/starters-row";
import { TopBar } from "./components/top-bar";
import { Welcome } from "./components/welcome";
import { useFileKindOf } from "./file-kind";
import { OPEN_FILE_SHORTCUT, SETTINGS_SHORTCUT } from "./home-shortcuts";
import { useFileDragOver } from "@shared/ui/hooks/use-file-drag-over";
import { useOpenFile } from "./use-open-file";

export function HomePage() {
  const navigate = useNavigate();
  const recentFiles = useRecentFilesStore((s) => s.files);
  const missingFiles = useRecentFilesStore((s) => s.missing);
  const refreshRecents = useRecentFilesStore((s) => s.refresh);
  const openFile = useOpenFile();
  const draggingFiles = useFileDragOver();
  const kindOf = useFileKindOf();

  // The Continue card shows the last file that's still there; the rest are listed below it.
  const hero = useMemo(
    () => recentFiles.find((file) => !missingFiles.has(file.id)) ?? null,
    [recentFiles, missingFiles],
  );
  const others = useMemo(() => recentFiles.filter((file) => file !== hero), [recentFiles, hero]);

  const createFile = (type: FileType, mode?: string) =>
    navigate(`/${type}/${createId()}${mode ? `?mode=${mode}` : ""}`);
  const openRecent = (file: FileInfo) => navigate(`/${file.type}/${file.id}`);

  // Re-check on focus too: a file moved back (or away) while the app was in the background.
  useEffect(() => {
    void refreshRecents();
    const onFocus = () => void refreshRecents();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [refreshRecents]);

  useHotkey(OPEN_FILE_SHORTCUT, () => void openFile());
  useHotkey(SETTINGS_SHORTCUT, () => void navigate("/settings"));

  return (
    <div className="flex min-h-full flex-col">
      <TopBar />
      <PageContainer as="main" className="flex-1 space-y-12 pt-10 pb-16 sm:pt-12">
        {recentFiles.length === 0 ? (
          <>
            <Welcome
              onCreate={(type, mode) => void createFile(type, mode)}
              onOpenFile={() => void openFile()}
            />
            <StartersRow />
          </>
        ) : (
          <>
            <ContinueSection
              hero={hero}
              next={others}
              kindOf={kindOf}
              onOpen={(file) => void openRecent(file)}
              onCreate={(type, mode) => void createFile(type, mode)}
              onOpenFile={() => void openFile()}
            />
            {others.length > 0 && (
              <RecentFiles
                files={others}
                missing={missingFiles}
                kindOf={kindOf}
                onOpen={(file) => void openRecent(file)}
              />
            )}
          </>
        )}
      </PageContainer>
      {draggingFiles && <DropOverlay />}
    </div>
  );
}
