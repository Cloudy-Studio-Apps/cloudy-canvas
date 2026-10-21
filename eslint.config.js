import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import prettier from "eslint-config-prettier";

// engine/ and core/ must stay framework- and platform-agnostic so they can be
// reused by the future web version and extracted into a shared package.
const agnosticImportBan = {
  paths: [
    { name: "react", message: "engine/ and core/ must not depend on React." },
    { name: "react-dom", message: "engine/ and core/ must not depend on React." },
  ],
  patterns: [
    { group: ["react/*", "react-dom/*"], message: "engine/ and core/ must not depend on React." },
    {
      group: ["@ui", "@ui/*", "@pages", "@pages/*", "@app", "@app/*", "@stores", "@stores/*"],
      message: "engine/ and core/ must not import UI layers.",
    },
    {
      group: ["@platform", "@platform/*", "@tauri-apps/*"],
      message: "engine/ and core/ must not import platform code; depend on interfaces in core/.",
    },
  ],
};

export default tseslint.config(
  { ignores: ["dist", "src-tauri/target", "src-tauri/gen", "temporal"] },
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
    files: ["src/ui/components/ui/**/*.tsx"],
    rules: { "react-refresh/only-export-components": "off" },
  },
  {
    files: ["src/engine/**/*.ts", "src/core/**/*.ts"],
    rules: { "no-restricted-imports": ["error", agnosticImportBan] },
  },
  {
    files: ["vite.config.ts", "eslint.config.js"],
    languageOptions: { globals: globals.node },
  },
  prettier,
);
