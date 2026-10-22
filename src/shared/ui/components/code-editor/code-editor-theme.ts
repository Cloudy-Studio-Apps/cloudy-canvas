import { HighlightStyle, syntaxHighlighting } from "@codemirror/language";
import type { Extension } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import { tags } from "@lezer/highlight";

/** The editor's chrome, from the design tokens, so it looks like the other inputs. */
const chrome = EditorView.theme({
  "&": {
    height: "100%",
    backgroundColor: "var(--surface)",
    color: "var(--foreground)",
    border: "1px solid var(--input)",
    borderRadius: "var(--corner)",
    fontSize: "0.75rem",
    transition: "border-color var(--duration-fast), box-shadow var(--duration-fast)",
  },
  "&.cm-focused": {
    outline: "none",
    borderColor: "var(--ring)",
    boxShadow: "0 0 0 3px color-mix(in oklab, var(--ring) 25%, transparent)",
  },
  "&.cm-invalid": { borderColor: "var(--destructive)" },
  ".cm-scroller": { fontFamily: "var(--font-mono)", lineHeight: "1.625", overflow: "auto" },
  ".cm-content": { padding: "8px 0", caretColor: "var(--foreground)" },
  ".cm-line": { padding: "0 10px" },
  ".cm-cursor": { borderLeftColor: "var(--foreground)" },
  "&.cm-focused .cm-selectionBackground, .cm-selectionBackground, ::selection": {
    backgroundColor: "var(--primary-soft) !important",
  },
  ".cm-gutters": {
    backgroundColor: "var(--surface-sunken)",
    color: "var(--subtle-foreground)",
    border: "none",
    borderRight: "1px solid var(--border)",
    borderRadius: "var(--corner) 0 0 var(--corner)",
  },
  ".cm-lineNumbers .cm-gutterElement": { padding: "0 6px 0 8px", minWidth: "28px" },
  ".cm-activeLine": { backgroundColor: "color-mix(in oklab, var(--muted) 60%, transparent)" },
  ".cm-activeLineGutter": { backgroundColor: "var(--muted)", color: "var(--foreground)" },
  "&.cm-focused .cm-matchingBracket": {
    backgroundColor: "var(--primary-soft)",
    outline: "1px solid color-mix(in oklab, var(--primary) 40%, transparent)",
  },
  "&.cm-focused .cm-nonmatchingBracket": { backgroundColor: "var(--destructive-soft)" },
  ".cm-highlight-line": {
    backgroundColor: "color-mix(in oklab, var(--primary-soft) 70%, transparent)",
    boxShadow: "inset 2px 0 0 var(--primary)",
  },
  ".cm-error-line": {
    backgroundColor: "color-mix(in oklab, var(--destructive-soft) 80%, transparent)",
    textDecoration: "underline wavy var(--syntax-error)",
    textDecorationSkipInk: "none",
    textUnderlineOffset: "3px",
  },
  ".cm-error-gutter": { color: "var(--destructive)", fontWeight: "600" },
  ".cm-tooltip": {
    backgroundColor: "var(--popover)",
    color: "var(--popover-foreground)",
    border: "1px solid var(--border)",
    borderRadius: "var(--corner-card)",
    boxShadow: "var(--elevation-popover)",
    overflow: "hidden",
  },
  ".cm-tooltip.cm-tooltip-autocomplete > ul": {
    fontFamily: "var(--font-mono)",
    fontSize: "0.75rem",
    maxHeight: "16em",
    padding: "4px",
  },
  ".cm-tooltip.cm-tooltip-autocomplete > ul > li": {
    display: "flex",
    alignItems: "baseline",
    gap: "12px",
    padding: "2px 8px",
    borderRadius: "var(--corner-sm)",
  },
  ".cm-tooltip-autocomplete ul li[aria-selected]": {
    backgroundColor: "var(--primary-soft)",
    color: "var(--primary-soft-foreground)",
  },
  ".cm-completionMatchedText": {
    textDecoration: "none",
    fontWeight: "700",
    color: "var(--primary)",
  },
  ".cm-completionDetail": {
    marginLeft: "auto",
    fontStyle: "normal",
    fontFamily: "var(--font-sans)",
    color: "var(--muted-foreground)",
  },
  ".cm-snippetField": { backgroundColor: "var(--primary-soft)" },
});

/** Syntax colors: each tag reads a `--syntax-*` token. */
const colors = HighlightStyle.define([
  { tag: tags.keyword, color: "var(--syntax-keyword)", fontWeight: "600" },
  { tag: tags.definition(tags.typeName), color: "var(--syntax-definition)", fontWeight: "600" },
  { tag: tags.propertyName, color: "var(--syntax-property)" },
  { tag: tags.typeName, color: "var(--syntax-type)" },
  { tag: tags.modifier, color: "var(--syntax-setting)" },
  { tag: tags.string, color: "var(--syntax-string)" },
  { tag: tags.special(tags.string), color: "var(--syntax-string)", fontStyle: "italic" },
  { tag: [tags.number, tags.color], color: "var(--syntax-number)" },
  { tag: tags.operator, color: "var(--syntax-operator)", fontWeight: "600" },
  { tag: [tags.bracket, tags.punctuation], color: "var(--syntax-punctuation)" },
  { tag: tags.comment, color: "var(--syntax-comment)", fontStyle: "italic" },
]);

export const codeEditorTheme: Extension = [chrome, syntaxHighlighting(colors)];
