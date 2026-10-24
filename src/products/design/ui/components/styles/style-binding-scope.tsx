import { useMemo } from "react";

import { DOCUMENT_TOKENS } from "@canvas";
import { useDesignEngine } from "@design/ui/design-engine-context";
import { FieldBindingScopeContext } from "@design/ui/hooks";
import type { FieldBindingScope } from "@design/ui/hooks";
import type { StyleBindingScopeProps } from "./styles.types";

const NO_MODES = {};

/**
 * Makes the fields inside a style's editor bind parts of the style to variables (its
 * `bindings`) instead of the selected layers' fields; the layers using it follow.
 */
export function StyleBindingScope({ style, fieldOf, children }: StyleBindingScopeProps) {
  const engine = useDesignEngine();
  const scope = useMemo<FieldBindingScope>(
    () => ({
      binding: (paths) => {
        const ids = new Set(paths.map((path) => style.bindings?.[path]));
        const bound = ids.has(undefined)
          ? ids.size > 1
            ? null
            : undefined
          : ids.size === 1
            ? [...ids][0]
            : null;
        const field = paths[0] === undefined ? undefined : fieldOf(paths[0]);
        return {
          field: paths.every((path) => fieldOf(path)) ? field : undefined,
          bound,
          modes: NO_MODES,
          bind: (variableId) => {
            const tokens = engine.service(DOCUMENT_TOKENS);
            engine.doc.checkpoint();
            engine.doc.batch(() => {
              for (const path of paths) {
                tokens.bindStyleField(style.id, path, variableId, { checkpoint: false });
              }
            });
          },
        };
      },
    }),
    [engine, style, fieldOf],
  );
  return (
    <FieldBindingScopeContext.Provider value={scope}>{children}</FieldBindingScopeContext.Provider>
  );
}
