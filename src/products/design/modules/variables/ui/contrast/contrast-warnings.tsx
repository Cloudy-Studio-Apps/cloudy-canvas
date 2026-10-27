import { useDocumentTokens } from "@canvas-ui";
import { Section } from "@shared/ui/kit";
import { useVariablesWindowStore } from "../window/variables-window-store";
import { GradeBadge } from "./grade-badge";
import { useContrastChecks } from "./use-contrast-checks";
import { t } from "../../variables.i18n";

/**
 * The Variables section's contrast warnings: the pairs that fail (or pass only for large text) in
 * some mode. A click opens the text color in the Variables window. Hidden when all pass.
 */
export function ContrastWarnings() {
  const { store } = useDocumentTokens();
  const issues = useContrastChecks().filter(
    (check) => check.worst === "fail" || check.worst === "AA large",
  );
  if (issues.length === 0) return null;
  const open = (id: string) => {
    const state = useVariablesWindowStore.getState();
    const variable = store.variable(id);
    if (variable) state.showCollection(variable.collectionId);
    state.select(id);
    state.setOpen(true);
  };
  return (
    <Section title={t("contrast.issues", { count: issues.length })} collapsible defaultOpen={false}>
      <div className="flex flex-col gap-1">
        {issues.map((check) => {
          const worst = check.results.find((r) => r.grade === check.worst);
          return (
            <button
              type="button"
              key={`${check.text}|${check.surface}`}
              onClick={() => open(check.text)}
              className="flex items-center gap-2 rounded-md px-1.5 py-1 text-left text-xs hover:bg-muted"
            >
              <span className="min-w-0 flex-1 truncate">
                {t("contrast.textOnSurface", {
                  text: store.variable(check.text)?.name ?? "",
                  surface: store.variable(check.surface)?.name ?? "",
                })}
                {worst?.label ? (
                  <span className="text-muted-foreground"> · {worst.label}</span>
                ) : null}
              </span>
              <span className="font-mono text-muted-foreground">{worst?.ratio.toFixed(1)}</span>
              <GradeBadge grade={check.worst} />
            </button>
          );
        })}
      </div>
    </Section>
  );
}
