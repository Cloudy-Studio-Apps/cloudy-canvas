# ER diagrams: roadmap

Where the board's Chen ER diagrams (modelo entidad-relación, extended model) stand, and what's next. The language itself is documented in [`er-language.md`](er-language.md).

## Covered

| Area            | What works                                                                                                                                                                                                 |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Entities        | Strong and weak (double rectangle), color                                                                                                                                                                  |
| Attributes      | Key, partial key (dashed underline), multivalued (double ellipse), derived (dashed ellipse), optional, composite; Chen ellipses or lollipop look                                                           |
| Relations       | Two-way, three-way and larger; `(min,max)` per participant; attributes on relations; roles and self-relations drawn as loops; identifying (double diamond); "I" mark; arrows                               |
| Join attributes | `Cliente.id (0,n)`: the attribute a participant joins through, shown as `(0,n) · id`, picked in the form, completed in the text, added on commit when missing                                              |
| Crow's feet     | Marks on two-way relations, read across from the other side's `(min,max)`                                                                                                                                  |
| Extended model  | Hierarchies (total/partial, exclusive/overlapping, discriminator, parent and child cardinalities, chained); aggregation; exclusive, inclusive, exclusion and inclusion constraints                         |
| Editing         | Text with highlighting and completions; forms; Add menu; palette (click or drag); connect dots; quick-add menu on empty board; relation prompt (1:1, 1:N, N:1, N:M with pictures, then the join attribute) |
| Diagrams        | Several per board; joined when linked across, split when a deletion cuts one apart; auto layout; agent tools                                                                                               |

## Done since the roadmap was written

| Item                                                                                                                            | Where                                                             |
| ------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| Constructs as a registry; each standard forbids some (blocked in the editor, errors in the check, warnings on text lines)       | `base/constructs/`, S27, `docs/plugins.md` (ER constructs)        |
| Standards as a registry, one file each, plugins can add theirs                                                                  | `base/standards/`, `docs/plugins.md` (ER standards)               |
| Form edits that unlink shapes split the diagram, as deletions do                                                                | `ErEdits` (`unlinks`), `splitErDiagrams`                          |
| Join attributes on aggregations are created on commit                                                                           | `addMissingVias`                                                  |
| Weak entities are checked (identifying relation, `(1,1)`, partial key)                                                          | Check diagram (S28)                                               |
| ER to tables                                                                                                                    | S33, `model/to-tables/`, the Create tables dialog, `er_to_tables` |
| Associative entity, Convert to entity                                                                                           | S29, `convert_relation_to_entity`                                 |
| Alternate keys                                                                                                                  | S30                                                               |
| Existence dependency mark, `dependency` setting                                                                                 | S31                                                               |
| Union types (categories)                                                                                                        | S32                                                               |
| Silberschatz's arrows and specialization arrow (`arrows`, `isa: arrow`)                                                         | S27                                                               |
| The ER mode's keys (N entity, A attribute, Shift+A key attribute, R relation, I hierarchy) and the findings drawn on the shapes | `ER_MODE_COMMANDS`, `ErCheckBadges`                               |

## Still open

- **Confirm the approximate standards** (`elmasri`, `silberschatz`, `piattini`) against the books, and adjust their settings or add rules (`check`) where they differ.
- The "E" mark is drawn like the "I" mark until a textbook says otherwise.

## Standards, notation and Check diagram (done)

The `Diagram [ … ]` line (and the ER panel's Visual tab with nothing selected) names the standard a diagram follows (`cloudy`, `chen`, `elmasri`, `silberschatz`, `piattini`, each with its citation and a link) and its drawing settings (`cardinality`, `ratio`, `participation`, `isa`, `crowfeet`; S27 in `er-language.md`). New diagrams read the diamond's ratio across, like the crow's feet; diagrams saved before keep `ratio: own`. The Check diagram (S28) lists what breaks the model's rules or the standard's, in the panel, from the ER mode's Check button and as the `check_er_diagram` agent tool.

## ER mode (done)

Pick **ER diagrams** in the mode switcher beside the toolbar, double-click an ER shape (or press Enter on one), click the ER panel's **Edit diagram** button, or place a new diagram with the ER tool (E). Modes are an API (`CanvasMode` in the engine, `EditorModeEntry` in the editor), so other features (a database mode, plugins) can register their own.

- The main toolbar becomes the ER toolbar: New diagram, Select diagram, Re-layout, Diagram text, Check and **Done**.
- The palette and the ER panel stay open for the whole mode: the panel's × folds it to a small bar (the diagram's name and its count of findings) that a click opens again, and it goes when the mode ends.
- Only ER shapes (of any diagram, so linking two still joins them) can be hovered, selected, marqueed or Ctrl+A'd. Everything else is dimmed, and other tools' shortcuts are held back.
- Inside the mode, double-click renames a shape as before.
- Esc steps back: the selected part, then the selection, then the select tool, then out of the mode. **Done** (or **Board** in the switcher) leaves at once.
- It doesn't lock the board: leaving the mode makes stickies, text and sections next to a diagram usable again.

Its keys add ER shapes (N entity, A attribute, Shift+A key attribute, R relation, I hierarchy, each like its palette item), and the Check diagram's errors and warnings are badges on the shapes.

## Open questions

- Which textbook does the course follow? Its standard can then be checked against the book first, and it decides how the existence mark is drawn.

## Sources

- [Saiedian 1997, ER model extensions (Spanish)](https://people.eecs.ku.edu/~saiedian/Pub/Journal/1997-Saiedian-IST-ER-spanish.pdf)
- [CHP00: cardinalities in Chen, Merise and Teorey](https://cedric.cnam.fr/index2.php/publis/article/CHP00)
- [OpenDSA: ERD notations](https://opendsa-server.cs.vt.edu/ODSA/RST/en/Database/ERDNotations.rst)
- [Software Ideas: Chen ER diagram](https://www.softwareideas.net/chen-er-diagram-erd)
- [LMU: ERD notations, Chen](https://bjohnson.lmu.build/private/ERD-NotationsPart2-ChenNotation.pdf)
- [UC3M: modelo relacional](https://ocw.uc3m.es/pluginfile.php/368/mod_page/content/23/modelo_relacional.pdf)
- [Universidad Veracruzana: ER extendido](https://www.uv.mx/personal/ermeneses/files/2020/09/Clase5-ModelosDeDatos_parteII_ER-Extendido-1.pdf)
- [Goucher: EER notes](https://phoenix.goucher.edu/~kelliher/s2025/cs417/n03.pdf)
- [Purdue: EER modeling, ch. 4](<https://www.cs.purdue.edu/homes/bb/cs448_Spring2014/lecture-files/pdf/ch04-Enhanced%20Entity-Relationship%20(EER)%20Modeling.pdf>)
- [KFUPM: EER lecture](https://faculty.kfupm.edu.sa/ics/adam/ICS324/L21_22_EER.pdf)
- [Miro: weak entities](https://miro.com/diagramming/weak-entity-in-er-diagrams/)
