import { useEffect } from "react";
import { useNavigate } from "react-router";

import { createId, type FileInfo, type FileType } from "@shared/core";
import { useRecentFilesStore } from "@shared/stores/recent-files-store";
import { useHotkey } from "@shared/ui/hooks/use-hotkey";
import { PageContainer } from "@shared/ui/layout/page-container";
import { CreateSection } from "./components/create-section";
import { RecentFiles } from "./components/recent-files";
import { TopBar } from "./components/top-bar";
import { useOpenFile } from "./use-open-file";

const OPEN_FILE_SHORTCUT = { key: "o", mod: true };

export function HomePage() {
  const navigate = useNavigate();
  const recentFiles = useRecentFilesStore((s) => s.files);
  const refreshRecents = useRecentFilesStore((s) => s.refresh);
  const openFile = useOpenFile();

  const createFile = (type: FileType) => navigate(`/${type}/${createId()}`);
  const openRecent = (file: FileInfo) => navigate(`/${file.type}/${file.id}`);

  useEffect(() => {
    void refreshRecents();
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
        <RecentFiles files={recentFiles} onOpen={(file) => void openRecent(file)} />
      </PageContainer>
    </div>
  );
}
