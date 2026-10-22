import { createContext, useContext } from "react";

import type { ExtensionPoint } from "@shared/core";
import type { EditorModules, EditorPoints } from "./editor-points.types";

/** The open editor's modules, provided by its page around the engine's context. */
export const EditorModulesContext = createContext<EditorModules | null>(null);

export function useEditorModules(): EditorModules {
  const modules = useContext(EditorModulesContext);
  if (!modules) throw new Error("useEditorModules must be used inside <EditorModulesContext>.");
  return modules;
}

/**
 * What the modules contributed to one of the editor's points. Modules are loaded before the
 * editor opens and never change, so this needs no subscription.
 */
export function useEditorPoint<T>(
  select: (points: EditorPoints) => ExtensionPoint<T>,
): readonly T[] {
  const { host, points } = useEditorModules();
  return host.get(select(points));
}

/** Like `useEditorPoint`, for components that also work outside a modular editor. */
export function useOptionalEditorPoint<T>(
  select: (points: EditorPoints) => ExtensionPoint<T>,
): readonly T[] {
  const modules = useContext(EditorModulesContext);
  return modules ? modules.host.get(select(modules.points)) : [];
}
