import { Button, Tooltip, TooltipContent, TooltipTrigger } from "@shared/ui/kit";
import { notifyError } from "@shared/stores/toast-store";
import { PanelSection } from "@design/ui/components/panel";
import { useDesignEngine } from "@design/ui/design-engine-context";
import type { PropertySectionProps } from "@design/ui/modules";
import { dataCopyTag } from "../../repeat";
import { translatedError } from "../data-tab/error-text";
import { useDataSources } from "../hooks/use-data-sources";
import { copyInfo } from "./copy-info";
import { detachCopies } from "./detach-copies";
import { t } from "../../data.i18n";

/**
 * In the properties panel, for an iterator's copies: the row they show, Edit template (selects
 * the template layer they copy), Select container (the frame holding them) and Detach (they
 * become plain layers). A copy inside another copy, or of a repeat inside a repeated card, can't
 * be detached (`detachBlocker`): the button is disabled and its tooltip says why.
 */
export function DataCopySection({ selection: { nodes } }: PropertySectionProps) {
  const engine = useDesignEngine();
  // The row number comes from the sources: follow their Updates.
  useDataSources();
  const copies = nodes.filter((node) => dataCopyTag(node));
  const first = copies[0];
  const info = first ? copyInfo(engine.doc, first) : null;
  if (!first || !info) return null;
  const blocked =
    copies.map((node) => copyInfo(engine.doc, node)?.blocked).find((reason) => reason) ?? null;
  const detach = () => {
    try {
      detachCopies(engine.doc, copies);
    } catch (error) {
      notifyError(t("copy.detachFailed"), translatedError(error));
    }
  };

  return (
    <PanelSection title={t("copy.title")}>
      <p className="text-xs text-muted-foreground">
        {info.row === null
          ? t("copy.rowHidden", { source: info.source })
          : t("copy.row", { row: info.row, source: info.source })}
      </p>
      <div className="mt-2 flex flex-wrap gap-1.5">
        <Button size="sm" variant="secondary" onClick={() => engine.focusElement(info.template)}>
          {t("copy.edit")}
        </Button>
        <Button size="sm" variant="ghost" onClick={() => engine.focusElement(info.iterator)}>
          {t("copy.container")}
        </Button>
        <Tooltip>
          <TooltipTrigger asChild>
            {/* A disabled button gets no pointer events: the tooltip hangs on its wrapper. */}
            <span className="inline-flex" tabIndex={blocked ? 0 : undefined}>
              <Button size="sm" variant="ghost" disabled={blocked !== null} onClick={detach}>
                {t("copy.detach")}
              </Button>
            </span>
          </TooltipTrigger>
          <TooltipContent className="max-w-56">
            {blocked === "inside-copy"
              ? t("copy.nested")
              : blocked === "repeated-card"
                ? t("copy.inRepeatedCard")
                : t("copy.detachHint")}
          </TooltipContent>
        </Tooltip>
      </div>
    </PanelSection>
  );
}
