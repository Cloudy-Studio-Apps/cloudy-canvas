import { useEffect } from "react";
import { useNavigate } from "react-router";

import { createId, type FileInfo, type FileType } from "@shared/core";
import { useRecentFilesStore } from "@shared/stores/recent-files-store";
import { useHotkey } from "@shared/ui/hooks/use-hotkey";
import { PageContainer } from "@shared/ui/layout/page-container";
import { CreateSection } from "./components/create-section";
import { DropOverlay } from "./components/drop-overlay";
import { RecentFiles } from "./components/recent-files";
import { TopBar } from "./components/top-bar";
import { useFileDragOver } from "./use-file-drag-over";
import { useOpenFile } from "./use-open-file";

const OPEN_FILE_SHORTCUT = { key: "o", mod: true };

export function HomePage() {
  const navigate = useNavigate();
  const recentFiles = useRecentFilesStore((s) => s.files);
  const missingFiles = useRecentFilesStore((s) => s.missing);
  const refreshRecents = useRecentFilesStore((s) => s.refresh);
  const openFile = useOpenFile();
  const draggingFiles = useFileDragOver();

  const createFile = (type: FileType) => navigate(`/${type}/${createId()}`);
  const openRecent = (file: FileInfo) => navigate(`/${file.type}/${file.id}`);

  // Re-check on focus too: a file moved back (or away) while the app was in the background.
  useEffect(() => {
    void refreshRecents();
    const onFocus = () => void refreshRecents();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [refreshRecents]);

  // Ctrl/Cmd+O opens a file, like other desktop apps.
  useHotkey(OPEN_FILE_SHORTCUT, () => void openFile());

  return (
    <div className="flex min-h-full flex-col">
      <TopBar />
      <PageContainer as="main" className="flex-1 space-y-14 pt-10 pb-16 sm:pt-14">
        <CreateSection
          onCreate={(type) => void createFile(type)}
          onOpenFile={() => void openFile()}
        />
        <RecentFiles
          files={recentFiles}
          missing={missingFiles}
          onOpen={(file) => void openRecent(file)}
        />
      </PageContainer>
      {draggingFiles && <DropOverlay />}
    </div>
  );
}
