// Helpers every code target shares, knowing no framework: naming (cases, inflection, reserved
// words, collisions) and `CodeWriter`.
export type * from "./naming.types";
export { CodeWriter } from "./code-writer";
export { plural, singular } from "./inflect";
export {
  className,
  collisions,
  toCamel,
  toConstant,
  toKebab,
  toPascal,
  toSnake,
  uniqueNames,
  words,
} from "./naming";
export { RESERVED } from "./reserved-words";
