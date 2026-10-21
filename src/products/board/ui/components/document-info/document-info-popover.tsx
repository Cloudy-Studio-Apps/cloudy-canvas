import type { DocumentMetaPatch } from "@canvas";
import { useEngine } from "@canvas-ui";
import { Popover, PopoverContent, PopoverTrigger } from "@shared/ui/components/ui/popover";
import { useBoardFile } from "../../file";
import { CommitInput } from "../db-panel/commit-input";
import { CommitTextarea } from "../db-panel/commit-textarea";

/** The board's name in the top bar, which opens its title and description. */
export function DocumentInfoPopover() {
  const engine = useEngine();
  const file = useBoardFile();

  const setMeta = (patch: DocumentMetaPatch) => {
    engine.doc.checkpoint();
    engine.doc.setMeta(patch);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="ml-1 max-w-56 cursor-pointer truncate rounded-md px-1 text-sm font-medium outline-none hover:bg-hover focus-visible:ring-[3px] focus-visible:ring-ring/40"
          title={file.description ? `${file.name}\n${file.description}` : file.name}
          aria-label={`${file.name}. Edit title and description`}
        >
          <h1 className="truncate">{file.name}</h1>
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-80 space-y-3">
        <label className="block space-y-1">
          <span className="text-xs font-medium text-muted-foreground">Title</span>
          <CommitInput
            value={file.title}
            placeholder={file.fileName}
            onCommit={(title) => setMeta({ title })}
          />
        </label>
        <label className="block space-y-1">
          <span className="text-xs font-medium text-muted-foreground">Description</span>
          <CommitTextarea
            value={file.description}
            rows={4}
            placeholder="What this board is about"
            onCommit={(description) => setMeta({ description })}
          />
        </label>
        <p className="truncate text-xs text-muted-foreground" title={file.path ?? undefined}>
          {file.draft
            ? "Draft, autosaved in the app. Save to choose a file."
            : (file.path ?? "Not saved yet")}
        </p>
      </PopoverContent>
    </Popover>
  );
}
