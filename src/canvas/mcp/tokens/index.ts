// Reading agents' references to variables, collections and modes, shared by both products' tools.
export { describeAxis, describeCollection, describeVariable } from "./describe-variables";
export { requireToken, tokenName } from "./token-ref";
export {
  findMode,
  readCodeSyntax,
  readScopes,
  readTokenValue,
  requireAxis,
  requireCollection,
  requireMode,
  requireVariable,
  SCOPE_NAMES,
  VARIABLE_TYPES,
} from "./variable-args";
