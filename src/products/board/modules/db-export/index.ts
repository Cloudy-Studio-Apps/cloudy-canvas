// Database schema code export: the schema as framework code (models, migrations, DDL). `model/`
// turns the board's schema into a neutral `CodeSchema`, `code/` holds the naming and writing
// helpers, `targets/` one folder per framework, contributed to `boardCodeTargets`.
export * from "./model";
export * from "./targets";
export { boardCodeTargets } from "./db-export.points";
