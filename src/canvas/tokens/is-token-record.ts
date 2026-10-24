import type { ModeDef, TokenRecord, TokenValue } from "./token.types";

const TYPES = new Set(["color", "number"]);

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isTokenValue(value: unknown): value is TokenValue {
  if (!isObject(value)) return false;
  if ("color" in value) return typeof value.color === "string";
  if ("number" in value) return typeof value.number === "number" && Number.isFinite(value.number);
  if ("alias" in value) return typeof value.alias === "string";
  return false;
}

function isModes(modes: unknown): modes is ModeDef[] {
  return (
    Array.isArray(modes) &&
    modes.every(
      (mode) => isObject(mode) && typeof mode.id === "string" && typeof mode.name === "string",
    )
  );
}

/** Whether stored or pasted data is a token record this version understands. */
export function isTokenRecord(data: unknown): data is TokenRecord {
  if (!isObject(data) || typeof data.id !== "string" || typeof data.order !== "string") {
    return false;
  }
  if (data.kind === "generator") {
    return (
      typeof data.collectionId === "string" &&
      typeof data.group === "string" &&
      typeof data.baseColor === "string" &&
      typeof data.steps === "string" &&
      typeof data.lightest === "number" &&
      typeof data.darkest === "number" &&
      typeof data.fade === "number"
    );
  }
  if (data.kind === "scale") {
    return (
      typeof data.collectionId === "string" &&
      typeof data.group === "string" &&
      typeof data.baseValue === "number" &&
      typeof data.ratio === "number" &&
      typeof data.below === "number" &&
      typeof data.above === "number" &&
      Array.isArray(data.scopes)
    );
  }
  if (data.kind === "axis") {
    return typeof data.name === "string" && isModes(data.modes) && data.modes.length > 0;
  }
  if (data.kind === "collection") {
    return typeof data.name === "string" && (data.modes === undefined || isModes(data.modes));
  }
  if (data.kind === "style") {
    return (
      typeof data.styleType === "string" &&
      typeof data.name === "string" &&
      isObject(data.value) &&
      typeof data.description === "string"
    );
  }
  if (data.kind !== "variable") return false;
  return (
    typeof data.collectionId === "string" &&
    typeof data.name === "string" &&
    typeof data.type === "string" &&
    TYPES.has(data.type) &&
    isObject(data.values) &&
    Object.values(data.values).every(isTokenValue) &&
    Array.isArray(data.scopes) &&
    typeof data.description === "string" &&
    isObject(data.codeSyntax) &&
    typeof data.hidden === "boolean"
  );
}
