import { DbmlSyntaxError, TokenCursor, tokenize } from "../../db/dbml";
import { parseEntity } from "./parse-entity";
import { parseRelation } from "./parse-relation";
import type {
  ErParseResult,
  ParsedEr,
  ParsedErEntity,
  ParsedErRelation,
  RawRelation,
} from "./parser.types";

/** Parses the ER language. Returns the first syntax error instead of throwing. */
export function parseEr(source: string): ErParseResult {
  try {
    return { ok: true, model: parseModel(new TokenCursor(tokenize(source))) };
  } catch (error) {
    if (error instanceof DbmlSyntaxError) return { ok: false, error: error.toError() };
    throw error;
  }
}

function parseModel(cursor: TokenCursor): ParsedEr {
  const entities: ParsedErEntity[] = [];
  const raw: RawRelation[] = [];
  const warnings: ParsedEr["warnings"] = [];
  for (;;) {
    cursor.skipNewlines();
    if (cursor.atEnd()) break;
    if (cursor.isKeyword("entity")) entities.push(parseEntity(cursor, warnings));
    else if (cursor.isKeyword("relation")) raw.push(parseRelation(cursor, warnings));
    else throw cursor.error("Expected Entity or Relation");
  }
  const names = new Set(entities.map((e) => e.name));
  return { entities, relations: raw.map((r) => sortLines(r, names)), warnings };
}

/**
 * A line is a participant when it has a cardinality or a role, or names an entity; anything else
 * is an attribute of the relation.
 */
function sortLines(relation: RawRelation, entities: ReadonlySet<string>): ParsedErRelation {
  const result: ParsedErRelation = {
    name: relation.name,
    identifying: relation.identifying,
    participants: [],
    attributes: [],
    line: relation.line,
  };
  for (const { attribute, cardinality, role } of relation.lines) {
    const plain =
      attribute.key === "none" &&
      !attribute.multivalued &&
      !attribute.derived &&
      attribute.children.length === 0;
    const named = plain && entities.has(attribute.name);
    if (!cardinality && !role && !named) {
      result.attributes.push(attribute);
      continue;
    }
    if (!entities.has(attribute.name)) {
      throw new DbmlSyntaxError(`Unknown entity "${attribute.name}"`, attribute.line, 1);
    }
    result.participants.push({
      entity: attribute.name,
      min: cardinality?.min ?? "",
      max: cardinality?.max ?? "",
      role,
      line: attribute.line,
    });
  }
  return result;
}
