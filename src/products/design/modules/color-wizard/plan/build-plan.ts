import type { TokenStore } from "@canvas";

import { buildTheme, shadesOf, wizardColors } from "../theme";
import { wizardTypeSteps } from "../type";
import { THEME_COLLECTION } from "./constants";
import type { PlannedCollection, PlannedVariable, WizardInput, WizardPlan } from "./plan.types";

/** The names a collection already has (none when it doesn't exist yet). */
function namesIn(store: TokenStore, collection: string): Set<string> {
  const record = store.collections().find((c) => c.name === collection);
  return new Set(record ? store.variables(record.id).map((v) => v.name) : []);
}

/** What `applyWizard` will write, without writing it. */
export function buildWizardPlan(store: TokenStore, input: WizardInput): WizardPlan {
  const colors = wizardColors(input.roles, input.options);
  const known = namesIn(store, input.collection);
  const action = (taken: Set<string>, name: string) => (taken.has(name) ? "update" : "create");
  const palette: PlannedVariable[] = colors.flatMap((c) =>
    input.options.shades
      ? shadesOf(c.hex).map((s) => ({
          name: `${c.name}/${s.stop}`,
          aliases: [s.hex],
          hexes: [s.hex],
          action: action(known, `${c.name}/${s.stop}`),
        }))
      : [{ name: c.name, aliases: [c.hex], hexes: [c.hex], action: action(known, c.name) }],
  );
  const collections: PlannedCollection[] = [
    { name: input.collection, modes: ["Value"], variables: palette },
  ];
  const theme = buildTheme(colors, input.options, input.overrides);
  if (input.options.theme && theme.tokens.length) {
    const themeKnown = namesIn(store, THEME_COLLECTION);
    collections.push({
      name: THEME_COLLECTION,
      modes: theme.modes,
      variables: theme.tokens.map((t) => ({
        name: t.name,
        aliases: theme.modes.map((m) =>
          t.values[m]?.role === "auto" ? "auto" : (t.values[m]?.alias ?? ""),
        ),
        hexes: theme.modes.map((m) => t.values[m]?.hex ?? ""),
        action: action(themeKnown, t.name),
      })),
    });
  }
  const variables = collections.flatMap((c) => c.variables);
  return {
    collections,
    textStyles: input.type ? wizardTypeSteps(input.type) : [],
    bindings: input.bindFills ? colors.reduce((n, c) => n + (c.fills?.length ?? 0), 0) : 0,
    created: variables.filter((v) => v.action === "create").length,
    updated: variables.filter((v) => v.action === "update").length,
  };
}
