import { ArrowRight } from "lucide-react";

import { displayName } from "@shared/core";
import { Button } from "@shared/ui/kit";
import { KIND_LABEL } from "../file-kind";
import { formatRelativeTime } from "../format-relative-time";
import { useFileActions } from "../use-file-actions";
import { FileActionsMenu } from "./file-actions-menu";
import { FileContextMenu } from "./file-context-menu";
import { FileKindIcon } from "./file-kind-icon";
import { FilePreview } from "./file-preview";
import type { ContinueCardProps } from "./continue-card.types";
import { t } from "../home.i18n";

/** The last file, big, with an Open button and the next recent files under it. */
export function ContinueCard({ file, next, kindOf, onOpen }: ContinueCardProps) {
  const actions = useFileActions({ file, missing: false, onOpen });
  const kind = kindOf(file);
  const name = displayName(file);

  return (
    <FileContextMenu actions={actions}>
      <article className="group grid overflow-hidden rounded-card border bg-surface shadow-soft sm:grid-cols-[1.4fr_1fr]">
        {/* eslint-disable-next-line no-restricted-syntax -- bespoke: the preview opens the file */}
        <button
          type="button"
          tabIndex={-1}
          aria-hidden="true"
          onClick={() => onOpen(file)}
          className="min-h-48 cursor-pointer border-b sm:min-h-60 sm:border-r sm:border-b-0"
        >
          <FilePreview file={file} kind={kind} missing={false} className="size-full" />
        </button>
        <div className="flex min-w-0 flex-col gap-2.5 p-5">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <FileKindIcon kind={kind} size="sm" />
            <time dateTime={file.updatedAt} className="min-w-0 flex-1 truncate">
              {t("card.meta", { type: KIND_LABEL[kind], time: formatRelativeTime(file.updatedAt) })}
            </time>
            <FileActionsMenu actions={actions} label={t("card.more", { name })} />
          </div>
          <h2 className="truncate text-2xl font-semibold tracking-tight" title={name}>
            {name}
          </h2>
          <p className="truncate text-xs text-muted-foreground" title={file.path}>
            {file.draft ? t("card.draftLocation") : file.path}
          </p>
          <div>
            <Button onClick={() => onOpen(file)}>
              {t("continue.open")}
              <ArrowRight />
            </Button>
          </div>
          {next.length > 0 && (
            <ul className="mt-auto space-y-0.5 border-t pt-2.5">
              {next.map((other) => (
                <li key={other.id}>
                  {/* eslint-disable-next-line no-restricted-syntax -- bespoke: a one-line file link */}
                  <button
                    type="button"
                    onClick={() => onOpen(other)}
                    className="flex w-full cursor-pointer items-center gap-2 rounded-md px-1.5 py-1 text-left text-sm outline-none hover:bg-hover focus-visible:ring-[3px] focus-visible:ring-ring/40"
                  >
                    <FileKindIcon
                      kind={kindOf(other)}
                      size="sm"
                      className="size-5 [&_svg]:size-3"
                    />
                    <span className="min-w-0 flex-1 truncate">{displayName(other)}</span>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {formatRelativeTime(other.updatedAt)}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </article>
    </FileContextMenu>
  );
}
