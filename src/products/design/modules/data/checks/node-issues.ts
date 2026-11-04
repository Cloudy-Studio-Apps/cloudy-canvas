import type { DesignNode } from "../../core";
import { isText, textLayout } from "../../text";
import type { TextNodeElement } from "../../text";
import { planBindings } from "../bindings/plan-bindings";
import { dataFieldsOf } from "../bindings/binding-fields";
import type { BindingContext, DataScope } from "../bindings";
import { sourceOf } from "./source-of";
import type { IssueSink } from "./sink";

/** Whole pixels of slack before a laid-out text counts as taller than its box. */
const SLACK = 1;

/** What a bound layer's data doesn't fit: expressions that read nothing, a fixed text too long. */
export function nodeIssues(
  el: DesignNode,
  scope: DataScope,
  ctx: BindingContext,
  sink: IssueSink,
): void {
  const planned = planBindings(el, scope, ctx);
  if (planned.missing.length > 0) {
    // One issue per source the missing expressions read.
    const bySource = new Map<string | undefined, string[]>();
    for (const expr of planned.missing) {
      const id = sourceOf(scope, expr);
      bySource.set(id, [...(bySource.get(id) ?? []), expr]);
    }
    for (const [sourceId, exprs] of bySource) {
      sink.add({ kind: "unresolved-token", nodeId: el.id, sourceId, detail: exprs.join(", ") });
    }
  }
  if (dataFieldsOf(el).dataText && isText(el) && el.autoResize === "none") {
    overflow(el, planned.patch, sink);
  }
}

function overflow(el: TextNodeElement, patch: Partial<DesignNode> | null, sink: IssueSink): void {
  const shown = patch as Partial<TextNodeElement> | null;
  const text = shown?.text ?? el.text;
  const runs = shown?.runs ?? el.runs;
  const height = textLayout(el, text || " ", runs).h;
  if (height > el.h + SLACK) {
    sink.add({ kind: "text-overflow", nodeId: el.id, detail: `${Math.ceil(height)} > ${el.h}` });
  }
}
