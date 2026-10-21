import { useCallback, useEffect } from "react";
import { useNavigate } from "react-router";
import { FolderOpen } from "lucide-react";

import { createId, type FileInfo, type FileType } from "@core";
import { openCanvasFileDialog } from "@platform";
import { useRecentFilesStore } from "@stores/recent-files-store";
import { Button } from "@ui/components/ui/button";
import { CreateCard } from "./components/create-card";
import { RecentFiles } from "./components/recent-files";
import { TopBar } from "./components/top-bar";

export function HomePage() {
  const navigate = useNavigate();
  const recentFiles = useRecentFilesStore((s) => s.files);

  const createFile = (type: FileType) => navigate(`/${type}/${createId()}`);
  const openRecent = (file: FileInfo) => navigate(`/${file.type}/${file.id}`);

  const openFile = useCallback(async () => {
    try {
      const path = await openCanvasFileDialog();
      // TODO: Load the file through Storage once real loading exists.
      if (path) console.log("[home] Selected file:", path);
    } catch (error) {
      console.error("[home] Failed to open file dialog:", error);
    }
  }, []);

  // Ctrl/Cmd+O opens a file, like other desktop apps.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "o") {
        event.preventDefault();
        void openFile();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [openFile]);

  return (
    <div className="flex min-h-full flex-col">
      <TopBar />
      <main className="mx-auto w-full max-w-6xl flex-1 space-y-14 px-6 pt-10 pb-16 sm:px-10 sm:pt-14">
        <section aria-labelledby="create-heading" className="space-y-5">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="space-y-1">
              <h1 id="create-heading" className="text-2xl font-semibold tracking-tight">
                Create new
              </h1>
              <p className="text-sm text-muted-foreground">
                Start from a blank board or design file.
              </p>
            </div>
            <Button variant="outline" onClick={() => void openFile()} aria-keyshortcuts="Control+O">
              <FolderOpen />
              Open file…
            </Button>
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            <CreateCard
              type="board"
              title="New Board"
              description="Brainstorm, map ideas, sticky notes"
              onSelect={() => createFile("board")}
            />
            <CreateCard
              type="design"
              title="New Design"
              description="Design interfaces and visuals"
              onSelect={() => createFile("design")}
            />
          </div>
        </section>

        <RecentFiles files={recentFiles} onOpen={openRecent} />
      </main>
    </div>
  );
}
