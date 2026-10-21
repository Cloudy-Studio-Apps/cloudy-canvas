import { useNavigate, useParams } from "react-router";
import { ArrowLeft } from "lucide-react";

import type { FileType } from "@core";
import { FileTypeIcon } from "@ui/components/file-type-icon";
import { Button } from "@ui/components/ui/button";
import { useHotkey } from "@ui/hooks/use-hotkey";
import type { EditorPlaceholderPageProps } from "./editor-placeholder-page.types";

const ESCAPE = { key: "Escape" };

const TITLES: Record<FileType, string> = {
  board: "Board",
  design: "Design",
};

// Placeholder until the canvas engine exists. The real editor will mount `CanvasEngine` from @engine here.
export function EditorPlaceholderPage({ type }: EditorPlaceholderPageProps) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  useHotkey(ESCAPE, () => void navigate("/"));

  return (
    <div className="flex min-h-full flex-col">
      <header className="flex h-16 items-center px-4 sm:px-6">
        <Button variant="ghost" onClick={() => void navigate("/")} aria-keyshortcuts="Escape">
          <ArrowLeft />
          Back to home
        </Button>
      </header>
      <main className="flex flex-1 flex-col items-center justify-center gap-4 px-6 pb-24 text-center">
        <FileTypeIcon type={type} size="lg" />
        <div className="space-y-1">
          <h1 className="text-xl font-semibold tracking-tight">Editor coming soon</h1>
          <p className="text-sm text-muted-foreground">
            The {TITLES[type].toLowerCase()} editor isn't built yet.
          </p>
        </div>
        {id && (
          <code className="rounded-md bg-muted px-2 py-1 font-mono text-xs text-muted-foreground">
            {id}
          </code>
        )}
      </main>
    </div>
  );
}
