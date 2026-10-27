// `cloudy/no-literal-ui-text`: user-facing text in JSX goes through the folder's `t` (CLAUDE.md
// rule 30, src/shared/core/i18n/README.md). Flags JSX text and the string values of the props and
// option fields people read (label, title, placeholder, aria-label, …) when they hold words.
// What passes: brand names, strings without words (symbols, numbers), all-caps abbreviations (PK,
// DBML), units (px, mm, dpi), URLs, paths and expressions (`a/b`, `{x} * 2`), and text inside
// <code> or <Kbd> (code samples and key caps).

/** Props and object fields whose string values are shown to people. */
const TEXT_PROPS = new Set([
  "label",
  "title",
  "description",
  "placeholder",
  "alt",
  "aria-label",
  "aria-description",
  "aria-roledescription",
  "aria-valuetext",
  "tooltip",
  "hint",
]);

/** Never translated: brand names, and "Aa", the typeface sample. */
const BRANDS = new Set(["Cloudy Canvas", "Cloudy Studio", "DarkRedgm", "Google Fonts", "Aa"]);

/** Units shown next to numbers, the same in every language. */
const UNITS = new Set(["px", "pt", "mm", "cm", "in", "dpi", "ms", "deg"]);

/** Elements whose text is code or a key, not prose. */
const CODE_ELEMENTS = new Set(["code", "pre", "kbd", "Kbd"]);

/** Whether `text` holds a word: two letters in a row, in any script. */
const hasWords = (text) => /\p{L}{2}/u.test(text);

const isUiText = (raw) => {
  const text = raw.trim();
  if (!hasWords(text)) return false;
  const words = text.replace(/^[^\p{L}]+|[^\p{L}]+$/gu, "");
  if (BRANDS.has(words) || UNITS.has(words)) return false;
  // Abbreviations (PK, DBML), and URLs, paths, domains and expressions (no spaces, or braces).
  if (!/\p{Ll}/u.test(text)) return false;
  if (/[{}]|:\/\//.test(text) || (!/\s/.test(text) && /[./]/.test(text))) return false;
  return true;
};

const MESSAGE =
  "User-facing text goes through the folder's t() (locales/en.json + es.json), or tCommon for generic words. See src/shared/core/i18n/README.md.";

/** @type {import("eslint").Rule.RuleModule} */
export const noLiteralUiText = {
  meta: {
    type: "problem",
    docs: { description: "User-facing text in JSX goes through a translator." },
    schema: [],
  },
  create(context) {
    const report = (node) => context.report({ node, message: MESSAGE });
    const isTextLiteral = (node) =>
      (node?.type === "Literal" && typeof node.value === "string" && isUiText(node.value)) ||
      (node?.type === "TemplateLiteral" &&
        node.quasis.some((quasi) => isUiText(quasi.value.cooked ?? "")));
    return {
      JSXText(node) {
        const parent = node.parent?.type === "JSXElement" ? node.parent.openingElement.name : null;
        if (parent?.type === "JSXIdentifier" && CODE_ELEMENTS.has(parent.name)) return;
        if (isUiText(node.value)) report(node);
      },
      JSXAttribute(node) {
        if (node.name.type !== "JSXIdentifier" || !TEXT_PROPS.has(node.name.name)) return;
        const value =
          node.value?.type === "JSXExpressionContainer" ? node.value.expression : node.value;
        if (isTextLiteral(value)) report(value);
      },
      // `{ value, label: "Fill" }` option lists and toolbar items in .tsx files.
      Property(node) {
        const key = node.key.type === "Identifier" ? node.key.name : node.key.value;
        if (!node.computed && TEXT_PROPS.has(key) && isTextLiteral(node.value)) report(node.value);
      },
    };
  },
};

export default { rules: { "no-literal-ui-text": noLiteralUiText } };
