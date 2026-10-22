import { ByteReader } from "./byte-reader";
import type { KiwiDefinition, KiwiField, KiwiRecord, KiwiSchema, KiwiValue } from "./kiwi.types";

/**
 * Decodes `bytes` as the schema's `root` definition, interpreting the schema (no generated code,
 * so nothing is evaluated). Enums decode to their value's name.
 */
export function decodeKiwi(schema: KiwiSchema, root: string, bytes: Uint8Array): KiwiRecord {
  const reader = new ByteReader(bytes);
  const def = definition(schema, root);
  return readRecord(schema, reader, def);
}

function definition(schema: KiwiSchema, name: string): KiwiDefinition {
  const def = schema.definitions.get(name);
  if (!def) throw new Error(`The Figma file's schema has no "${name}".`);
  return def;
}

function readRecord(schema: KiwiSchema, reader: ByteReader, def: KiwiDefinition): KiwiRecord {
  const record: KiwiRecord = {};
  if (def.kind === "struct") {
    for (const field of def.fields) record[field.name] = readField(schema, reader, field);
    return record;
  }
  for (;;) {
    const id = reader.readVarUint();
    if (id === 0) return record;
    const field = def.fields.find((f) => f.value === id);
    if (!field) throw new Error(`Unknown field ${id} in "${def.name}".`);
    record[field.name] = readField(schema, reader, field);
  }
}

function readField(schema: KiwiSchema, reader: ByteReader, field: KiwiField): KiwiValue {
  const type = field.type ?? "uint";
  if (!field.isArray) return readValue(schema, reader, type);
  if (type === "byte") return reader.readByteArray();
  const length = reader.readVarUint();
  const items: KiwiValue[] = [];
  for (let i = 0; i < length; i++) items.push(readValue(schema, reader, type));
  return items;
}

function readValue(schema: KiwiSchema, reader: ByteReader, type: string): KiwiValue {
  switch (type) {
    case "bool":
      return reader.readBool();
    case "byte":
      return reader.readByte();
    case "int":
      return reader.readVarInt();
    case "uint":
      return reader.readVarUint();
    case "float":
      return reader.readVarFloat();
    case "string":
      return reader.readString();
    case "int64":
      return reader.readVarInt64();
    case "uint64":
      return reader.readVarUint64();
  }
  const def = definition(schema, type);
  if (def.kind !== "enum") return readRecord(schema, reader, def);
  const value = reader.readVarUint();
  return def.fields.find((f) => f.value === value)?.name ?? value;
}
