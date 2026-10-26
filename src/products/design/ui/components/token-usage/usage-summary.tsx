import { useDesignEngine, useDesignState } from "@design/ui/design-engine-context";
import { Button } from "@shared/ui/kit";
import { DetachEverywhere } from "./detach-everywhere";
import { ReplaceWith } from "./replace-with";
import type { TokenUsageProps } from "./token-usage.types";
import { useTokenUsage } from "./use-token-usage";

function plural(n: number, one: string, many = `${one}s`): string {
  return `${n} ${n === 1 ? one : many}`;
}

/**
 * Where a variable or a style is used: layers (directly or through styles), aliases and styles,
 * a button per page selecting its layers (showing that page first), Replace with and Detach.
 */
export function UsageSummary({ id }: TokenUsageProps) {
  const engine = useDesignEngine();
  const scope = useDesignState((state) => state.scope);
  const usage = useTokenUsage(id);
  const parts = [
    usage.layerCount > 0 ? plural(usage.layerCount, "layer") : "",
    usage.aliases.length > 0 ? plural(usage.aliases.length, "alias", "aliases") : "",
    usage.styles.length > 0 ? plural(usage.styles.length, "style") : "",
    usage.generators.length > 0 ? plural(usage.generators.length, "generator") : "",
  ].filter(Boolean);
  return (
    <div className="flex flex-col gap-2 text-xs">
      <p className="text-muted-foreground">
        {parts.length > 0 ? `Used by ${parts.join(", ")}` : "Not used anywhere"}
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
                ? `Select ${page.ids.length} here`
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
