import type { StyleguideTemplate } from "../../styleguide.types";
import { paragraphTemplate } from "./paragraph.template";
import { scaleTemplate } from "./scale.template";
import { specimenTemplate } from "./specimen.template";
import { typographyTableTemplate } from "./table.template";

/** The Typography category's templates. */
export const TYPOGRAPHY_TEMPLATES: readonly StyleguideTemplate[] = [
  scaleTemplate,
  specimenTemplate,
  paragraphTemplate,
  typographyTableTemplate,
];
