import { useEffect, useMemo, useSyncExternalStore } from "react";

import { DOCUMENT_TOKENS } from "@canvas";
import { useService } from "@canvas-ui";
import { wizardColors } from "../..";
import { useColorWizardStore, wizardRoles } from "../store";
import { AddedRow } from "./added-row";
import { RoleRow } from "./role-row";
import { RolesOptions } from "./roles-options";

/** Step 2: each color's role (its variable group) and what the options add. */
export function RolesStep() {
  const tokens = useService(DOCUMENT_TOKENS);
  const version = useSyncExternalStore(tokens.subscribe, tokens.getVersion);
  const palette = useColorWizardStore((s) => s.palette);
  const roles = useColorWizardStore((s) => s.roles);
  const options = useColorWizardStore((s) => s.options);
  const collection = useColorWizardStore((s) => s.collection);
  const set = useColorWizardStore((s) => s.set);
  // The roles become editable once shown: made from the palette when it changed.
  useEffect(() => {
    if (roles.length !== palette.length)
      set({ roles: wizardRoles(useColorWizardStore.getState()) });
  }, [roles.length, palette.length, set]);
  const existing = useMemo(() => {
    const store = tokens.store();
    const record = store.collections().find((c) => c.name === collection);
    return new Set(
      record
        ? store
            .generators()
            .filter((g) => g.collectionId === record.id)
            .map((g) => g.group)
        : [],
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps -- read again when the tokens' version bumps
  }, [tokens, collection, version]);
  const added = wizardColors(roles, options).filter((c) => c.added);
  return (
    <div className="grid h-full min-h-0 grid-cols-1 overflow-auto md:grid-cols-[minmax(0,1fr)_320px] md:overflow-hidden">
      <div className="overflow-auto px-4 py-3.5">
        <div className="flex items-baseline justify-between">
          <span className="text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
            Your colors
          </span>
          <span className="text-xs text-muted-foreground">
            Names become variable groups: <code>primary/500</code>
          </span>
        </div>
        {roles.map((role, i) => (
          <RoleRow key={i} role={role} index={i} exists={existing.has(role.name)} />
        ))}
        {added.length > 0 && (
          <>
            <div className="mt-4 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
              Added by the options
            </div>
            {added.map((c) => (
              <AddedRow key={c.name} color={c} exists={existing.has(c.name)} />
            ))}
          </>
        )}
      </div>
      <aside className="overflow-auto border-t border-border px-4 py-3.5 md:border-t-0 md:border-l">
        <RolesOptions />
      </aside>
    </div>
  );
}
