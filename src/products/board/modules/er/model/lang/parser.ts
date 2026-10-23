import { DbmlSyntaxError, parseSettings, TokenCursor, tokenize } from "../../../db/schema/dbml";
import { isPlain, unknownSetting } from "./parse-attributes";
import { parseAggregate } from "./parse-aggregate";
import { parseConstraint } from "./parse-constraint";
import { parseEntity } from "./parse-entity";
import { parseIsa } from "./parse-isa";
import { isNotationSetting, readNotationSetting } from "./notation-settings";
import { parseRelation } from "./parse-relation";
import type {
  ErParseResult,
  ParsedEr,
  ParsedErEntity,
  ParsedErRelation,
  RawEntity,
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
  const model: ParsedEr = {
    name: null,
    style: null,
    notation: {},
    entities: [],
    relations: [],
    isas: [],
    aggregates: [],
    constraints: [],
    warnings: [],
  };
  const entities: RawEntity[] = [];
  const relations: RawRelation[] = [];
  for (;;) {
    cursor.skipNewlines();
    if (cursor.atEnd()) break;
    if (cursor.isKeyword("entity")) entities.push(parseEntity(cursor, model.warnings));
    else if (cursor.isKeyword("relation")) relations.push(parseRelation(cursor, model.warnings));
    else if (cursor.isKeyword("isa")) model.isas.push(parseIsa(cursor, model.warnings));
    else if (cursor.isKeyword("aggregate"))
      model.aggregates.push(parseAggregate(cursor, model.warnings));
    else if (cursor.isKeyword("constraint")) model.constraints.push(parseConstraint(cursor));
    else if (cursor.isKeyword("diagram")) parseDiagram(cursor, model);
    else throw cursor.error("Expected Entity, Relation, Isa, Aggregate, Constraint or Diagram");
  }
  model.entities = entities.map(withoutIsa);
  mergeInlineIsa(entities, model);
  const known = new Set([...entities, ...model.aggregates].map((item) => item.name));
  model.relations = relations.map((relation) => sortLines(relation, known));
  return model;
}

function withoutIsa(entity: RawEntity): ParsedErEntity {
  const { name, weak, color, attributes, line } = entity;
  return { name, weak, color, attributes, line };
}

/**
 * `Diagram [name] [style: chen|lollipop, standard: cloudy|chen|elmasri|silberschatz|piattini,
 * cardinality: minmax|ratio, ratio: own|across, participation: numbers|lines|both, isa:
 * arc|circle, crowfeet: on|off]`.
 */
function parseDiagram(cursor: TokenCursor, model: ParsedEr): void {
  cursor.next();
  const named = cursor.peek();
  if (named.kind === "ident" || named.kind === "string") model.name = cursor.next().value;
  if (!cursor.isSymbol("[")) return;
  const at = cursor.peek();
  parseSettings(cursor, (key, hasValue) => {
    if (hasValue && isNotationSetting(key)) {
      const value = cursor.expectName(`a ${key}`).value.toLowerCase();
      const setting = readNotationSetting(key, value);
      if (setting) model.notation = { ...model.notation, ...setting };
      else model.warnings.push(unknownSetting(`${key}: ${value}`, at));
      return true;
    }
    if (key !== "style" || !hasValue) {
      model.warnings.push(unknownSetting(key, at));
      return false;
    }
    const style = cursor.expectName("chen or lollipop").value.toLowerCase();
    if (style === "lollipop") model.style = "lollipop";
    else if (style === "chen") model.style = "ellipse";
    else model.warnings.push(unknownSetting(`style: ${style}`, at));
    return true;
  });
}

/** `Entity X [isa: Y]` adds X as a child of Y's hierarchy, creating the hierarchy if needed. */
function mergeInlineIsa(entities: readonly RawEntity[], model: ParsedEr): void {
  for (const entity of entities) {
    if (!entity.isa) continue;
    let isa = model.isas.find((item) => item.parent === entity.isa);
    if (!isa) {
      isa = {
        parent: entity.isa,
        parentMin: "",
        parentMax: "",
        exclusive: false,
        total: false,
        discriminator: null,
        children: [],
        line: entity.line,
      };
      model.isas.push(isa);
    }
    if (!isa.children.some((child) => child.entity === entity.name)) {
      isa.children.push({ entity: entity.name, min: "", max: "", line: entity.line });
    }
  }
}

/**
 * A line is a participant when it has a cardinality, a role or an arrow, or plainly names an entity
 * or aggregation; anything else (or anything written with `attr`) is an attribute of the relation.
 * Participants may name entities that don't exist yet; see `add-missing-entities.ts`.
 */
function sortLines(relation: RawRelation, known: ReadonlySet<string>): ParsedErRelation {
  const result: ParsedErRelation = {
    name: relation.name,
    identifying: relation.identifying,
    idMark: relation.idMark,
    color: relation.color,
    participants: [],
    attributes: [],
    line: relation.line,
  };
  for (const { attribute, cardinality, role, arrow, via, forcedAttribute } of relation.lines) {
    const named = isPlain(attribute) && known.has(attribute.name);
    if (forcedAttribute || (!cardinality && !role && !arrow && !via && !named)) {
      result.attributes.push(attribute);
      continue;
    }
    result.participants.push({
      entity: attribute.name,
      via,
      min: cardinality?.min ?? "",
      max: cardinality?.max ?? "",
      role,
      arrow,
      line: attribute.line,
    });
  }
  return result;
}
