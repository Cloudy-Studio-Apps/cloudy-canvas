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

## Almost covered

These exist but are incomplete or have a known flaw.

| Item                                    | What's missing                                                                                                                                           |
| --------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Weak entities**                       | Drawn, but nothing checks that they have an identifying relation, total `(1,1)` participation in it, and a partial key.                                  |
| **Identifying vs existence dependency** | `[id]` draws the "I" mark; there's no existence ("E") mark. Needs the exact notation of the course's textbook (de Miguel & Piattini?) before drawing it. |
| **Three-way and larger relations**      | Fully drawn, but no crow's feet (none exist in the notation) and no way to turn one into an associative entity.                                          |
| **Removing a participant in the form**  | Doesn't split a diagram it disconnects (canvas deletions do).                                                                                            |
| **Join attribute on aggregations**      | Parsed and stored, but missing attributes are only auto-created for entities.                                                                            |

## To implement

Ordered by value. Each is a separate piece of work.

1. **ER to tables.** Turn a diagram into DBML tables on the same board with the standard rules:
   - entity → table, key → primary key, composite → its parts, multivalued → its own table, derived → left out;
   - weak entity → table whose key includes the owner's key;
   - 1:N → foreign key on the N side to the join attribute (or the key);
   - 1:1 → foreign key on one side, unique;
   - N:M and three-way → a link table;
   - hierarchy → one table per entity with the parent's key, or one table with a discriminator (ask);
   - aggregation → its relation's table.
     One undo step; re-running updates the same tables by name.
2. **Associative entity.** A rectangle with a diamond inside: a relation that is also an entity (takes part in other relations, has a key). Plus **Convert to entity** on a relation: replaces it with an associative entity and one two-way relation per participant, which then get crow's feet.
3. **Confirm the approximate standards** (`elmasri`, `silberschatz`, `piattini`) against the books, and add what they draw that the board can't yet: Silberschatz's arrows and specialization arrow, Elmasri's categories, the "E" existence mark (`dependency: marks`, needs item 6).
4. **Alternate keys.** `[ak]` for candidate keys that aren't the primary key; hollow lollipop, plain underline variant.
5. **Union types (categories).** `Union Propietario { Persona, Banco, Empresa }`, a "U" circle. Elmasri advises against them; low priority.
6. **Existence dependency mark.** `[existence]`, an "E" next to the "I", once the notation is confirmed.

## Standards, notation and Check diagram (done)

The `Diagram [ … ]` line (and the ER panel's Visual tab with nothing selected) names the standard a diagram follows (`cloudy`, `chen`, `elmasri`, `silberschatz`, `piattini`, each with its citation and a link) and its drawing settings (`cardinality`, `ratio`, `participation`, `isa`, `crowfeet`; S27 in `er-language.md`). New diagrams read the diamond's ratio across, like the crow's feet; diagrams saved before keep `ratio: own`. The Check diagram (S28) lists what breaks the model's rules or the standard's, in the panel, from the ER mode's Check button and as the `check_er_diagram` agent tool.

## ER mode (done)

Double-click an ER shape (or press Enter on one), click the ER panel's **Edit diagram** button, or place a new diagram with the ER tool (E).

- The main toolbar becomes the ER toolbar: New diagram, Select diagram, Re-layout, Diagram text and **Done**.
- The palette and the ER panel stay open for the whole mode.
- Only ER shapes (of any diagram, so linking two still joins them) can be hovered, selected, marqueed or Ctrl+A'd. Everything else is dimmed, and other tools' shortcuts are held back.
- Inside the mode, double-click renames a shape as before.
- Esc steps back: the selected part, then the selection, then out of the mode. **Done** leaves at once.
- It doesn't lock the board: leaving the mode makes stickies, text and sections next to a diagram usable again.

Still to do for the mode:

- Keys that create ER shapes (for example A for an attribute of the selection, R for a relation).
- Showing the Check diagram's findings on the shapes themselves while the mode is on.

## Open questions

- Which textbook does the course follow? Its standard can then be checked against the book first (item 3), and it decides the existence mark (item 6).
- In ER to tables, which hierarchy strategy is the default?

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
