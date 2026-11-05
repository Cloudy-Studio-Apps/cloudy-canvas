import { TriangleAlert } from "lucide-react";

import { useService } from "@canvas-ui";
import { cn } from "@shared/ui/kit";
import { DESIGN_DATA_SOURCES } from "../../model";
import { errorText } from "./error-text";
import { useDataVersion } from "../hooks/use-data-version";
import type { UpdateWarningsLineProps } from "./update-warnings-line.types";

/**
 * What the source's last Update on this device was warned about (a link that stopped reading
 * pages early, keeping the rows it had); nothing when there was nothing.
 */
export function UpdateWarningsLine({ sourceId, className }: UpdateWarningsLineProps) {
  const sources = useService(DESIGN_DATA_SOURCES);
  useDataVersion(sources);
  const warnings = sources.updateWarnings(sourceId);
  if (warnings.length === 0) return null;
  return (
    <div className={cn("flex flex-col gap-0.5 text-xs text-warning", className)}>
      {warnings.map((warning) => (
        <p key={warning} className="flex items-start gap-1">
          <TriangleAlert className="mt-0.5 size-3 shrink-0" />
          <span className="min-w-0 break-words">{errorText(warning)}</span>
        </p>
      ))}
    </div>
  );
}
