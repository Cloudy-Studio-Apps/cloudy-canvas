import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import prettier from "eslint-config-prettier";

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

/** A `no-restricted-imports` rule from pattern groups, optionally banning React too. */
function restrict(patterns, { react = false } = {}) {
  return {
    "no-restricted-imports": [
      "error",
      react ? { paths: REACT.paths, patterns: [...REACT.patterns, ...patterns] } : { patterns },
    ],
  };
}

// A module folder (`products/*/modules/<name>/`) is engine code except its `ui/` and its
// `<name>.module.ts`, which plugs it into the UI too.
const PRODUCT_UI = [
  "src/products/*/ui/**/*.{ts,tsx}",
  "src/products/*/modules/*/ui/**/*.{ts,tsx}",
  "src/products/*/modules/*/*.module.ts",
];
/** `PRODUCT_UI` of one product. */
const uiOf = (product) =>
  PRODUCT_UI.map((glob) => glob.replace("products/*", `products/${product}`));

export default tseslint.config(
  { ignores: ["dist", "src-tauri/target", "src-tauri/gen"] },
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
  {
    files: ["vite.config.ts", "eslint.config.js"],
    languageOptions: { globals: globals.node },
  },
  prettier,
);
