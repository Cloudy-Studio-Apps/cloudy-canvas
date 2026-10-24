import { effectiveDpi, LOW_DPI } from "@design";
import { useAssetUrl } from "@canvas-ui";
import { useDesignEngine } from "@design/ui/design-engine-context";
import { Button } from "@shared/ui/components/ui/button";
import { cn } from "@shared/ui/lib/utils";
import { usePictureSize } from "../hooks/use-picture-size";
import { replaceImage } from "../page-actions";
import type { PageImageRowProps } from "./sidebar.types";

/** One picture of a page: what it shows, its size and printed dpi, and Replace. */
export function PageImageRow({ node, paint }: PageImageRowProps) {
  const engine = useDesignEngine();
  const url = useAssetUrl(paint.assetId);
  const size = usePictureSize(paint.assetId);
  const dpi = size && Math.round(effectiveDpi(paint, node, size));

  return (
    <li className="flex items-center gap-2 py-1">
      <span className="size-10 shrink-0 overflow-hidden rounded-xs border bg-surface-sunken">
        {url && <img src={url} alt="" className="size-full object-cover" />}
      </span>
      <span className="min-w-0 flex-1 text-xs">
        <span className="block truncate text-foreground">{node.name}</span>
        {size && dpi !== null && (
          <span
            className={cn("block truncate text-muted-foreground", dpi < LOW_DPI && "text-warning")}
          >
            {size.w} × {size.h} · {dpi} dpi{dpi < LOW_DPI && " · low for print"}
          </span>
        )}
      </span>
      <Button size="sm" variant="outline" onClick={() => void replaceImage(engine, node, paint)}>
        Replace
      </Button>
    </li>
  );
}
