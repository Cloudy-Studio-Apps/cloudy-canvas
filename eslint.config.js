import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import prettier from "eslint-config-prettier";

import cloudy from "./scripts/eslint/no-literal-ui-text.js";

// Layering (see CLAUDE.md). Each group of folders lists what it may not import. A file gets one
// `no-restricted-imports` rule, so the groups below don't overlap.
const REACT = {
  paths: ["react", "react-dom"].map((name) => ({
    name,
    message: "Engine code must not depend on React.",
  })),
  patterns: [
    { group: ["react/*", "react-dom/*"], message: "Engine code must not depend on React." },
  ],
};
const UI_LAYERS = {
  group: [
    "@shared/ui/*",
    "@shared/stores/*",
    "@shared/agent-server",
    "@shared/collaborators",
    "@canvas-ui",
    "@canvas-ui/*",
    "@pages/*",
    "@app/*",
  ],
  message: "Engine code must not import UI layers.",
};
const PLATFORM = {
  group: ["@platform", "@platform/*", "@tauri-apps/*"],
  message: "Engine code must not import platform code; depend on interfaces in shared/core.",
};
const CANVAS = {
  group: ["@canvas", "@canvas/*", "@canvas-ui", "@canvas-ui/*"],
  message: "shared/ is below the canvas and must not import it.",
};
const PRODUCTS = {
  group: ["@board", "@board/*", "@design", "@design/*"],
  message: "Shared and canvas code must not know about products.",
};
const BOARD = { group: ["@board", "@board/*"], message: "Products must not import each other." };
/** A product's React side: its editor (`ui/`), its modules' `ui/` and their `.module` files. */
const PRODUCT_UI_IMPORTS = {
  group: [
    "@board/ui",
    "@board/ui/*",
    "@board/modules/*/ui/*",
    "@board/modules/*/*.module",
    "@design/ui",
    "@design/ui/*",
    "@design/modules/*/ui/*",
    "@design/modules/*/*.module",
  ],
  message: "Engine code must not import a product's UI (its ui/ folders and .module files).",
};
const DESIGN = { group: ["@design", "@design/*"], message: "Products must not import each other." };

/** The engine owns fractional indexes: everything else uses `keyBetween`/`nKeysBetween`. */
const FRACTIONAL = {
  name: "fractional-indexing",
  message: "Use keyBetween/nKeysBetween from @canvas.",
};

/**
 * A `no-restricted-imports` rule from pattern groups, optionally banning React too. Every rule
 * bans `fractional-indexing`, except `fractional: false` (the one file that wraps it).
 */
function restrict(patterns, { react = false, fractional = true } = {}) {
  const paths = [...(react ? REACT.paths : []), ...(fractional ? [FRACTIONAL] : [])];
  return {
    "no-restricted-imports": [
      "error",
      { paths, patterns: [...(react ? REACT.patterns : []), ...patterns] },
    ],
  };
}

// A module folder (`products/*/modules/<name>/`) is engine code except its `ui/` and the files that
// plug it into the UI: `.module.ts`, `.sections.ts`, `.menu.ts`, `.mode.ts`, `.viewer.ts`.
const PRODUCT_UI = [
  "src/products/*/ui/**/*.{ts,tsx}",
  "src/products/*/modules/*/ui/**/*.{ts,tsx}",
  "src/products/*/modules/*/*.{module,sections,menu,mode,viewer}.ts",
];
/** `PRODUCT_UI` of one product. */
const uiOf = (product) =>
  PRODUCT_UI.map((glob) => glob.replace("products/*", `products/${product}`));

export default tseslint.config(
  {
    ignores: ["dist", "src-tauri/target", "src-tauri/gen"],
  },
  {
    files: ["**/*.{ts,tsx}"],
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
      "@typescript-eslint/consistent-type-imports": "error",
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
    },
  },
  {
    files: ["src/shared/ui/components/ui/**/*.tsx"],
    rules: { "react-refresh/only-export-components": "off" },
  },
  {
    files: ["src/shared/core/**/*.ts"],
    rules: restrict([UI_LAYERS, PLATFORM, CANVAS, PRODUCTS], { react: true }),
  },
  {
    files: ["src/shared/**/*.{ts,tsx}"],
    ignores: ["src/shared/core/**"],
    rules: restrict([CANVAS, PRODUCTS]),
  },
  {
    files: ["src/canvas/**/*.ts"],
    rules: restrict([UI_LAYERS, PLATFORM, PRODUCTS], { react: true }),
  },
  {
    files: ["src/canvas/utils/fractional-keys.ts"],
    rules: restrict([UI_LAYERS, PLATFORM, PRODUCTS], { react: true, fractional: false }),
  },
  {
    files: ["src/app/**/*.{ts,tsx}", "src/pages/**/*.{ts,tsx}", "src/platform/**/*.{ts,tsx}"],
    rules: restrict([]),
  },
  {
    files: ["src/canvas-ui/**/*.{ts,tsx}"],
    rules: restrict([PRODUCTS]),
  },
  {
    files: ["src/products/board/**/*.ts"],
    ignores: PRODUCT_UI,
    rules: restrict([UI_LAYERS, PRODUCT_UI_IMPORTS, PLATFORM, DESIGN], { react: true }),
  },
  {
    files: uiOf("board"),
    rules: restrict([DESIGN]),
  },
  {
    files: ["src/products/design/**/*.ts"],
    ignores: PRODUCT_UI,
    rules: restrict([UI_LAYERS, PRODUCT_UI_IMPORTS, PLATFORM, BOARD], { react: true }),
  },
  {
    files: uiOf("design"),
    rules: restrict([BOARD]),
  },
  // UI is built from the kit (the example plugins' too): a hand-written <button> or <input> outside
  // it is flagged, so new code reaches for IconButton, SegmentedControl, NumberInput, … One-off
  // designs say why they're bespoke with an inline disable. The variables module is exempt until
  // it's moved onto the kit.
  {
    files: ["src/**/*.tsx", "examples/plugins/*/src/**/*.tsx"],
    ignores: [
      "src/shared/ui/kit/**",
      "src/shared/ui/components/ui/**",
      "src/products/design/modules/variables/**",
    ],
    rules: {
      "no-restricted-syntax": [
        "warn",
        {
          selector: "JSXOpeningElement[name.name=/^(button|input)$/]",
          message:
            "Use @shared/ui/kit (IconButton, SegmentedControl, NumberInput, SearchInput, ListRow, ChoiceCards, Button, Input, …). For a one-off design, add `eslint-disable-next-line no-restricted-syntax -- bespoke: <why>`.",
        },
      ],
    },
  },
  // Text people read goes through a translator (CLAUDE.md rule 30). React files only: engine code's
  // strings are mostly ids and agent text, and its user-facing ones are kept in check by review.
  {
    files: ["src/**/*.tsx", "examples/plugins/*/src/**/*.tsx"],
    ignores: [
      "src/shared/ui/components/ui/**",
      "src/pages/design-system/**",
      // Sample content (a mock website, brochure, app, type and diagram), not interface text.
      "src/products/design/modules/color-wizard/ui/previews/**",
      "src/products/design/modules/color-wizard/ui/theme/theme-pane.tsx",
      "src/products/design/modules/color-wizard/ui/type/type-sample-row.tsx",
      "src/products/design/modules/text/ui/text-styles/text-style-preview.tsx",
      "src/products/design/modules/variables/ui/window/board/number-visual.tsx",
      "src/products/board/modules/er/ui/er-panel/diagram-settings/diagram-setting-preview.tsx",
    ],
    plugins: { cloudy },
    rules: { "cloudy/no-literal-ui-text": "error" },
  },
  {
    files: ["vite.config.ts", "eslint.config.js"],
    languageOptions: { globals: globals.node },
  },
  prettier,
);
