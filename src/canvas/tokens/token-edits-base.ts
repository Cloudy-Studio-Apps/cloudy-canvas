import type { CanvasDocument } from "../document";
import { DEFAULT_VALUE } from "./default-value";
import { aliasCreatesCycle } from "./resolve-token";
import { parseTokenColor } from "./token-color";
import { TokenStore } from "./token-store";
import type {
  CollectionRecord,
  ModeAxisRecord,
  TokenValue,
  VariableRecord,
  VariableType,
} from "./token.types";

/**
 * What every part of `DocumentTokens` shares: the document, the current tokens, one-step writes,
 * lookups that throw with a message people and agents can act on, value checks and free names.
 */
export abstract class TokenEditsBase {
  constructor(protected readonly doc: CanvasDocument) {}

  store(): TokenStore {
    return TokenStore.of(this.doc);
  }

  // ── Helpers ─────────────────────────────────────────────────────────

  protected write(edit: () => void, checkpoint = true): void {
    if (checkpoint) this.doc.checkpoint();
    this.doc.batch(edit);
  }

  protected requireCollection(id: string): CollectionRecord {
    const collection = this.store().collection(id);
    if (!collection) throw new Error(`No collection with id ${id}.`);
    return collection;
  }

  protected requireAxis(id: string): ModeAxisRecord {
    const axis = this.store().axis(id);
    if (!axis) throw new Error(`No mode axis with id ${id}.`);
    return axis;
  }

  /** The variables varying by an axis. */
  protected onAxis(axisId: string): VariableRecord[] {
    return this.store()
      .variables()
      .filter((v) => v.axisId === axisId);
  }

  /** Where a value for `mode` is stored on a variable, and the axis it then varies by. */
  protected valueKey(
    variable: VariableRecord,
    mode: string,
  ): { key: string; axisId: string | null } {
    const own = variable.axisId ?? null;
    if (mode === DEFAULT_VALUE) return { key: DEFAULT_VALUE, axisId: own };
    const axis = this.store()
      .axes()
      .find((a) => a.modes.some((m) => m.id === mode));
    if (!axis) throw new Error(`No mode with id ${mode}.`);
    if (axis.modes[0]?.id === mode) return { key: DEFAULT_VALUE, axisId: own };
    const hasOverrides = Object.keys(variable.values).some((k) => k !== DEFAULT_VALUE);
    if (own && own !== axis.id && hasOverrides) {
      const by = this.store().axis(own)?.name ?? own;
      throw new Error(`${variable.name} varies by ${by}; clear its values there first.`);
    }
    return { key: mode, axisId: axis.id };
  }

  protected requireVariable(id: string): VariableRecord {
    const variable = this.store().variable(id);
    if (!variable) throw new Error(`No variable with id ${id}.`);
    return variable;
  }

  /** A value fit for a variable of `type` (colors normalized), or throws saying why not. */
  protected checkValue(
    store: TokenStore,
    id: string | null,
    type: VariableType,
    value: TokenValue,
  ): TokenValue {
    if ("alias" in value) {
      const target = store.variable(value.alias);
      if (!target) throw new Error(`No variable with id ${value.alias} to alias.`);
      if (target.type !== type) {
        throw new Error(`A ${type} variable can't alias the ${target.type} ${target.name}.`);
      }
      if (id && aliasCreatesCycle(store, id, target.id)) {
        throw new Error(`Aliasing ${target.name} would make the variables refer to each other.`);
      }
      return { alias: target.id };
    }
    if (type === "color") {
      const color = "color" in value ? parseTokenColor(value.color) : null;
      if (!color) throw new Error("A color variable takes a color like #3A83C9 or #3A83C980.");
      return { color };
    }
    if (type === "string") {
      if (!("string" in value)) throw new Error("A string variable takes a text.");
      return { string: value.string };
    }
    if (type === "boolean") {
      if (!("boolean" in value)) throw new Error("A boolean variable takes true or false.");
      return { boolean: value.boolean };
    }
    if (!("number" in value) || !Number.isFinite(value.number)) {
      throw new Error("A number variable takes a number.");
    }
    return { number: value.number };
  }

  /** `name`, or `name 2`, `name 3`… when it's taken. */
  protected freeName(name: string, taken: readonly string[]): string {
    const used = new Set(taken);
    if (!used.has(name)) return name;
    for (let n = 2; ; n++) {
      const candidate = `${name} ${n}`;
      if (!used.has(candidate)) return candidate;
    }
  }
}

/** A variable with only its default value, varying by no axis. */
export function withoutOverrides(variable: VariableRecord): VariableRecord {
  const base = variable.values[DEFAULT_VALUE];
  return { ...variable, axisId: null, values: base ? { [DEFAULT_VALUE]: base } : {} };
}
