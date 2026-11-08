import type { LibraryAsset } from "../../document";
import { ofKind } from "../../tokens/exchange/match-import";
import type { GeneratorRecord } from "../../tokens/shade-generator.types";
import type { ScaleRecord } from "../../tokens/scale-generator.types";
import type {
  CollectionRecord,
  ModeAxisRecord,
  ModeDef,
  StyleRecord,
  TokenRecord,
  VariableRecord,
} from "../../tokens/token.types";
import { untaggedRecord } from "../library-tags";
import type { MergeFileAsset, MergePlan } from "./library-merge.types";
import { keptName, sameName } from "./merge-names";

/**
 * How a file's own records and pictures go into a library, when the file is added to its project.
 * `file` is every record of the file (a tag from another project's library is ignored: it's the
 * file's own now), `library` the library's records, `fileName` what a kept-beside record is named
 * after. A record the library has under the same id is the library's and stays out of the plan.
 *
 * - Mode axes match by name, their modes by name; modes missing on the library's axis are added
 *   to it (`newModes`), those missing on the file's arrive with the library's axis.
 * - Collections match by name, so their variables are compared with the library collection's.
 * - A variable (or a style) named like one of the library's of the same type is a clash; named
 *   like one of another type (or like another of the file's going there), it's kept, renamed.
 * - A generator or scale whose variables or base clash or were renamed stays out (`droppedGenerators`).
 * - Pictures match by their bytes' hash (`assetMap`).
 */
export function planLibraryMerge(
  file: readonly TokenRecord[],
  library: readonly TokenRecord[],
  fileAssets: readonly MergeFileAsset[],
  libraryAssets: readonly LibraryAsset[],
  fileName: string,
): MergePlan {
  const libraryIds = new Set(library.map((record) => record.id));
  const own = file.map(untaggedRecord).filter((record) => !libraryIds.has(record.id));
  const plan: MergePlan = {
    added: [],
    clashes: [],
    renamedByType: [],
    axisMap: {},
    modeMap: {},
    collectionMap: {},
    newModes: {},
    droppedGenerators: [],
    assetMap: {},
  };

  const libraryAxes = ofKind<ModeAxisRecord>(library, "axis");
  for (const axis of ofKind<ModeAxisRecord>(own, "axis")) {
    const match = libraryAxes.find((other) => sameName(other.name, axis.name));
    if (!match) {
      plan.added.push(axis);
      continue;
    }
    plan.axisMap[axis.id] = match.id;
    const missing: ModeDef[] = [];
    for (const mode of axis.modes) {
      const same = match.modes.find((other) => sameName(other.name, mode.name));
      if (same) plan.modeMap[mode.id] = same.id;
      else missing.push(mode);
    }
    if (missing.length > 0) {
      plan.newModes[match.id] = [...(plan.newModes[match.id] ?? []), ...missing];
    }
  }

  const libraryCollections = ofKind<CollectionRecord>(library, "collection");
  for (const collection of ofKind<CollectionRecord>(own, "collection")) {
    const match = libraryCollections.find((other) => sameName(other.name, collection.name));
    if (match) plan.collectionMap[collection.id] = match.id;
    else plan.added.push(collection);
  }

  planVariables(plan, own, library, fileName);
  planStyles(plan, own, library, fileName);
  planGenerators(plan, own);

  for (const asset of fileAssets) {
    const same = libraryAssets.find((other) => other.hash === asset.hash);
    if (same) plan.assetMap[asset.id] = same.id;
  }
  return plan;
}

/** Variables by the collection they land in: clashes, renames and the new ones. */
function planVariables(
  plan: MergePlan,
  own: readonly TokenRecord[],
  library: readonly TokenRecord[],
  fileName: string,
): void {
  const libraryVariables = ofKind<VariableRecord>(library, "variable");
  const taken = new Map<string, Set<string>>();
  const namesIn = (collectionId: string) => {
    let names = taken.get(collectionId);
    if (!names) {
      names = new Set(
        libraryVariables.filter((v) => v.collectionId === collectionId).map((v) => v.name),
      );
      taken.set(collectionId, names);
    }
    return names;
  };
  for (const variable of ofKind<VariableRecord>(own, "variable")) {
    const target = plan.collectionMap[variable.collectionId] ?? variable.collectionId;
    const names = namesIn(target);
    const named = libraryVariables.find(
      (v) => v.collectionId === target && v.name === variable.name,
    );
    if (named?.type === variable.type) {
      const bothName = keptName(variable.name, fileName, names);
      names.add(bothName);
      plan.clashes.push({
        fileId: variable.id,
        libraryId: named.id,
        name: variable.name,
        kind: "variable",
        choice: "project",
        bothName,
      });
      continue;
    }
    if (names.has(variable.name)) {
      const newName = keptName(variable.name, fileName, names);
      plan.renamedByType.push({ id: variable.id, newName });
      names.add(newName);
    } else names.add(variable.name);
    plan.added.push(variable);
  }
}

/** Styles: a clash with the library's of the same type and name, renamed beside another type's. */
function planStyles(
  plan: MergePlan,
  own: readonly TokenRecord[],
  library: readonly TokenRecord[],
  fileName: string,
): void {
  const libraryStyles = ofKind<StyleRecord>(library, "style");
  const ownStyles = ofKind<StyleRecord>(own, "style");
  const names = new Set([...libraryStyles, ...ownStyles].map((style) => style.name));
  for (const style of ownStyles) {
    const named = libraryStyles.filter((other) => other.name === style.name);
    const sameType = named.find((other) => other.styleType === style.styleType);
    if (sameType) {
      const bothName = keptName(style.name, fileName, names);
      names.add(bothName);
      plan.clashes.push({
        fileId: style.id,
        libraryId: sameType.id,
        name: style.name,
        kind: "style",
        choice: "project",
        bothName,
      });
      continue;
    }
    if (named.length > 0) {
      const newName = keptName(style.name, fileName, names);
      plan.renamedByType.push({ id: style.id, newName });
      names.add(newName);
    }
    plan.added.push(style);
  }
}

/** Generators and scales come only when what they make and follow came under its own name. */
function planGenerators(plan: MergePlan, own: readonly TokenRecord[]): void {
  const moved = new Set([
    ...plan.clashes.filter((clash) => clash.kind === "variable").map((clash) => clash.fileId),
    ...plan.renamedByType.map((rename) => rename.id),
  ]);
  const variables = ofKind<VariableRecord>(own, "variable");
  const generators = [
    ...ofKind<GeneratorRecord>(own, "generator"),
    ...ofKind<ScaleRecord>(own, "scale"),
  ];
  for (const generator of generators) {
    const made = variables.filter((v) => v.generatorId === generator.id);
    const follows = generator.baseVar !== null && moved.has(generator.baseVar);
    if (follows || made.some((v) => moved.has(v.id))) plan.droppedGenerators.push(generator.id);
    else plan.added.push(generator);
  }
}
