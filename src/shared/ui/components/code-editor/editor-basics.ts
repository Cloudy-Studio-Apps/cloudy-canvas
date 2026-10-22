import { closeBrackets, closeBracketsKeymap } from "@codemirror/autocomplete";
import { defaultKeymap, history, historyKeymap, indentWithTab } from "@codemirror/commands";
import { bracketMatching, indentOnInput, indentUnit } from "@codemirror/language";
import { EditorState } from "@codemirror/state";
import type { Extension } from "@codemirror/state";
import {
  drawSelection,
  highlightActiveLine,
  highlightActiveLineGutter,
  keymap,
  lineNumbers,
} from "@codemirror/view";

import { codeEditorTheme } from "./code-editor-theme";

/**
 * What every code editor has: line numbers, the active line, undo, bracket matching and closing,
 * two-space indentation and Tab to indent (Esc, then Tab, leaves the editor).
 */
export const editorBasics: Extension = [
  lineNumbers(),
  highlightActiveLineGutter(),
  highlightActiveLine(),
  drawSelection(),
  history(),
  bracketMatching(),
  closeBrackets(),
  indentOnInput(),
  EditorState.tabSize.of(2),
  indentUnit.of("  "),
  keymap.of([...closeBracketsKeymap, ...defaultKeymap, ...historyKeymap, indentWithTab]),
  codeEditorTheme,
];
