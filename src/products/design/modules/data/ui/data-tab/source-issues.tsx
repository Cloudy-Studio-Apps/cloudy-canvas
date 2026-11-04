import { TriangleAlert } from "lucide-react";

import { useDesignEngine } from "@design/ui/design-engine-context";
import { PanelSection } from "@design/ui/components/panel";
import { Button } from "@shared/ui/kit";
import { issueText } from "./issue-text";
import type { SourceIssuesProps } from "./source-issues.types";
import { t } from "../../data.i18n";

/** What doesn't fit for a source: each issue, with Select for the ones on a layer. */
export function SourceIssues({ issues }: SourceIssuesProps) {
  const engine = useDesignEngine();
  if (issues.length === 0) return null;
  return (
    <PanelSection title={t("issues.title")}>
      <ul className="flex flex-col gap-1.5">
        {issues.map((issue) => {
          const { nodeId } = issue;
          return (
            <li
              key={`${issue.kind}:${issue.nodeId ?? ""}:${issue.detail}`}
              className="flex items-start gap-1 text-xs text-warning"
            >
              <TriangleAlert className="mt-0.5 size-3 shrink-0" />
              <span className="min-w-0 flex-1 break-words">{issueText(issue)}</span>
              {nodeId !== undefined && (
                <Button variant="link" size="xs" onClick={() => engine.focusElement(nodeId)}>
                  {t("issues.select")}
                </Button>
              )}
            </li>
          );
        })}
      </ul>
    </PanelSection>
  );
}
