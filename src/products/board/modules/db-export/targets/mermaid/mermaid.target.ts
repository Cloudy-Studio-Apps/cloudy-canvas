import { markdownCodeBlock } from "@shared/core";

import { defineCodeTarget } from "../define-code-target";
import { focusTables } from "../focus-tables";
import { writeErDiagram } from "./write-er-diagram";

/**
 * Mermaid: the schema as an `erDiagram` in a fenced block, ready for a Markdown file. Single mode:
 * the table and its relations, in `<table>.md`.
 */
export const mermaidTarget = defineCodeTarget({
  id: "mermaid",
  label: "Mermaid",
  profiles: [{ id: "latest", label: "Mermaid", flags: {} }],
  options: [],
  generate(schema, request) {
    const tables = focusTables(schema, request);
    const name = request.mode === "single" && tables[0] ? tables[0].name : "schema";
    return {
      files: [
        {
          path: `${name}.md`,
          content: markdownCodeBlock("mermaid", writeErDiagram(schema, tables)),
          language: "markdown",
        },
      ],
      warnings: [],
    };
  },
});
