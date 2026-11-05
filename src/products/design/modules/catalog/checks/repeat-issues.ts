import { isDesignNode } from "../../core";
import { dataIssues, type DataIssue } from "../../data";
import type { DesignWorkspace } from "../../../design-engine.types";
import { repeatRuns, type DesignBrochure } from "../model";
import { t } from "../catalog.i18n";
import type { BrochureIssue } from "./brochure-checks.types";
import { shownNodes } from "./shown-nodes";

/** More pages than this (made and pending) make a heavy export. */
export const MANY_PAGES = 1000;

function dataMessage(issue: DataIssue, name: string): string {
  switch (issue.kind) {
    case "unresolved-token":
      return t("checks.data.unresolved", { name, detail: issue.detail });
    case "text-overflow":
      return t("checks.data.overflow", { name });
    case "too-many-copies":
      return t("checks.data.manyCopies", { name, count: issue.detail });
    case "copies-stacked":
      return t("checks.data.stacked", { name });
    default:
      return t("checks.data.other", { name, detail: issue.detail });
  }
}

/**
 * What a brochure's repeats and data get wrong: the data issues of its pages' layers (read in the
 * page's language and scope), a repeat whose list leaves nothing to print (`empty-source`) and
 * more than `MANY_PAGES` pages, made and pending (`too-many-pages`).
 */
export function repeatIssues(
  workspace: DesignWorkspace,
  brochure: DesignBrochure,
): BrochureIssue[] {
  const { doc, kinds } = workspace;
  const layout = brochure.layout();
  const pages = brochure.pages();
  const label = (page: (typeof pages)[number]) =>
    layout.labels.get(page.slot.id) ?? String(page.number);
  const issues: BrochureIssue[] = [];

  const elements = doc.all();
  const owner = new Map<string, (typeof pages)[number]>();
  for (const page of pages) {
    if (page.pending || page.notPrinted) continue;
    for (const node of shownNodes(page.frame.id, elements)) owner.set(node.id, page);
  }
  if (owner.size > 0) {
    const found = dataIssues(doc, { nodes: [...owner.keys()], kinds });
    for (const issue of found.issues) {
      const page = issue.nodeId ? owner.get(issue.nodeId) : undefined;
      if (!issue.nodeId || !page) continue;
      const node = doc.get(issue.nodeId);
      const name = node && isDesignNode(node) ? node.name : "";
      issues.push({
        kind: "data",
        page: label(page),
        frameId: page.frame.id,
        nodeId: issue.nodeId,
        message: dataMessage(issue, name),
      });
    }
  }

  const record = brochure.record();
  if (record) {
    const expansion = brochure.expansion();
    for (const [id, run] of repeatRuns(record)) {
      const mine = expansion.pages.filter((item) => run.includes(item.from));
      if (mine.length === 0 || mine.some((item) => item.printed)) continue;
      const first = pages.find((page) => page.slot.id === run[0]);
      if (!first) continue;
      const name = record.sections.find((item) => item.id === id)?.name ?? first.frame.name;
      issues.push({
        kind: "empty-source",
        page: label(first),
        frameId: first.frame.id,
        nodeId: first.frame.id,
        message: t("checks.emptySource", { name }),
      });
    }
  }

  const [first] = pages;
  if (first && pages.length > MANY_PAGES) {
    issues.push({
      kind: "too-many-pages",
      page: label(first),
      frameId: first.frame.id,
      nodeId: first.frame.id,
      message: t("checks.tooManyPages", { count: pages.length, max: MANY_PAGES }),
    });
  }
  return issues;
}
