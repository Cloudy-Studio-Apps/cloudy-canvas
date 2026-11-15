import type { McpToolGroup } from "./mcp-tool-group.types";
import { optionalString, stringList } from "./tool-args";
import { VARIANTS_WAIT_MESSAGE } from "./variants";
import type { VariantsAgentHost } from "./variants.mcp.types";

const MIN_VARIANTS = 2;
const MAX_VARIANTS = 6;

/**
 * The tools that let the user pick between variants an agent drew (`variants_choose`,
 * `variants_choice`), whichever product; the app shows the chooser over the agent's tab.
 */
export const variantsTools: McpToolGroup<VariantsAgentHost, unknown> = {
  id: "variants",
  prefix: "variants",
  tools: () => [
    {
      name: "choose",
      scope: "app",
      description:
        "Asks the user to pick one of 2 to 6 variants you drew side by side on the current page " +
        "(top-level elements: design frames, board sections or groups). The app shows a chooser " +
        "over your tab; wait for the answer. Returns { choice: 'one', kept, label, removed, note? } " +
        "(the others were deleted), { choice: 'all', note? } or { choice: 'dismissed' }. If it " +
        "returns { choice: 'pending' }, end your turn: the user will tell you to go on, and " +
        "variants_choice reads their pick.",
      inputSchema: {
        type: "object",
        required: ["ids"],
        properties: {
          ids: {
            type: "array",
            items: { type: "string" },
            minItems: MIN_VARIANTS,
            maxItems: MAX_VARIANTS,
            description: "The ids of the variants, top-level elements on your current page.",
          },
          labels: {
            type: "array",
            items: { type: "string" },
            description: "One short name per id, e.g. 'Dark header'. Defaults to A, B, C…",
          },
          question: {
            type: "string",
            description: "What the user is choosing, shown in the chooser.",
          },
        },
      },
      run: async (host, args) => {
        const ids = stringList(args, "ids");
        if (ids.length < MIN_VARIANTS || ids.length > MAX_VARIANTS) {
          throw new Error(`Give ${MIN_VARIANTS} to ${MAX_VARIANTS} variant ids.`);
        }
        if (new Set(ids).size !== ids.length) throw new Error("Each variant id must be different.");
        const labels = args.labels === undefined ? undefined : stringList(args, "labels");
        if (labels && labels.length !== ids.length) throw new Error("Give one label per id.");
        const question = optionalString(args, "question");
        const pick = await host.chooseVariants({
          ids,
          ...(labels ? { labels } : {}),
          ...(question ? { question } : {}),
        });
        return pick ?? { choice: "pending", message: VARIANTS_WAIT_MESSAGE };
      },
    },
    {
      name: "choice",
      scope: "app",
      description:
        "The user's pick from your last variants_choose: { choice: 'one' | 'all' | 'dismissed', … }, " +
        "or { choice: 'pending' } while they haven't chosen, or { choice: 'none' } if you never asked.",
      inputSchema: { type: "object", properties: {} },
      run: (host) => {
        const pick = host.variantChoice();
        if (pick === null) return { choice: "none" };
        if (pick === "pending") return { choice: "pending", message: VARIANTS_WAIT_MESSAGE };
        return pick;
      },
    },
  ],
};
