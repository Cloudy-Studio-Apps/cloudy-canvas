import { erNotation } from "../../base/er-notation";
import type { ErAttributeElement } from "../../attribute/attribute.types";
import type { ErEntityElement } from "../../entity/entity.types";
import { dependencyLetter, type ErRelationElement } from "../../relation";
import type { ErShapes } from "../lang";
import type { ErMermaidNodes } from "./er-mermaid.types";
import { mermaidText } from "./mermaid-text";

const KEY_MARKS: Readonly<Record<ErAttributeElement["key"], string>> = {
  none: "",
  pk: " (PK)",
  partial: " (partial key)",
  alternate: " (AK)",
};

/**
 * A node for each shape, in Mermaid's nearest shape to Chen's: rectangles (double-sided when weak),
 * diamonds, hexagons for associative entities, stadiums for attributes, double circles for
 * multivalued ones, a trapezoid for hierarchies and a circle for unions.
 */
export function erMermaidNodes(shapes: ErShapes): ErMermaidNodes {
  const ids = new Map<string, string>();
  const lines: string[] = [];
  const identifying: string[] = [];
  const derived: string[] = [];
  const add = (prefix: string, shape: { id: string }, write: (id: string) => string) => {
    const id = `${prefix}${ids.size + 1}`;
    ids.set(shape.id, id);
    lines.push(`  ${write(id)}`);
    return id;
  };

  for (const entity of shapes.entities) add("e", entity, (id) => entityNode(id, entity));
  for (const relation of shapes.relations) {
    const id = add("r", relation, (node) => relationNode(node, relation));
    if (relation.identifying) identifying.push(id);
  }
  for (const isa of shapes.isas) {
    add("i", isa, (id) => `${id}[/"ISA (${isa.exclusive ? "d" : "o"})"\\]`);
  }
  for (const union of shapes.unions) add("u", union, (id) => `${id}(("U"))`);
  for (const attribute of shapes.attributes) {
    const id = add("a", attribute, (node) => attributeNode(node, attribute));
    if (attribute.derived) derived.push(id);
  }
  // Subgraphs define themselves, but lines and other shapes point at them by id.
  for (const aggregate of shapes.aggregates) ids.set(aggregate.id, `g${ids.size + 1}`);
  return { ids, lines, identifying, derived };
}

function entityNode(id: string, { name, weak }: ErEntityElement): string {
  const label = `"${mermaidText(name)}"`;
  return weak ? `${id}[[${label}]]` : `${id}[${label}]`;
}

function relationNode(id: string, relation: ErRelationElement): string {
  const marks = erNotation(relation.notation).dependency === "marks";
  const letter = marks ? dependencyLetter(relation) : "";
  const label = `"${mermaidText(letter ? `${relation.name} (${letter})` : relation.name)}"`;
  return relation.associative ? `${id}{{${label}}}` : `${id}{${label}}`;
}

function attributeNode(id: string, attribute: ErAttributeElement): string {
  const optional = attribute.optional ? " (optional)" : "";
  const label = `"${mermaidText(attribute.name + KEY_MARKS[attribute.key] + optional)}"`;
  return attribute.multivalued ? `${id}(((${label})))` : `${id}([${label}])`;
}
