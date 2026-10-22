import { useNavigate, useParams } from "react-router";
import { ArrowLeft } from "lucide-react";

import { FileTypeIcon } from "@shared/ui/components/file-type-icon";
import { Button } from "@shared/ui/components/ui/button";
import { useHotkey } from "@shared/ui/hooks/use-hotkey";

const ESCAPE = { key: "Escape" };

/**
 * `/design/:id`. Placeholder until the design editor exists; it will mount a `CanvasEngine` with
 * `designProduct`, like the board editor does with `getBoardProduct()`.
 */
export function DesignEditorPage() {
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
        <FileTypeIcon type="design" size="lg" />
        <div className="space-y-1">
          <h1 className="text-xl font-semibold tracking-tight">Editor coming soon</h1>
          <p className="text-sm text-muted-foreground">The design editor isn't built yet.</p>
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
