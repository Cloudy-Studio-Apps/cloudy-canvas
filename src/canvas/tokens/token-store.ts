import type { CanvasDocument } from "../document";
import type {
  CollectionRecord,
  ModeAxisRecord,
  StyleRecord,
  TokenRecord,
  VariableRecord,
} from "./token.types";
import type { ScaleRecord } from "./scale-generator.types";
import type { GeneratorRecord } from "./shade-generator.types";

/** The store last built per document, with the tokens version it was built at. */
const built = new WeakMap<CanvasDocument, { version: number; store: TokenStore }>();

function byOrder(a: { order: string; id: string }, b: { order: string; id: string }): number {
  if (a.order !== b.order) return a.order < b.order ? -1 : 1;
  return a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
}

/**
 * A read model of a document's variables and collections: sorted lists, lookups by id and path,
 * and who aliases whom. Built once per change of the tokens (`TokenStore.of`); never mutated.
 */
export class TokenStore {
  private readonly collectionList: CollectionRecord[];
  private readonly variableList: VariableRecord[];
  private readonly styleList: StyleRecord[];
  private readonly axisList: ModeAxisRecord[];
  private readonly generatorList: GeneratorRecord[];
  private readonly scaleList: ScaleRecord[];
  private readonly byId = new Map<string, TokenRecord>();
  private readonly aliasedBy = new Map<string, Set<string>>();

  /** The document's tokens as they are now (shared until they change). */
  static of(doc: CanvasDocument): TokenStore {
    const version = doc.tokensVersion();
    const known = built.get(doc);
    if (known?.version === version) return known.store;
    const store = new TokenStore(doc.tokenRecords());
    built.set(doc, { version, store });
    return store;
  }

  constructor(records: readonly TokenRecord[]) {
    const collections: CollectionRecord[] = [];
    const variables: VariableRecord[] = [];
    const styles: StyleRecord[] = [];
    const axes: ModeAxisRecord[] = [];
    const generators: GeneratorRecord[] = [];
    const scales: ScaleRecord[] = [];
    for (const record of records) {
      this.byId.set(record.id, record);
      if (record.kind === "collection") collections.push(record);
      else if (record.kind === "style") styles.push(record);
      else if (record.kind === "axis") axes.push(record);
      else if (record.kind === "generator") generators.push(record);
      else if (record.kind === "scale") scales.push(record);
      else variables.push(record);
    }
    this.axisList = axes.sort(byOrder);
    this.generatorList = generators.sort(byOrder);
    this.scaleList = scales.sort(byOrder);
    this.styleList = styles.sort(byOrder);
    this.collectionList = collections.sort(byOrder);
    // Variables of a collection that's gone are unreachable.
    this.variableList = variables
      .filter((v) => this.byId.get(v.collectionId)?.kind === "collection")
      .sort(byOrder);
    for (const v of this.variableList) {
      for (const value of Object.values(v.values)) {
        if (!("alias" in value)) continue;
        const users = this.aliasedBy.get(value.alias) ?? new Set();
        users.add(v.id);
        this.aliasedBy.set(value.alias, users);
      }
    }
  }

  /** No variables and no styles. */
  get isEmpty(): boolean {
    return this.variableList.length === 0 && this.styleList.length === 0;
  }

  /** The file's mode axes, in order. */
  axes(): readonly ModeAxisRecord[] {
    return this.axisList;
  }

  axis(id: string): ModeAxisRecord | undefined {
    const record = this.byId.get(id);
    return record?.kind === "axis" ? record : undefined;
  }

  /** The shade generators, in order. */
  generators(): readonly GeneratorRecord[] {
    return this.generatorList;
  }

  generator(id: string): GeneratorRecord | undefined {
    const record = this.byId.get(id);
    return record?.kind === "generator" ? record : undefined;
  }

  /** The number scales, in order. */
  scales(): readonly ScaleRecord[] {
    return this.scaleList;
  }

  scale(id: string): ScaleRecord | undefined {
    const record = this.byId.get(id);
    return record?.kind === "scale" ? record : undefined;
  }

  /** The axes with more than one mode (the only ones people switch). */
  switchableAxes(): readonly ModeAxisRecord[] {
    return this.axisList.filter((axis) => axis.modes.length > 1);
  }

  /** The styles of one type, or all of them, in order. */
  styles(styleType?: string): readonly StyleRecord[] {
    return styleType === undefined
      ? this.styleList
      : this.styleList.filter((s) => s.styleType === styleType);
  }

  style(id: string): StyleRecord | undefined {
    const record = this.byId.get(id);
    return record?.kind === "style" ? record : undefined;
  }

  /** A style by id, or by a name unique among them. */
  findStyle(ref: string): StyleRecord | undefined {
    const direct = this.style(ref);
    if (direct) return direct;
    const matches = this.styleList.filter((s) => s.name === ref);
    return matches.length === 1 ? matches[0] : undefined;
  }

  collections(): readonly CollectionRecord[] {
    return this.collectionList;
  }

  collection(id: string): CollectionRecord | undefined {
    const record = this.byId.get(id);
    return record?.kind === "collection" ? record : undefined;
  }

  /** The variables of one collection, or of all of them, in order. */
  variables(collectionId?: string): readonly VariableRecord[] {
    return collectionId === undefined
      ? this.variableList
      : this.variableList.filter((v) => v.collectionId === collectionId);
  }

  variable(id: string): VariableRecord | undefined {
    const record = this.byId.get(id);
    return record?.kind === "variable" && this.collection(record.collectionId) ? record : undefined;
  }

  byPath(collectionId: string, path: string): VariableRecord | undefined {
    return this.variableList.find((v) => v.collectionId === collectionId && v.name === path);
  }

  /**
   * A variable by id, or by `"Collection/path"` or a path unique across collections (what agents
   * and people type).
   */
  find(ref: string): VariableRecord | undefined {
    const direct = this.variable(ref);
    if (direct) return direct;
    for (const collection of this.collectionList) {
      if (ref.startsWith(`${collection.name}/`)) {
        const found = this.byPath(collection.id, ref.slice(collection.name.length + 1));
        if (found) return found;
      }
    }
    const matches = this.variableList.filter((v) => v.name === ref);
    return matches.length === 1 ? matches[0] : undefined;
  }

  /** Every variable whose alias chain reaches `id` (not `id` itself). */
  aliasDependents(id: string): Set<string> {
    const found = new Set<string>();
    const queue = [id];
    while (queue.length > 0) {
      const next = queue.pop();
      if (next === undefined) break;
      for (const user of this.aliasedBy.get(next) ?? []) {
        if (user === id || found.has(user)) continue;
        found.add(user);
        queue.push(user);
      }
    }
    return found;
  }
}
