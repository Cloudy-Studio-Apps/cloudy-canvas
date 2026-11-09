import { ActiveTabOnly } from "../tabs/active-tab-only";
import { useEditorPoint } from "./editor-modules-context";
import type { SessionHookProps } from "./editor-points.types";

/**
 * Runs the modules' session hooks and draws their overlays while an editor is open. Place it
 * inside the engine's context. The modules never change while it's mounted, so the hooks are
 * always called in the same order. The hooks run in every mounted editor (agents work on the
 * engine of a tab in the background), the overlays only in the tab on screen: they're UI, and
 * many follow app-wide stores that would open them in every editor of the product.
 */
export function ModuleSession() {
  const hooks = useEditorPoint((points) => points.sessionHooks);
  const overlays = useEditorPoint((points) => points.overlays);
  return (
    <>
      {hooks.map((hook) => (
        <SessionHook key={hook.id} hook={hook} />
      ))}
      <ActiveTabOnly>
        {overlays.map(({ id, component: Overlay }) => (
          <Overlay key={id} />
        ))}
      </ActiveTabOnly>
    </>
  );
}

/** One hook in its own component, so each runs with a stable position whatever the others do. */
function SessionHook({ hook }: SessionHookProps) {
  hook.use();
  return null;
}
