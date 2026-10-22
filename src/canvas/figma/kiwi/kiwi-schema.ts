import { ByteReader } from "./byte-reader";
import type { KiwiDefinition, KiwiField, KiwiKind, KiwiSchema } from "./kiwi.types";

const KINDS: readonly KiwiKind[] = ["enum", "struct", "message"];
/** Built-in types, by `~type` of a negative type number. */
const BUILT_INS = ["bool", "byte", "int", "uint", "float", "string", "int64", "uint64"];

/** Reads a binary Kiwi schema (Kiwi's `encodeBinarySchema` output). */
export function decodeKiwiSchema(bytes: Uint8Array): KiwiSchema {
  const reader = new ByteReader(bytes);
  const raw: { name: string; kind: KiwiKind; fields: (KiwiField & { typeId: number })[] }[] = [];
  const count = reader.readVarUint();
  for (let i = 0; i < count; i++) {
    const name = reader.readString();
    const kind = KINDS[reader.readByte()];
    if (!kind) throw new Error(`Unknown Kiwi definition kind in "${name}".`);
    const fields: (KiwiField & { typeId: number })[] = [];
    const fieldCount = reader.readVarUint();
    for (let j = 0; j < fieldCount; j++) {
      const fieldName = reader.readString();
      const typeId = reader.readVarInt();
      const isArray = (reader.readByte() & 1) === 1;
      const value = reader.readVarUint();
      fields.push({ name: fieldName, type: null, typeId, isArray, value });
    }
    raw.push({ name, kind, fields });
  }

  const typeName = (id: number): string => {
    const name = id < 0 ? BUILT_INS[~id] : raw[id]?.name;
    if (!name) throw new Error(`Unknown Kiwi type ${id}.`);
    return name;
  };
  const definitions = new Map<string, KiwiDefinition>();
  for (const def of raw) {
    const fields = def.fields.map(({ typeId, ...field }) => ({
      ...field,
      type: def.kind === "enum" ? null : typeName(typeId),
    }));
    definitions.set(def.name, { name: def.name, kind: def.kind, fields });
  }
  return { definitions };
}
