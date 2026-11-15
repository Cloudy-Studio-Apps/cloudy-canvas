import { ChevronLeft, ChevronRight, Columns3, X } from "lucide-react";

import { CollaboratorAvatar } from "@shared/collaborators";
import { useCollaboratorsStore } from "@shared/stores/collaborators-store";
import { Button, cn } from "@shared/ui/kit";
import { CommitInput } from "../components/commit-field";
import { ToolButton } from "../components/tool-button";
import { useEngine, useEngineState } from "../engine-context";
import { t } from "../canvas-ui.i18n";
import { useVariantChooser } from "./use-variant-chooser";

/**
 * The bar over an editor while an agent waits for the user to pick one of its variants: flip
 * through them, compare them, keep one or all, with a note for the agent. On another page it
 * only offers to go back to the variants.
 */
export function VariantChooserBar() {
  const engine = useEngine();
  const rulers = useEngineState((state) => state.rulersShown) && engine.view.rulers;
  const chooser = useVariantChooser();
  const agent = useCollaboratorsStore((state) =>
    chooser ? state.collaborators[chooser.request.session] : undefined,
  );
  if (!chooser) return null;
  const { request, present, index, onPage } = chooser;
  const id = present[index];
  const label = id === undefined ? "" : (request.labels[request.ids.indexOf(id)] ?? "");

  return (
    <div
      className={cn(
        "pointer-events-auto absolute left-1/2 z-10 flex max-w-[calc(100%-2rem)] -translate-x-1/2 items-center gap-1.5 rounded-lg border-2 bg-surface py-1 pr-1 pl-1.5 text-sm text-foreground shadow-md",
        rulers ? "top-8" : "top-3",
      )}
      style={agent ? { borderColor: agent.color } : undefined}
      role="dialog"
      aria-label={request.question ?? t("variants.pick")}
    >
      {agent && <CollaboratorAvatar collaborator={agent} />}
      <span className="min-w-0 truncate font-medium">{request.question ?? t("variants.pick")}</span>
      {onPage ? (
        <>
          <span className="flex items-center border-l pl-1.5">
            <ToolButton
              label={t("variants.previous")}
              side="bottom"
              className="size-8"
              disabled={present.length < 2}
              onClick={chooser.previous}
            >
              <ChevronLeft />
            </ToolButton>
            <span className="min-w-16 text-center text-xs whitespace-nowrap text-muted-foreground">
              {present.length > 0
                ? t("variants.position", { label, index: index + 1, count: present.length })
                : "—"}
            </span>
            <ToolButton
              label={t("variants.next")}
              side="bottom"
              className="size-8"
              disabled={present.length < 2}
              onClick={chooser.next}
            >
              <ChevronRight />
            </ToolButton>
            <ToolButton
              label={t("variants.compareAll")}
              side="bottom"
              className="size-8"
              disabled={present.length === 0}
              onClick={chooser.compareAll}
            >
              <Columns3 />
            </ToolButton>
          </span>
          <CommitInput
            value={chooser.note}
            onCommit={(note) => chooser.setNote(note)}
            placeholder={t("variants.notePlaceholder")}
            aria-label={t("variants.notePlaceholder")}
            className="h-8 w-48"
          />
          <Button size="sm" disabled={present.length === 0} onClick={chooser.keepThis}>
            {t("variants.keepThis")}
          </Button>
          <Button size="sm" variant="outline" onClick={chooser.keepAll}>
            {t("variants.keepAll")}
          </Button>
        </>
      ) : (
        <Button size="sm" onClick={chooser.backToPage}>
          {t("variants.back")}
        </Button>
      )}
      <ToolButton
        label={t("variants.close")}
        side="bottom"
        className="size-8"
        onClick={chooser.close}
      >
        <X />
      </ToolButton>
    </div>
  );
}
