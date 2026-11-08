# Tokens in the editor

_How it works. The rules are in the root [CLAUDE.md](../../../CLAUDE.md); the token engine is in
[canvas/tokens/](../../canvas/tokens/README.md) and the whole feature is described in the design's
[variables module](../../products/design/modules/variables/README.md)._

React pieces both products use for variables and styles.

- **`useDocumentTokens()`:** the open document's `DocumentTokens` and its `TokenStore`, re-read when
  the tokens change.
- **`VariablePicker`:** picks a variable for a field: the variables of its type and scopes, by
  collection and group (`TokenGroupAccordion`), with a search; hidden ones show only when searched
  for. `VariableChip` is a bound field's chip, `VariableValue` a variable's value (a swatch, a
  number, ƒ for an expression's result), `TokenSwatch` a color square or circle, `ImportConflicts`
  the choice for imported names the file has.
- **Sources** (a file using project libraries): `useTokenSources(records)` gives where the records
  come from (`TokenSource`: a library, by id and name, or the file itself with `libraryId: null`),
  each library in the project's order, then the file's own, or `null` when none comes from a
  library (the list shows as one, as in a loose file). A library's items are `editable` only while
  the project's libraries are open (`ProjectLibrariesState.status` `ready`); a live guest sees them
  read-only too, since the host's library wins. `groupBySource(items, sources, recordOf?)` splits a
  list by them (`tokenSources` is the pure part). `TokenSourceHeader` heads each group (a library's
  name with a Library badge and the note that editing reaches every file using it, or why it can't
  be edited; "This file" with Local), and `LibraryBadge` marks a library's item. The picker groups
  its collections so, with the note at its foot.
