import { defineCodeTarget } from "../define-code-target";
import { postgresDialect } from "./postgres.dialect";
import { writeDdl } from "./write-ddl";

/** PostgreSQL: one DDL script (`CREATE TYPE`, `CREATE TABLE`, indexes, `COMMENT ON`). */
export const postgresTarget = defineCodeTarget({
  id: "postgres",
  label: "PostgreSQL",
  profiles: [{ id: "18", label: "PostgreSQL 18", flags: {} }],
  options: [],
  generate: (schema, request) => writeDdl(schema, postgresDialect, request),
});
