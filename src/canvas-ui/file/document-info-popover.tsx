import type { DocumentMetaPatch } from "@canvas";
import { Popover, PopoverContent, PopoverTrigger } from "@shared/ui/components/ui/popover";
import { cn } from "@shared/ui/lib/utils";
import { CommitInput, CommitTextarea } from "../components/commit-field";
import { useEngine } from "../engine-context";
import { useCanvasFile } from "./canvas-file-context";
import type { DocumentInfoPopoverProps } from "./document-info-popover.types";
import { t } from "./file.i18n";

/** The file's name in the editor's chrome, which opens its title and description. */
export function DocumentInfoPopover({ className, children }: DocumentInfoPopoverProps) {
  const engine = useEngine();
  const file = useCanvasFile();

  const setMeta = (patch: DocumentMetaPatch) => {
    engine.doc.checkpoint();
    engine.doc.setMeta(patch);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        {/* eslint-disable-next-line no-restricted-syntax -- bespoke: the file's name as the popover's trigger */}
        <button
          type="button"
          className={cn(
            "ml-1 flex max-w-56 min-w-0 cursor-pointer items-center gap-1 rounded-md px-1 text-sm font-medium outline-none hover:bg-hover focus-visible:ring-[3px] focus-visible:ring-ring/40",
            className,
          )}
          title={file.description ? `${file.name}\n${file.description}` : file.name}
          aria-label={t("info.trigger", { name: file.name })}
        >
          <h1 className="truncate">{file.name}</h1>
          {children}
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-80 space-y-3">
        <label className="block space-y-1">
          <span className="text-xs font-medium text-muted-foreground">{t("info.title")}</span>
          <CommitInput
            value={file.title}
            placeholder={file.fileName}
            onCommit={(title) => setMeta({ title })}
          />
        </label>
        <label className="block space-y-1">
          <span className="text-xs font-medium text-muted-foreground">{t("info.description")}</span>
          <CommitTextarea
            value={file.description}
            rows={4}
            placeholder={t("info.placeholder", { noun: file.noun })}
            onCommit={(description) => setMeta({ description })}
          />
        </label>
        <p className="truncate text-xs text-muted-foreground" title={file.path ?? undefined}>
          {file.draft ? t("info.draft") : (file.path ?? t("info.unsavedFile"))}
        </p>
      </PopoverContent>
    </Popover>
  );
}
