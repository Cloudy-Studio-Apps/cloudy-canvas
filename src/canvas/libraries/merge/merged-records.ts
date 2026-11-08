import { remapValues } from "../../tokens/exchange/remap-values";
import type { TokenRecord } from "../../tokens/token.types";
import { keyBetween } from "../../utils";
import { withoutView } from "../axis-view";
import { untaggedRecord } from "../library-tags";
import type { MergePlan } from "./library-merge.types";
import type { MergedRecords } from "./merged-records.types";

/**
 * What carrying out `plan` (with its clashes' choices) writes to the library: the file's added
 * records in the library's terms (references, axes and modes remapped, renamed where the plan
 * says, new ones ordered after the library's), the library axes with the modes they gain, and how
 * the file's ids and modes map onto the library's.
 */
export function mergedRecords(
  file: readonly TokenRecord[],
  library: readonly TokenRecord[],
  plan: MergePlan,
): MergedRecords {
  const own = new Map(file.map((record) => [record.id, untaggedRecord(record)]));
  const libraryById = new Map(library.map((record) => [record.id, record]));
  const replaced = new Map<string, string>(
    plan.clashes.filter((c) => c.choice === "project").map((c) => [c.fileId, c.libraryId]),
  );
  const renames = new Map<string, string>([
    ...plan.renamedByType.map((r) => [r.id, r.newName] as const),
    ...plan.clashes.filter((c) => c.choice === "both").map((c) => [c.fileId, c.bothName] as const),
  ]);
  const idOf = (id: string) => plan.axisMap[id] ?? plan.collectionMap[id] ?? replaced.get(id) ?? id;
  const modeOf = (id: string) => plan.modeMap[id] ?? id;
  const dropped = new Set(plan.droppedGenerators);
  const orders = new Orders(library);

  const kept = plan.clashes
    .filter((c) => c.choice === "both")
    .flatMap((c) => own.get(c.fileId) ?? []);
  const puts: TokenRecord[] = [];
  for (const record of [...plan.added, ...kept]) {
    const name = renames.get(record.id);
    if (record.kind === "axis") {
      puts.push({ ...withoutView(record), order: orders.next("axis") });
    } else if (record.kind === "collection") {
      const folder = { ...record, order: orders.next("collection") };
      delete folder.modes;
      puts.push(folder);
    } else if (record.kind === "variable") {
      const collectionId = idOf(record.collectionId);
      const source = record.axisId ? own.get(record.axisId) : undefined;
      const variable = {
        ...record,
        collectionId,
        ...remapValues(record, {
          idOf,
          modeOf,
          sourceBase: source?.kind === "axis" ? source.modes[0]?.id : undefined,
          targetBaseOf: (axisId) => {
            const axis = libraryById.get(axisId);
            return axis?.kind === "axis" ? axis.modes[0]?.id : undefined;
          },
        }),
        name: name ?? record.name,
        order:
          collectionId === record.collectionId
            ? record.order
            : orders.next(`variable:${collectionId}`),
      };
      const pairs = record.contrastWith?.map(idOf).filter((id) => id !== record.id);
      if (pairs) variable.contrastWith = [...new Set(pairs)];
      if (record.generatorId && dropped.has(record.generatorId)) variable.generatorId = null;
      puts.push(variable);
    } else if (record.kind === "style") {
      const style = { ...record, name: name ?? record.name };
      style.order = orders.next(`style:${record.styleType}`);
      if (record.bindings) {
        style.bindings = Object.fromEntries(
          Object.entries(record.bindings).map(([path, id]) => [path, idOf(id)]),
        );
      }
      puts.push(style);
    } else if (record.kind === "generator") {
      puts.push({
        ...record,
        collectionId: idOf(record.collectionId),
        baseVar: record.baseVar && idOf(record.baseVar),
        axisId: record.axisId && idOf(record.axisId),
        order: orders.next("generator"),
      });
    } else {
      puts.push({
        ...record,
        collectionId: idOf(record.collectionId),
        baseVar: record.baseVar && idOf(record.baseVar),
        order: orders.next("scale"),
      });
    }
  }
  for (const [axisId, modes] of Object.entries(plan.newModes)) {
    const axis = libraryById.get(axisId);
    if (axis?.kind === "axis") puts.push({ ...axis, modes: [...axis.modes, ...modes] });
  }

  const leaving = [
    ...Object.keys(plan.axisMap),
    ...Object.keys(plan.collectionMap),
    ...replaced.keys(),
    ...dropped,
  ];
  return { puts, idOf, modeOf, leaving };
}

/** Order keys after the library's last, per list (axes, a collection's variables, a style type…). */
class Orders {
  private readonly last = new Map<string, string | null>();

  constructor(private readonly library: readonly TokenRecord[]) {}

  next(list: string): string {
    const last = this.last.has(list) ? (this.last.get(list) ?? null) : this.lastOf(list);
    const order = keyBetween(last, null);
    this.last.set(list, order);
    return order;
  }

  private lastOf(list: string): string | null {
    const [kind, scope] = list.split(":");
    const orders = this.library
      .filter((record) => {
        if (record.kind !== kind) return false;
        if (record.kind === "variable") return record.collectionId === scope;
        if (record.kind === "style") return record.styleType === scope;
        return true;
      })
      .map((record) => record.order)
      .sort();
    return orders.at(-1) ?? null;
  }
}
