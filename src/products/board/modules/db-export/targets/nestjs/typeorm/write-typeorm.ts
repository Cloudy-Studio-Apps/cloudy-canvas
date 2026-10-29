import type { CodeSchema } from "../../../model";
import type { CodeFile, CodeRequest } from "../../code-target.types";
import { focusTables } from "../../focus-tables";
import type { CodeWarning } from "../../warnings.types";
import type { NestProvider } from "../nestjs-provider.types";
import { nestModel, relationProps } from "../relation-props";
import { writeDtos } from "./write-dto";
import { writeEntity } from "./write-entity";
import { writeEnum } from "./write-enum";

/**
 * TypeORM: an entity per table in its feature folder, its DTOs when `dtos` is on, and the enums
 * in `src/common/enums`. Single mode: the table's entity (and its DTOs).
 */
export function writeTypeorm(
  schema: CodeSchema,
  request: CodeRequest,
  provider: NestProvider,
  dtos: boolean,
  warnings: CodeWarning[],
): CodeFile[] {
  const props = relationProps(schema, nestModel);
  const files: CodeFile[] = [];
  for (const table of focusTables(schema, request)) {
    const own = props.filter(
      (p) => p.relation.from.table === table.name || p.relation.to.table === table.name,
    );
    files.push(writeEntity(table, own, provider, warnings));
    if (dtos) files.push(...writeDtos(table));
  }
  if (request.mode !== "single") files.push(...schema.enums.map(writeEnum));
  return files;
}
