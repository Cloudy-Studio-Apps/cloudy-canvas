import { CircleCheck, CircleX, Info, TriangleAlert } from "lucide-react";

import { useEngine } from "@canvas-ui";
import { cn } from "@shared/ui/kit";
import type { ErCheckListProps } from "./diagram-settings.types";
import { t } from "../../../er.i18n";

const ICONS = { error: CircleX, warning: TriangleAlert, info: Info } as const;

/** The Check diagram's findings; each one selects (and shows) the shape it's about. */
export function ErCheckList({ issues }: ErCheckListProps) {
  const engine = useEngine();
  if (issues.length === 0) {
    return (
      <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <CircleCheck className="size-4 text-success" />
        {t("check.none")}
      </p>
    );
  }
  return (
    <ul className="space-y-0.5">
      {issues.map((issue) => {
        const Icon = ICONS[issue.severity];
        return (
          <li key={`${issue.rule}:${issue.shapeId}:${issue.message}`}>
            {/* eslint-disable-next-line no-restricted-syntax -- bespoke: a multi-line finding */}
            <button
              type="button"
              className="flex w-full items-start gap-1.5 rounded-md px-1.5 py-1 text-left text-xs outline-none hover:bg-hover focus-visible:bg-hover"
              onClick={() => engine.focusElement(issue.shapeId)}
            >
              <Icon
                className={cn(
                  "mt-px size-3.5 shrink-0",
                  issue.severity === "error" && "text-destructive",
                  issue.severity === "warning" && "text-warning",
                  issue.severity === "info" && "text-muted-foreground",
                )}
              />
              {issue.message}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
