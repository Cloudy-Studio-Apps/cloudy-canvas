import { defineCodeTarget } from "../define-code-target";
import { mysqlDialect } from "./mysql.dialect";
import { writeDdl } from "./write-ddl";

/** MySQL: one DDL script (`CREATE TABLE` with inline enums and comments, indexes). */
export const mysqlTarget = defineCodeTarget({
  id: "mysql",
  label: "MySQL",
  profiles: [{ id: "8.4", label: "MySQL 8.4", flags: {} }],
  options: [],
  generate: (schema, request) => writeDdl(schema, mysqlDialect, request),
});
