import { useDesignEngine, useDesignState } from "@design/ui/design-engine-context";
import { Button } from "@shared/ui/kit";
import { DetachEverywhere } from "./detach-everywhere";
import { ReplaceWith } from "./replace-with";
import type { TokenUsageProps } from "./token-usage.types";
import { useTokenUsage } from "./use-token-usage";
import { t } from "../../design-ui.i18n";

/**
 * Where a variable or a style is used: layers (directly or through styles), aliases and styles,
 * a button per page selecting its layers (showing that page first), Replace with and Detach.
 */
export function UsageSummary({ id }: TokenUsageProps) {
  const engine = useDesignEngine();
  const scope = useDesignState((state) => state.scope);
  const usage = useTokenUsage(id);
  const parts = [
    usage.layerCount > 0 ? t("tokenUsage.summary.layers", { count: usage.layerCount }) : "",
    usage.aliases.length > 0
      ? t("tokenUsage.summary.aliases", { count: usage.aliases.length })
      : "",
    usage.styles.length > 0 ? t("tokenUsage.summary.styles", { count: usage.styles.length }) : "",
    usage.generators.length > 0
      ? t("tokenUsage.summary.generators", { count: usage.generators.length })
      : "",
  ].filter(Boolean);
  return (
    <div className="flex flex-col gap-2 text-xs">
      <p className="text-muted-foreground">
        {parts.length > 0
          ? t("tokenUsage.summary.usedBy", { parts: parts.join(", ") })
          : t("tokenUsage.summary.unused")}
      </p>
      {usage.byPage.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {usage.byPage.map((page) => (
            <Button
              key={page.pageId}
              variant="outline"
              size="xs"
              onClick={() => {
                if (page.pageId !== scope) engine.setScope(page.pageId);
                engine.select(page.ids);
              }}
            >
              {page.pageId === scope
                ? t("tokenUsage.summary.selectHere", { count: page.ids.length })
                : `${page.name} · ${page.ids.length}`}
            </Button>
          ))}
        </div>
      )}
      <div className="flex flex-wrap gap-1">
        <ReplaceWith id={id} />
        <DetachEverywhere id={id} />
      </div>
    </div>
  );
}
