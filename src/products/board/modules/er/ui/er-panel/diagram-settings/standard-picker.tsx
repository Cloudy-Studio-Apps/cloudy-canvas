import { ExternalLink } from "lucide-react";

import { ER_STANDARD_LIST, ER_STANDARDS, type ErStandard } from "@board";
import { openExternal } from "@platform";
import { Button } from "@shared/ui/components/ui/button";
import { notifyError } from "@shared/stores/toast-store";
import { ShapeSelect } from "../forms/shape-select";
import type { ErStandardPickerProps } from "./diagram-settings.types";

/**
 * Which standard (textbook or paper) the diagram follows: it draws in its notation and the Check
 * diagram reports what it doesn't have. Shows where it comes from, with a link to read it.
 */
export function ErStandardPicker({ standard, onPick }: ErStandardPickerProps) {
  const info = ER_STANDARDS[standard];
  return (
    <div className="space-y-1.5">
      <ShapeSelect
        aria-label="Standard"
        value={standard}
        options={ER_STANDARD_LIST.map((s) => ({ value: s.id, label: s.label }))}
        className="w-full"
        onChange={(value) => onPick(value as ErStandard)}
      />
      <div className="space-y-1 rounded-md border border-border bg-surface-sunken p-2 text-xs">
        <p>{info.summary}</p>
        <p className="text-muted-foreground">{info.citation}</p>
        {info.approximate && (
          <p className="text-muted-foreground">
            Drawn from secondary sources: check the book for its exact symbols, and adjust the
            settings below if they differ.
          </p>
        )}
        {info.url && (
          <Button
            variant="ghost"
            size="sm"
            className="-ml-2 h-7"
            onClick={() =>
              void openExternal(info.url ?? "").catch((error: unknown) =>
                notifyError("The reference couldn't be opened", error),
              )
            }
          >
            <ExternalLink />
            Open the reference
          </Button>
        )}
      </div>
    </div>
  );
}
