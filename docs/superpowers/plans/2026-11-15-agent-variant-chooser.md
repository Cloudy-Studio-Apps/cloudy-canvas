# Agent variant chooser Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Agents ask the user to pick between variants they drew side by side; the user picks in a bar over the agent's tab, and the agent gets the pick in the same call (≤ 25 s) or is stopped and locked until the user picks.

**Architecture:** A plain-TS registry of pending choices (`canvas/mcp/variants/`) plus an app tool group `variants_*` served like `tabs_*`. The app host validates the ids against the agent's tab file and waits on the registry; `runAgentTool` refuses a locked session's calls; late picks ride `notesFor`. A `canvas-ui` bar mounted by both editors drives the user's own camera; the title bar shows a badge on a tab that waits.

**Tech Stack:** TypeScript (strict), React 19, Tailwind v4, lucide-react, the project's `Store`, `@shared/ui/kit`.

**Spec:** `docs/superpowers/specs/2026-11-15-agent-variant-chooser-design.md`

## Global Constraints

- No test framework: every task is verified with `pnpm lint`, `pnpm typecheck`, `pnpm format:check` only. No `tauri dev`, cargo, builds or browser checks.
- The wait is `VARIANT_WAIT_MS = 25_000` (the transport cuts at 30 s, `src-tauri/src/mcp/routes.rs`).
- 2 to 6 variant ids per request, no duplicates, each a top-level element on the agent's current page.
- Layering (root `CLAUDE.md` rules 4–7): `canvas/` is plain TS, no React, no `@canvas-ui`/`@app`/`@platform`.
- Every `interface`/`type` in a sibling `.types.ts`; small files (~200 lines max); semantic tokens; radii `rounded-md`/`rounded-lg`; kit pieces (`Button`, `Input` from `@shared/ui/kit`; `ToolButton`, `useCommitField` + `commitFieldProps` from `@canvas-ui`) for the note field and buttons.
- UI text in en + es through the folder's `t` (`pnpm lint` checks); MCP tool text in English.
- Changelog entry in `CHANGELOG.md` and `CHANGELOG.es.md` under Unreleased → New / Novedades, for users, no internal names, no Figma/FigJam.
- Commits: on `master`, no `Co-Authored-By` line, no Claude attribution.
- READMEs next to changed code updated in the same task.

## Review Focus

No task can test these (no test framework), so the reviewer checks each by reading the code:

1. **Tab closed while `variants_choose` is waiting:** the call returns `dismissed` at once, it does not hang until the 25 s timer or forever (Task 2, `fileTabs.store` subscription → `dropTab`).
2. **A pick made inside the 25 s is not delivered twice:** `takeNote` returns nothing for a pick already returned by `open` (Task 1).
3. **A refused (locked) call doesn't swallow undo notes or the pick note:** `notesFor` returns `[]` while the session is locked (Task 2).
4. **The user deletes variants by hand while the bar is open:** gone ids drop out; with one left the bar still offers Keep this / Keep all; with none, only Keep all and Close; "Keep this" never deletes an id that isn't a listed variant (Task 3).
5. **The user is on another page:** the bar shows only the question and "Back to variants"; nothing is deleted on a page the user isn't looking at (Task 3).

---

### Task 1: The pending-choice registry and the tool group (engine side)

**Files:**

- Create: `src/canvas/mcp/variants/variant-choices.types.ts`
- Create: `src/canvas/mcp/variants/variant-choices.ts`
- Create: `src/canvas/mcp/variants/variant-note.ts`
- Create: `src/canvas/mcp/variants/index.ts`
- Create: `src/canvas/mcp/variants.mcp.ts`, `src/canvas/mcp/variants.mcp.types.ts`
- Modify: `src/canvas/mcp/index.ts` (export the above), `src/canvas/mcp/README.md` (a "Variant choices" paragraph)

**Interfaces:**

- Produces (types in `variant-choices.types.ts`):
  ```ts
  export interface VariantRequest {
    session: string; // presenceKey
    tabId: string;
    scope: string | null; // the page the variants are on
    ids: string[];
    labels: string[]; // same length as ids
    question: string | null;
  }
  export type VariantPick =
    | { choice: "one"; kept: string; label: string; removed: string[]; note?: string }
    | { choice: "all"; note?: string }
    | { choice: "dismissed" };
  export interface VariantChoicesSnapshot {
    readonly byTab: Readonly<Record<string, VariantRequest>>;
  }
  export interface VariantChoices {
    readonly store: Store<VariantChoicesSnapshot>;
    open(request: VariantRequest): Promise<VariantPick | null>; // null: timed out, still pending
    pending(tabId: string): VariantRequest | null;
    resolve(tabId: string, pick: VariantPick): void;
    isLocked(session: string): boolean;
    last(session: string): VariantPick | "pending" | null;
    takeNote(session: string): string | null;
    dropTab(tabId: string): void;
    dropSession(session: string): void;
  }
  export interface VariantChoicesOptions {
    waitMs?: number;
  }
  ```
- Produces: `createVariantChoices(options?: VariantChoicesOptions): VariantChoices`, `VARIANT_WAIT_MS = 25_000`, `VARIANTS_WAIT_MESSAGE`, `variantLabels(count: number): string[]` (`"A"`, `"B"`, …), `variantNote(pick: VariantPick, labels: string[], ids: string[]): string`.
- Produces (`variants.mcp.types.ts`):
  ```ts
  export interface VariantsChooseArgs {
    ids: string[];
    labels?: string[];
    question?: string;
  }
  export interface VariantsAgentHost {
    chooseVariants(args: VariantsChooseArgs): Promise<VariantPick | null>;
    variantChoice(): VariantPick | "pending" | null;
  }
  ```
- Produces: `variantsTools: McpToolGroup<VariantsAgentHost, unknown>` with `id: "variants"`, `prefix: "variants"`, tools `choose` and `choice`, both `scope: "app"`.

- [ ] **Step 1: Write the types** in `variant-choices.types.ts` and `variants.mcp.types.ts` exactly as above (`Store` from `../../utils`).

- [ ] **Step 2: Implement `createVariantChoices`** in `variant-choices.ts`. Behaviour the reviewer checks:
  - `open` throws `"Another agent is waiting for the user's pick in this tab."` if the tab has a pending request from another session, and `"You are already waiting for the user's pick: end your turn."` from the same session. Otherwise records the request (store `byTab`), clears that session's previous `last`, and returns a promise that resolves with the pick if `resolve` comes within `waitMs`, else `null` at `waitMs` (the request stays pending).
  - `isLocked(session)`: the session has a pending request (in or past the wait; one rule).
  - `resolve(tabId, pick)`: removes the request; sets `last(session)` to the pick; if the wait is still running resolves its promise (pick **delivered**, no note); else stores `variantNote(...)` for `takeNote`. Unknown tab: no-op.
  - `last(session)`: `"pending"` while locked, else the last pick, else `null`.
  - `takeNote(session)`: returns the stored note once, then `null`.
  - `dropTab(tabId)`: `resolve(tabId, { choice: "dismissed" })`. `dropSession(session)`: removes that session's request, note and last pick without resolving anything else (its waiting promise resolves `{ choice: "dismissed" }`).

- [ ] **Step 3: Implement `variantNote`** in `variant-note.ts`. Exact copy:
  - one: `` `The user chose variant ${label} (id ${kept}); the other variants (${removed.join(", ")}) were removed.` `` plus `` ` Their note: "${note}"` `` when a note was given.
  - all: `"The user kept all the variants."` plus the note sentence.
  - dismissed: `"The user closed the variant chooser without choosing."`

- [ ] **Step 4: Write `variants.mcp.ts`.** `VARIANTS_WAIT_MESSAGE` (exact): `"The user hasn't chosen yet. End your turn now and wait for them: they will tell you to go on. Until they choose, your other tool calls are refused."`
  - `choose` description (exact): `"Asks the user to pick one of 2 to 6 variants you drew side by side on the current page (top-level elements: design frames, board sections or groups). The app shows a chooser over your tab; wait for the answer. Returns { choice: 'one', kept, label, removed, note? } (the others were deleted), { choice: 'all', note? } or { choice: 'dismissed' }. If it returns { choice: 'pending' }, end your turn: the user will tell you to go on, and variants_choice reads their pick."`
  - Schema: `ids` (array of strings, `minItems: 2`, `maxItems: 6`), `labels` (array of strings, optional; "One short name per id, e.g. 'Dark header'. Defaults to A, B, C…"), `question` (string, optional; "What the user is choosing, shown in the chooser.").
  - `run` validates with `tool-args.ts` helpers: 2–6 strings, no duplicates (`"Each variant id must be different."`), `labels` same length (`"Give one label per id."`). Returns the pick, or `{ choice: "pending", message: VARIANTS_WAIT_MESSAGE }` when the host returns `null`.
  - `choice`: no arguments; description `"The user's pick from your last variants_choose: { choice: 'one' | 'all' | 'dismissed', … }, or { choice: 'pending' } while they haven't chosen, or { choice: 'none' } if you never asked."` Maps `null` → `{ choice: "none" }`, `"pending"` → `{ choice: "pending", message: VARIANTS_WAIT_MESSAGE }`.

- [ ] **Step 5: Export** from `src/canvas/mcp/variants/index.ts` and `src/canvas/mcp/index.ts` (values plus `export type`), and add a "Variant choices" paragraph to `src/canvas/mcp/README.md`: the registry, the lock rule, delivered-once, the 25 s wait and why.

- [ ] **Step 6: Verify**
      Run: `pnpm lint && pnpm typecheck && pnpm format:check`
      Expected: all pass (run `pnpm format` first if formatting only).

- [ ] **Step 7: Commit**
  ```bash
  git add src/canvas/mcp
  git commit -m "feat(agents): variant choices registry and variants_* tools"
  ```

### Task 2: Serving the tools, the lock and the late pick (app side)

**Files:**

- Create: `src/canvas-ui/agent/variant-choices-instance.ts` (`export const variantChoices = createVariantChoices();`), export it from `src/canvas-ui/agent/index.ts` and the `@canvas-ui` barrel.
- Create: `src/app/mcp/variants/variants-host.ts`
- Modify: `src/app/mcp/agent-host.ts` (export `sessionTab`; spread `...variantsHostFor(collaboratorId, tabs)`)
- Modify: `src/app/mcp/agent-server-definition.types.ts` (`AgentCallHost` also `VariantsAgentHost`; `AgentServerOptions.refuse?`)
- Modify: `src/app/mcp/agent-tool-dispatch.ts`, `src/app/mcp/app-tools.ts`, `src/app/mcp/agent-runtime.ts`, `src/app/mcp/use-agent-server.ts`
- Modify: `src/canvas/mcp/mcp-instructions.ts`, `src/app/mcp/README.md`, `src/canvas-ui/agent/README.md`

**Interfaces:**

- Consumes: Task 1's `VariantChoices`, `VariantsAgentHost`, `variantsTools`, `VARIANTS_WAIT_MESSAGE`, `variantLabels`.
- Produces: `variantChoices` (the app's one instance, from `@canvas-ui`); `variantsHostFor(session: string, tabs: AgentTabs): VariantsAgentHost`; `AgentServerOptions.refuse?(context: McpMessageContext, toolName: string): string | null`.

- [ ] **Step 1: `variantsHostFor`.** `chooseVariants(args)`: `tabId = sessionTab(tabs, session)`; `null` → throw `NO_FILE_OPEN` (from `agent-tool-dispatch.ts`). `file = tabAgentFile(tabId)` (null → `NO_FILE_OPEN`). `workspace = file.engine.workspace(session)`. Each id must satisfy `workspace.getElement(id)` (on its page) else throw `` `No element with id ${id} on your page.` ``, and `file.engine.rootOf(id) === id` else `` `${id} is inside another element: give the top-level variants.` ``. Then `variantChoices.open({ session, tabId, scope: workspace.scope, ids, labels: args.labels ?? variantLabels(ids.length), question: args.question ?? null })`. `variantChoice()`: `variantChoices.last(session)`.

- [ ] **Step 2: Serve the group.** Add `variantsTools` to `APP_GROUPS` in `app-tools.ts` (this also reserves the `variants` prefix). Widen `AgentCallHost` with `VariantsAgentHost`.

- [ ] **Step 3: The lock.** In `runAgentTool`, first line: `const refusal = options.refuse?.(context, tool.name); if (refusal) throw new Error(refusal);` (before `prepare`, so a locked call never pins the tab). In `agent-runtime.ts` pass:
  - `refuse: (context, name) => name !== "variants_choice" && variantChoices.isLocked(presenceKey(context)) ? VARIANTS_WAIT_MESSAGE : null`
  - `notesFor`: `[]` while `variantChoices.isLocked(key)`; else `[...undoNotes.take(key), ...(note ? [note] : [])]` with `note = variantChoices.takeNote(key)`.

- [ ] **Step 4: Lifetime.** In `agent-runtime.ts`'s existing `fileTabs.store.subscribe`, also `dropTab` every tab in `variantChoices.store.get().byTab` that `fileTabs.get(id)` no longer finds. In `use-agent-server.ts`'s `ended` branch, call `variantChoices.dropSession(session)` beside `agentTabs.unbind`. (Pruned agents keep their chooser on purpose: the user can still pick and the agent may come back. Note this in the README.)

- [ ] **Step 5: Instructions.** Append to `SHARED_MCP_INSTRUCTIONS` (exact): `"When the user asks for options to choose from (variants, alternatives), draw them side by side on the current page as top-level elements and call variants_choose with their ids, instead of asking in the chat. If it answers pending, end your turn: the user picks in the app and tells you to go on; until then your other calls are refused."`

- [ ] **Step 6: READMEs.** `src/app/mcp/README.md`: a "Variant choices" section (host validation, the lock in `runAgentTool`, notes, tab close / session end, prune). `src/canvas-ui/agent/README.md`: the instance.

- [ ] **Step 7: Verify**
      Run: `pnpm lint && pnpm typecheck && pnpm format:check`
      Expected: all pass. `scripts/check-public-api.mjs` and `check-modules.mjs` (in lint) pass.

- [ ] **Step 8: Commit**
  ```bash
  git add src/canvas-ui/agent src/app/mcp src/canvas/mcp/mcp-instructions.ts
  git commit -m "feat(agents): serve variants tools, lock a waiting agent, deliver late picks"
  ```

### Task 3: The chooser bar, the tab badge and the changelog (UI)

**Files:**

- Create: `src/canvas-ui/agent/variant-chooser-bar.tsx`
- Create: `src/canvas-ui/agent/use-variant-chooser.ts`, `src/canvas-ui/agent/use-variant-chooser.types.ts`
- Modify: `src/canvas-ui/agent/index.ts`, `src/canvas-ui/index.ts` (export `VariantChooserBar`)
- Modify: `src/canvas-ui/locales/en.json`, `src/canvas-ui/locales/es.json` (a `variants` group)
- Modify: `src/products/board/ui/board-chrome.tsx`, `src/products/design/ui/design-chrome.tsx`
- Create: `src/app/title-bar/tab-variants-badge.tsx`; modify `src/app/title-bar/tab-button.tsx`, `src/app/title-bar/title-bar.types.ts` (if props need a type), `src/app/title-bar/locales/{en,es}.json`
- Modify: `CHANGELOG.md`, `CHANGELOG.es.md`, `src/canvas-ui/agent/README.md`, `src/app/title-bar/README.md`

**Interfaces:**

- Consumes: `variantChoices` (Task 2), `VariantRequest`, `VariantPick` (Task 1); `useEngine`, `useEngineState`, `useTabContext`, `useIsActiveTab` (`@canvas-ui`); `useCollaboratorsStore` (`@shared/stores/collaborators-store`, collaborator id = `request.session`).
- Produces: `useVariantChooser(): VariantChooser | null`, where

  ```ts
  export interface VariantChooser {
    request: VariantRequest;
    present: string[]; // listed ids still in the document, in order
    index: number; // into present
    onPage: boolean; // engine.scope === request.scope
    note: string;
    setNote(note: string): void;
    previous(): void;
    next(): void;
    compareAll(): void;
    backToPage(): void;
    keepThis(): void;
    keepAll(): void;
    close(): void;
  }
  ```

  and `<VariantChooserBar />` (no props).

- [ ] **Step 1: `useVariantChooser`.** Reads `variantChoices.pending(tabId)` with `useSyncExternalStore(variantChoices.store.subscribe, …)`; `present` re-read on document changes (`engine.doc.observe`) as ids where `engine.doc.get(id)` exists; `index` clamped with `mod` when `present` shrinks. Behaviour:
  - The first time the request is shown while `useIsActiveTab()` and `onPage`: `engine.zoomToElements(present)`.
  - `previous`/`next`: move `index` (wrapping) and `engine.zoomToElement(present[index])`. `compareAll`: `engine.zoomToElements(present)`. `backToPage`: `engine.setScope(request.scope)` (when not `null`).
  - `keepThis` (only when `onPage` and `present.length > 0`): `removed = present` minus the current id; `engine.deleteElements(removed)` (the user's delete, one undo step in the user's history); `variantChoices.resolve(tabId, { choice: "one", kept, label: request.labels[request.ids.indexOf(kept)], removed, note? })`.
  - `keepAll`: resolve `{ choice: "all", note? }`. `close`: resolve `{ choice: "dismissed" }`. `note` is sent only when non-empty after trim.

- [ ] **Step 2: `<VariantChooserBar />`.** Renders nothing without a chooser. Placed top centre like `FollowBar` (`top-8` with rulers, else `top-3`; the bottom centre holds the toolbar), `pointer-events-auto`, `rounded-lg border-2 bg-surface shadow-md`, border in the agent's colour. Contents, left to right: the agent's avatar (`CollaboratorAvatar`) and `request.question ?? t("variants.pick")`; when `onPage`: previous `ToolButton`, label text `t("variants.position", { label, index: index + 1, count: present.length })` ("B · 2 of 3"), next `ToolButton`, "Compare all" `ToolButton`, the note `Input` (`useCommitField` + `commitFieldProps`, placeholder `t("variants.notePlaceholder")`), `Button` "Keep this" (disabled with `present.length === 0`), `Button variant="outline"` "Keep all"; when not `onPage`: `Button` "Back to variants" only; always a close `ToolButton` (`X`). Icons: `ChevronLeft`, `ChevronRight`, `Columns3`, `X`. Mount it in `BoardChrome` (next to `CollaboratorLayer`) and in `DesignChrome` (inside the inset div, after `CollaboratorLayer`), outside the `!hidden` block so it shows with the UI hidden.
  - en keys (exact): `variants.pick` "Pick a variant", `variants.position` "{label} · {index} of {count}", `variants.previous` "Previous variant", `variants.next` "Next variant", `variants.compareAll` "Compare all", `variants.notePlaceholder` "Add a note for the agent", `variants.keepThis` "Keep this", `variants.keepAll` "Keep all", `variants.back` "Back to variants", `variants.close` "Close without choosing". es: "Elige una variante", "{label} · {index} de {count}", "Variante anterior", "Variante siguiente", "Comparar todas", "Añade una nota para el agente", "Quedarme con esta", "Quedarme con todas", "Volver a las variantes", "Cerrar sin elegir".

- [ ] **Step 3: Tab badge.** `TabVariantsBadge({ tab })`, like `TabKnockBadge`: `useSyncExternalStore` on `variantChoices.store`, shown when `byTab[tab.id]` exists; a `Columns3` icon `size-3.5 animate-pulse text-primary`, `role="img"`, `aria-label={t("variantsWaiting")}`. Placed before `TabKnockBadge` in `TabButton`. Title-bar keys: en `variantsWaiting` "An agent is waiting for you to pick a variant", es "Un agente espera que elijas una variante".

- [ ] **Step 4: Changelog.** Under Unreleased → New in `CHANGELOG.md`: "Pick between an agent's options without leaving the app: when you ask an agent for variants, they appear side by side with a bar to flip through them and keep one or all of them, and the agent continues with your choice. You can add a note for it, such as what to change in the one you kept." Spanish in `CHANGELOG.es.md` under Novedades: "Elige entre las opciones de un agente sin salir de la app: cuando le pides variantes, aparecen una al lado de otra con una barra para recorrerlas y quedarte con una o con todas, y el agente sigue con tu elección. Puedes añadirle una nota, como qué cambiar en la que elegiste."

- [ ] **Step 5: READMEs.** `src/canvas-ui/agent/README.md`: the bar and the hook (the camera moves only on the user's presses and once on first show; delete is the user's step). `src/app/title-bar/README.md`: the badge.

- [ ] **Step 6: Verify**
      Run: `pnpm lint && pnpm typecheck && pnpm format:check`
      Expected: all pass (`check-locales` sees es complete, `check-changelog` sees both files in step).

- [ ] **Step 7: Commit**
  ```bash
  git add src/canvas-ui src/products/board/ui/board-chrome.tsx src/products/design/ui/design-chrome.tsx src/app/title-bar CHANGELOG.md CHANGELOG.es.md
  git commit -m "feat(agents): variant chooser bar and waiting badge on the tab"
  ```

### Task 4: Spec follow-ups

**Files:**

- Modify: `docs/superpowers/specs/2026-11-15-agent-variant-chooser-design.md`

- [ ] **Step 1:** Note the plan's calls that change the spec: the bar sits top centre (the toolbar holds the bottom); the lock covers the whole time a choice is pending (in or past the 25 s); pruned agents keep their chooser; the tools are an app group served like `tabs_*` (`scope: "app"`), with `NO_FILE_OPEN` thrown by the host, rather than two product implementations.

- [ ] **Step 2: Verify and commit**
      Run: `pnpm format:check`
  ```bash
  git add docs/superpowers
  git commit -m "docs(agents): variant chooser spec and plan"
  ```
