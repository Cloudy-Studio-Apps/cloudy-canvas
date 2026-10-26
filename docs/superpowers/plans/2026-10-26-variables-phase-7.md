# Variables phase 7: math expressions — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A number variable's value (default or per mode) can be a math expression over other number variables (`{Spacing/base} * 2`), resolved per mode like an alias, kept through renames, deletes, replace, copy/paste, import/export and agents, and edited in the Variables panel and window.

**Architecture:** A new `TokenValue` variant `{ expr: string }` stores the expression with references **by id** (`{<variable id>} * 2`), so renames are free; people and agents read and write it with names (`formatExpression` / `readExpression`). Every place that follows aliases asks one helper, `valueRefs(value)` (an alias's target, an expression's references), and every place that rewrites ids uses `mapValueRefs`, so the store's dependents index, the sync, loops, usage, deletion, replace, clipboard and import treat an expression like a multi-target alias. `resolveVariable` evaluates expressions with each reference resolved in the same modes.

**Tech Stack:** TypeScript strict, React 19, Yjs, `@shared/ui/kit`. No new dependencies (a hand-written parser).

**Spec:** `docs/superpowers/specs/2026-10-24-variables-design-system-design.md` (Extras › "Math expressions (`{space/base} * 2`) — last phase"; Phases › 7). The spec says nothing more, so the rulings below are this plan's.

## Global Constraints

- Verification: `pnpm lint`, `pnpm typecheck`, `pnpm format:check` and scratch check harnesses (`scratchpad/checks/run.sh <file>.check.ts`; no test framework; no tauri dev, cargo, builds or browsers).
- Every type in a sibling `.types.ts`; small single-purpose files; semantic tokens only; radii ≤ 8px, no pills; kit components before raw elements.
- Engine code (`canvas/tokens/`) is plain TS; products can't import each other.
- Bound values never drift (spec anti-goal): an expression variable's bound layers update in the same undo step as any variable it references.
- Leave `CONTEXT.md` and the module-conventions spec alone. No commit (the user commits).

## Rulings (this plan's)

- Expressions are for **number** variables only (colors, strings and booleans keep raw values and aliases).
- Grammar: numbers (`12`, `1.5`, `.5`, an optional `px` suffix, `rem` = ×16), references `{ref}`, `+ - * /`, parentheses, unary minus, functions `min(…)`, `max(…)` (1+ args), `round`, `floor`, `ceil`, `abs` (1 arg), `clamp(x, lo, hi)`. Whitespace anywhere. Function names are case-insensitive.
- Stored text: references are `{<id>}`, numbers as written; `formatExpression` shows each reference as the variable's path when unique among all variables, else `Collection/path`; `readExpression` takes any `store.find` reference (id, `Collection/path`, unique path).
- A result that isn't finite (division by zero), a reference that's missing, not a number, or loops → `null` from `resolveVariable` (layers keep what they show), and `setValue` refuses it with a message.
- Exchange: DTCG `$value` is the **resolved** number (strict readers stay happy), the extension's per-mode values keep the expression text with `{Collection.path}` references; reading DTCG or Tokens Studio, a string with references and operators becomes an expression. CSS writes `calc()` with `var()`; the other code formats write resolved values.

## Review Focus

1. Renaming a referenced variable: the expression keeps resolving and the panel shows the new name.
2. Deleting a referenced variable: variables whose expression used it keep the value it gave (baked to a number), no dangling `{id}`.
3. A reference that varies by an axis, read by a layer in another mode: the expression evaluates in that layer's mode.
4. A loop through expressions (`a = {b} + 1`, then `b = {a} * 2`) is refused by `setValue`; a loop that arrives stored (remote edit, import) resolves to `null` without hanging.
5. Editing a referenced variable re-syncs layers bound to the expression variable, in the same undo step.

---

### Task 1: Expression parser and evaluator

**Files:** Create `src/canvas/tokens/expression/` — `expression.types.ts`, `tokenize-expression.ts`, `parse-expression.ts`, `evaluate-expression.ts`, `expression-refs.ts`, `expression-text.ts`, `index.ts`; export from `canvas/tokens/index.ts`. Test: `scratchpad/checks/expressions.check.ts`.

**Interfaces — Produces:**

- `type ExpressionNode = { kind: "number"; value: number } | { kind: "ref"; ref: string } | { kind: "unary"; op: "-"; arg: ExpressionNode } | { kind: "binary"; op: "+" | "-" | "*" | "/"; left; right } | { kind: "call"; fn: ExpressionFunction; args: ExpressionNode[] }`
- `class ExpressionError extends Error { at: number }` (character index).
- `parseExpression(text: string): ExpressionNode` (throws `ExpressionError`: "Expected a number or {variable} at 5", "Unknown function foo", "round takes 1 value", "Missing )").
- `evaluateExpression(node, valueOf: (ref: string) => number | null): number | null` (`null` when a ref gives `null` or the result isn't finite).
- `expressionRefs(text: string): string[]` (unique refs in order; `[]` when it doesn't parse).
- `mapExpressionRefs(text: string, map: (ref: string) => string): string` (rewrites `{…}` contents only; text otherwise kept as typed).
- `formatExpression(store: TokenStore, text: string): string` (ids → short names) and `readExpression(store: TokenStore, text: string): string` (names → ids; throws `ExpressionError` "No variable named Spacing/huge").

- [ ] **Step 1: Write the failing check** — `parseExpression` + `evaluateExpression` with `{a}`=8: `"{a} * 2"` → 16, `"-{a} + 1"` → -7, `"({a} + 2) / 4"` → 2.5, `"max(1, {a}, 3)"` → 8, `"clamp({a}, 0, 4)"` → 4, `"ROUND(2.5)"` → 3, `"2px + 1rem"` → 18, `"1 / 0"` → `null`, `"2 * * 3"` throws with `at` 4, `"foo(1)"` throws "Unknown function foo"; `expressionRefs("{a}+{b}*{a}")` → `["a","b"]`; `mapExpressionRefs("{a} *2", r => r.toUpperCase())` → `"{A} *2"`; with a store holding `Spacing/base` (id `s1`) and `Sizes/base` (id `z1`) and `Spacing/gap` (id `g1`): `formatExpression(store, "{g1} + {s1}")` → `"{gap} + {Spacing/base}"`, `readExpression(store, "{gap} * 2")` → `"{g1} * 2"`, `readExpression(store, "{nope}")` throws.
- [ ] **Step 2: Run** `run.sh expressions.check.ts` → fails (module missing).
- [ ] **Step 3: Implement** a tokenizer and a recursive-descent parser (precedence: unary minus > `* /` > `+ -`, left associative).
- [ ] **Step 4: Run** → all pass.

### Task 2: Expressions as variable values in the engine

**Files:** Modify `token.types.ts` (`TokenValue` gains `{ expr: string }`), `is-token-record.ts` (an `expr` string; fits only `number` variables), create `value-refs.ts` (`valueRefs`, `mapValueRefs`), modify `token-store.ts` (`aliasedBy` from `valueRefs`), `resolve-token.ts` (evaluate; `aliasCreatesCycle` unchanged, called per reference), `token-edits-base.ts` `checkValue` (an expr: `parseExpression`, every ref a number variable, no cycle, evaluates in the base modes to a finite number; stored as given — ids), `baked-aliases.ts` (bake values whose `valueRefs` hit `gone`), `replace-token.ts` (`mapValueRefs` from → to), `token-usage.ts` (`aliases` include expression users), `clipboard-tokens.ts`, `exchange/select-tokens.ts`, `exchange/color-tokens.ts`, `exchange/import-plan.ts` (all via `valueRefs`/`mapValueRefs`). Test: `expressions.check.ts` (engine section).

**Interfaces — Produces:** `valueRefs(value: TokenValue): string[]`, `mapValueRefs(value: TokenValue, map: (id: string) => string): TokenValue`, `isExpressionValue(value): value is { expr: string }`.

- [ ] **Step 1: Write the failing checks** (a `CanvasDocument` with board kinds, `DocumentTokens`): `base = 8`; `gap = { expr: "{base} * 2" }` → `resolveVariable` 16; `base` varies by Theme with Dark = 10 → gap 20 in `{ theme: dark }`, 16 in light (Review Focus 3); a design rectangle (design kinds) with `cornerRadius` bound to gap: setting base to 12 makes its `cornerRadius` 24 in that same undo step (Review Focus 5); rename `base` → gap still 16 (RF 1); `setValue(base, { expr: "{gap} + 1" })` throws a loop message (RF 4); a stored loop written with `setTokenRecords` resolves `null` (RF 4); `{ expr: "{base} / 0" }` refused; `{ expr: "{colorVar} * 2" }` refused; deleting `base` leaves gap `{ number: 16 }` (RF 2); `replaceUses(base, other)` rewrites the expression's ref; `tokenUsage(base).aliases` lists gap; `clipboardTokens`/`selectTokens` of gap include base; `planTokenImport` with remapped ids rewrites refs inside expressions; `isTokenRecord` rejects `{ expr: 1 }` and an expr on a color variable.
- [ ] **Step 2: Run** → fail.
- [ ] **Step 3: Implement.** In `resolveVariable`, evaluation recurses through `resolveVariable` for references with a shared visiting set (pass it through a private helper) so a loop returns `null`; total depth capped by the existing `MAX_HOPS`.
- [ ] **Step 4: Run** this check and the earlier ones (`board-colors`, `exchange-core`, `review`, `dtcg`, `code`) → all pass; `pnpm typecheck` → only errors in places Task 3–5 own (exhaustive switches), fixed minimally here if they block.

### Task 3: Exchange: DTCG, Tokens Studio, code, Figma

**Files:** Create `exchange/read-exchange-expression.ts` (`readExchangeExpression(text: string, refOf: (reference: string) => string | null): { expr: string } | null` — `{dotted.path}` refs mapped to ids, `null` when it isn't math or a ref is unknown); modify `dtcg/to-dtcg.ts` (`$value` resolved; extension values as text with `{Collection.path}`), `dtcg/from-dtcg.ts` `readValue` (number type: try `readExchangeExpression` after references), `tokens-studio/from-tokens-studio.ts` (math on number types → expression; the warning stays for the rest), `code/code-tokens(.types).ts` (`own` gains `{ calc: string }` for an expression: refs as `var(--name)` when listed, else their value; literals with the entry's unit), `code/css-values.ts` (writes `calc(…)`); `figma/convert/tokens/fig-variable-value.ts` (`EXPRESSION` with `expressionValue.expressionFunction` `ADDITION`/`SUBTRACTION`/`MULTIPLY`/`DIVIDE`/`NEGATE` over `expressionArguments` → an expression; others warn "variable expressions Cloudy Canvas doesn't have were left out"; check the names against the Kiwi schema the demo files carry, `figma-tokens.check.ts`). Tests: `dtcg.check.ts`, `tokens-studio.check.ts`, `code.check.ts` additions.

- [ ] **Step 1: Write failing checks:** DTCG round trip keeps `{ expr }` with the same refs and `$value` is 16; a DTCG file with `"$value": "{space.base} * 2"` reads as an expression; Tokens Studio `"{spacing.sm} * 2"` imports as an expression (no warning), `"rgba({c}, 0.5)"` still warns; CSS of gap → `--gap: calc(var(--base) * 2);` (px unit on literals when the variable is px-like: `calc(var(--base) + 4px)`); Tailwind/SCSS write 16.
- [ ] **Step 2: Run** → fail. **Step 3: Implement.** **Step 4: Run** → pass.

### Task 4: Agents

**Files:** `canvas/agent/tokens/variable-args.ts` (`readTokenValue` accepts `{ expr: "{Spacing/base} * 2" }` for number variables, refs through `lookup` → ids, parse errors rethrown with the text), `describe-variables.ts` (an expression reads `{ expr: "<names>", value: 16 }`); the hint strings and the design and board instructions name expressions in one line. Test: `expressions.check.ts` (agent section): `readTokenValue({ expr: "{base} * 2" }, lookup, "number")` → `{ expr: "{<id>} * 2" }`; on a color → throws; describe shows names.

- [ ] Steps: failing check → implement → pass; live MCP test (`create_variables` with an expr, `get_variables`) once the app has reloaded.

### Task 5: Panel and window UI

**Files:** Create `products/design/modules/variables/ui/expression-input.tsx` (+ types): a `CommitInput` showing `formatExpression`, committing through `readExpression` + `tokens.setValue` (errors → `notifyError`, field reverts), the result faded after it (`= 16`), and a `VariablePicker` (number) button that inserts `{name}` at the end. Modify `value-field.tsx`: the number branch gets an "Use an expression" `ActionButton` (lucide `Sigma`) starting `{ expr: "<current value>" }`; an expression value renders `ExpressionInput` with Detach (keeps the resolved number, as an alias does) and the mode's clear button; `canvas-ui/tokens/variable-value.tsx` shows a small `ƒ` before an expression's resolved value. The window's `NumberModeRow` and `NumberCard` read through `ValueField`/`resolveVariable`, so they need no change beyond what typecheck flags.

- [ ] lint/typecheck/format clean.

### Task 6: Docs

- [ ] CLAUDE.md: the Variables bullet says "phases 1, 2, 4, 5, 6 and 7", a sentence on expressions (`{ expr }` by id, `valueRefs`/`mapValueRefs`, `formatExpression`/`readExpression`, exchange and agents), and "Not yet (the spec's last phase): expressions" is removed.

### Task 7: README of the variables feature (user)

- [ ] `src/products/design/modules/variables/README.md`: every feature of variables across phases 1–7 (what it is, how it works, where the code is): the token model (`canvas/tokens/`), modes and axes, bindings and the sync (detach rule), styles, generators (shades, scales, type scale), contrast, usage tools, the Variables section and window, the Design system view (`styleguide/`), import/export and Figma, board colors (`products/board/modules/colors/`), expressions, agent tools, and how to extend it (bindable fields, style types, token formats, templates). CLAUDE.md's Variables bullet points to it.
