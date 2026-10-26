import {
  DOCUMENT_TOKENS,
  optionalBoolean,
  optionalString,
  requireVariable,
  tokenName,
} from "@canvas";

import { requireDesign, type DesignAgentTool } from "../../../agent";
import { contrastChecks } from "../contrast";

/** WCAG contrast of the design's color pairs. */
export const contrastTools: DesignAgentTool[] = [
  {
    name: "check_contrast",
    description:
      "WCAG 2 contrast of the design's color pairs, in every mode their colors vary by: pairs " +
      "declared on a variable (contrastWith in create/update_variables) and pairs found by scope " +
      "(text-fill colors on frame/shape-fill colors of the same collection). Grades: AAA (7:1), " +
      "AA (4.5:1), AA large (3:1, large text only), fail. Failing pairs first.",
    inputSchema: {
      type: "object",
      properties: {
        variable: { type: "string", description: "Only the pairs this color is in." },
        failingOnly: { type: "boolean", description: "Only pairs below AA in some mode." },
      },
    },
    run: (host, args) => {
      const { engine } = requireDesign(host);
      const store = engine.service(DOCUMENT_TOKENS).store();
      const ref = optionalString(args, "variable");
      const only = ref ? requireVariable(store, ref).id : null;
      const failing = optionalBoolean(args, "failingOnly") ?? false;
      const checks = contrastChecks(store)
        .filter((check) => !only || check.text === only || check.surface === only)
        .filter((check) => !failing || check.worst === "fail" || check.worst === "AA large");
      return {
        pairs: checks.map((check) => ({
          text: tokenName(store, check.text),
          surface: tokenName(store, check.surface),
          declared: check.declared,
          worst: check.worst,
          modes: check.results.map((result) => ({
            modes: result.label || "current",
            ratio: Math.round(result.ratio * 100) / 100,
            grade: result.grade,
          })),
        })),
      };
    },
  },
];
