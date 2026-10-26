# Section (Board module)

_How it works. The rules are in the root [CLAUDE.md](../../../../../CLAUDE.md); names may still follow the pre-refactor conventions until their phase (see its Transition table)._

## Section

- `section/`: `SectionKind extends TextBoxKind`, a frame (`frame = true`) with its title edited in place in the strip along its top edge. It's hit by its title or border only, so clicks inside reach its contents. Membership is geometric: the elements fully inside it move and delete with it (`withSectionMembers`, part of the board's `withMembers`), so nothing stores parent links. The top bar's Sections menu (`ui/sections-menu/`) zooms to one.
