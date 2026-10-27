import { CircleCheck, TriangleAlert } from "lucide-react";

import { PanelSection } from "@design/ui/components/panel";
import { useDesignEngine } from "@design/ui/design-engine-context";
import { useBrochure } from "../hooks/use-brochure";
import { useBrochureIssues } from "../hooks/use-brochure-issues";
import { showPage } from "../page-actions";
import { t } from "../../catalog.i18n";

/** What would print badly, page by page; a click shows the page. */
export function BrochureChecksSection() {
  const engine = useDesignEngine();
  const { pages } = useBrochure();
  const issues = useBrochureIssues();
  if (pages.length === 0) return null;

  return (
    <PanelSection title={t("checks.title")}>
      {issues.length === 0 ? (
        <p className="flex items-center gap-2 text-xs text-muted-foreground">
          <CircleCheck className="size-3.5 text-primary" />
          {t("checks.empty")}
        </p>
      ) : (
        <ul className="flex max-h-60 flex-col gap-1 overflow-y-auto">
          {issues.map((issue) => (
            <li key={`${issue.kind}:${issue.nodeId}`}>
              {/* eslint-disable-next-line no-restricted-syntax -- bespoke: a multi-line check */}
              <button
                type="button"
                className="flex w-full cursor-pointer items-start gap-2 rounded-sm bg-accent-soft px-2 py-1.5 text-left text-xs text-accent-soft-foreground hover:bg-accent-soft/70"
                onClick={() => {
                  const page = pages.find((item) => item.frame.id === issue.frameId);
                  if (page) showPage(engine, page.frame);
                }}
              >
                <TriangleAlert className="mt-px size-3.5 shrink-0" />
                <span>
                  <span className="font-semibold">Page {issue.page}</span> · {issue.message}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </PanelSection>
  );
}
