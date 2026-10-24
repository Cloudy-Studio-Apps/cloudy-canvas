import { useContext } from "react";

import { setBindings } from "@canvas";
import { DESIGN_TOKEN_CONTEXT, type DesignNode } from "@design";
import { useDesignEngine } from "../design-engine-context";
import { FieldBindingScopeContext } from "./field-binding-scope";
import type { FieldBinding } from "./use-field-binding.types";

const NO_MODES = {};

/**
 * The variable binding of the field at `path` of the selected layers (or of several fields set
 * together, like a padding pair), and how to change it.
 */
export function useFieldBinding(
  nodes: readonly DesignNode[],
  path: string | readonly string[],
): FieldBinding {
  const engine = useDesignEngine();
  const scope = useContext(FieldBindingScopeContext);
  const paths = typeof path === "string" ? [path] : path;
  if (scope) return scope.binding(paths);
  const first = nodes[0];
  const field = first
    ? engine.kinds
        .kindOf(first)
        .bindable(first)
        .find((f) => f.path === paths[0])
    : undefined;
  const everyHasIt =
    field !== undefined &&
    nodes.every((node) => {
      const own = engine.kinds
        .kindOf(node)
        .bindable(node)
        .map((f) => f.path);
      return paths.every((p) => own.includes(p));
    });
  const ids = new Set(nodes.flatMap((node) => paths.map((p) => node.bindings?.[p])));
  const bound = ids.has(undefined)
    ? ids.size > 1
      ? null
      : undefined
    : ids.size === 1
      ? [...ids][0]
      : null;
  return {
    field: everyHasIt ? field : undefined,
    bound,
    modes: first ? DESIGN_TOKEN_CONTEXT.modesOf(engine.doc, first) : NO_MODES,
    bind: (variableId) => {
      engine.doc.checkpoint();
      const ids = nodes.map((node) => node.id);
      engine.doc.batch(() => {
        for (const p of paths) setBindings(engine.doc, ids, p, variableId);
      });
    },
  };
}
