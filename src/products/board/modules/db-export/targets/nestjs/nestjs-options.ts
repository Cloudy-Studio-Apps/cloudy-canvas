import type { CodeOption } from "../code-target.types";
import { t } from "../../db-export.i18n";

/** The ORM, the database it talks to and whether TypeORM gets DTOs. */
export const NESTJS_OPTIONS: readonly CodeOption[] = [
  {
    id: "orm",
    kind: "select",
    label: () => t("options.orm"),
    default: "prisma",
    choices: [
      { value: "prisma", label: () => "Prisma" },
      { value: "typeorm", label: () => "TypeORM" },
    ],
  },
  {
    id: "provider",
    kind: "select",
    label: () => t("options.provider"),
    default: "postgresql",
    choices: [
      { value: "postgresql", label: () => "PostgreSQL" },
      { value: "mysql", label: () => "MySQL" },
    ],
  },
  { id: "dtos", kind: "switch", label: () => t("options.dtos"), default: true },
];
