// Catalog: a design's top-level frames as a print brochure's pages (the Catalog mode). The
// brochure record and the service that edits it, the mode with its tools, the print checks, the
// PDF export and the agent tools. The module (`catalog.module.ts`) plugs them in with the UI.
export * from "./brochure";
export * from "./checks";
export * from "./export";
export * from "./mode";
export * from "./model";
export { catalogTools } from "./agent";
