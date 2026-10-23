// The design's features as modules: one folder each, whose `<name>.module.ts` plugs it into the
// app (canvas, editor). Only their engine side is exported here; the module files and `ui/` are
// React and are listed by `ui/modules/design-modules.ts`.
export * from "./core";
export * from "./ellipse";
export * from "./frame";
export * from "./group";
export * from "./image";
export * from "./line";
export * from "./pages";
export * from "./polygon";
export * from "./rectangle";
export * from "./section";
export * from "./star";
export * from "./text";
export * from "./vector";
export * from "./mask";
