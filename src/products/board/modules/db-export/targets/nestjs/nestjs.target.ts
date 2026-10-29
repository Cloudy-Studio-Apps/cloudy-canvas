import { defineCodeTarget } from "../define-code-target";
import type { CodeWarning } from "../warnings.types";
import { NESTJS_OPTIONS } from "./nestjs-options";
import type { NestProvider } from "./nestjs-provider.types";
import { writePrisma } from "./prisma/write-prisma";
import { NESTJS_PROFILES } from "./profiles";
import { writeTypeorm } from "./typeorm/write-typeorm";

/**
 * NestJS with its ORM (`orm` option): a Prisma schema, or TypeORM entities with validated DTOs.
 * `provider` is the database both write their types for.
 */
export const nestjsTarget = defineCodeTarget({
  id: "nestjs",
  label: "NestJS",
  profiles: NESTJS_PROFILES,
  options: NESTJS_OPTIONS,
  generate(schema, request) {
    const warnings: CodeWarning[] = [];
    const provider: NestProvider = request.options.provider === "mysql" ? "mysql" : "postgresql";
    const files =
      request.options.orm === "typeorm"
        ? writeTypeorm(schema, request, provider, request.options.dtos !== false, warnings)
        : [writePrisma(schema, request, provider, warnings)];
    return { files, warnings };
  },
});
