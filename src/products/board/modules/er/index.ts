// ER (Chen notation, extended model) diagrams on a board. Each element type has its folder
// (entity, relation, attribute, isa, aggregate, constraint) on the shared `base/`; `model/` is the
// diagrams' logic (ErModel, the ER text language, reconcile, edits and auto-layout) and `links/`
// draws the lines between the elements. The language is documented in `docs/er-language.md`.
// The module (`er.module.ts`) registers them with the tool (E), the ER panel and the agent tools.
export * from "./base";
export * from "./entity";
export * from "./relation";
export * from "./attribute";
export * from "./isa";
export * from "./aggregate";
export * from "./constraint";
export * from "./model";
export { ErLinks } from "./links";
export type * from "./links";
export { ErTool } from "./er.tool";
export { erTools } from "./er.agent-tools";
export * from "./connect";
