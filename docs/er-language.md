# ER diagrams: language and visual editor

Cloudy Canvas draws **Entity–Relationship diagrams** in Chen notation, including the extended model: hierarchies, aggregation and constraints. You can build them two ways, and both edit the same diagram:

- With the **visual editor**. Select a shape and use the form in the **ER diagram** panel, or use the **Add** menu.
- With **text**, in the panel's **Text** tab, using the language described below.

The shapes are the source of truth, and the text is a view of them. Everything is matched **by name** (then by position, for renames), so renaming something in the text keeps its place on the board. New shapes are laid out automatically. You can drag anything you like, and **Re-layout** tidies the whole diagram again.

A board can hold **several ER diagrams**. Each one has its own text, layout and names, so two diagrams side by side can both have a `Cliente` entity. Selecting any shape shows its diagram in the panel.

The rule ids (**S1**…) match the syntax review, so you can refer to them ("S18: rename `Isa` to …").

---

## Getting started

1. Press **E** (or use the ER button in the toolbar) and click the board. A new diagram starts with one entity, and the panel opens.
2. Either fill in the form, or open **Text** and paste a whole model. Pasting over the first entity lays the diagram out fresh where that entity was.
3. **Double-click** any entity, relation, attribute or aggregation on the board to rename it in place.

The panel header has six controls:

| Control                 | What it does                                                                                                                                               |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Diagram name and ⌄**  | Renames the shown diagram, lists the board's diagrams (picking one takes you to it) and starts a **New diagram**.                                          |
| **+ Add**               | Adds an entity, relation, hierarchy, aggregation or constraint. It starts from the selection when that makes sense (for example, "Relation from Cliente"). |
| **Egg / circle button** | Switches attributes between Chen ellipses and lollipop circles (S21).                                                                                      |
| **Select button**       | Selects the whole shown diagram, so you can drag it as one.                                                                                                |
| **Grid button**         | Re-layout of the shown diagram. One undo reverts it.                                                                                                       |
| **×**                   | Closes the panel.                                                                                                                                          |

---

## Part A: Basics

**S1. Comments:** `// one line` or `/* several lines */`.

**S2. Names:** letters (accents included), digits and `_`, for example `dirección`, `fecha_nac` or `Cliente2`.

- Quote anything else: `"fecha de nacimiento"`.
- Keywords are case-insensitive.

**S3. Settings** go in square brackets after a name, separated by commas: `[pk, multi]`.

**S4. One item per line** inside `{ … }`. A trailing comma is allowed.

---

## Part B: Entities and attributes

**S5. Entity.** The block is optional, so `Entity Producto` alone works.

```
Entity Cliente {
  dni [pk]
  nombre
}
```

**S6. Weak entity** (drawn as a double rectangle):

```
Entity Ejemplar [weak] {
  número [partial]
}
```

**S7. Attribute settings:**

| Setting                           | Short form (S10) | Meaning                      | Drawn as                                       |
| --------------------------------- | ---------------- | ---------------------------- | ---------------------------------------------- |
| `[pk]` (alias `[key]`)            | `*dni`           | Key attribute                | Underlined name (filled dot in lollipop style) |
| `[partial]`                       | `~número`        | Partial key of a weak entity | Dashed underline                               |
| `[multi]` (alias `[multivalued]`) | `+teléfono`      | Multivalued                  | Double ellipse                                 |
| `[derived]`                       | `/edad`          | Derived (calculated)         | Dashed ellipse                                 |
| `[optional]` (S8)                 | none             | Optional                     | Half-filled circle in lollipop style           |

**S9. Composite attribute.** Its parts fan out from it:

```
  dirección {
    calle
    número
  }
```

**S22. Color** (entities and relations): `Entity Cliente [color: #3a83c9]`.

---

## Part C: Relations

**S11. Relation:**

```
Relation compra {
  Cliente (0,n)
  Producto (0,n)
  fecha            // an attribute of the relation
}
```

**S12. How a line inside a relation is read:**

- It's a **participant** when it has a cardinality, a role or `[arrow]`, or simply names an entity or aggregation.
- Anything else is an **attribute** of the relation.
- Write `attr name` to force an attribute, even when the name matches an entity.

**S13. Cardinality `(min,max)`:**

- `min` is a number.
- `max` is a number, `n`, `m` or `*`.
- `(1:n)` also works.
- Cardinality is optional.

**S14. Ratio label.** `1:1`, `1:N`, `N:M` or `1:N:N` (three or more participants) is computed from the max values. You never type it.

**S15. Roles.** An entity related to itself is drawn as a loop:

```
Relation supervisa {
  Empleado (0,1) as jefe
  Empleado (0,n) as subordinado
}
```

**S16. Identifying marks:**

- `[identifying]` draws a double diamond.
- `[id]` draws the "I" bar at the top of the diamond.
- You can use both.

**S24. Arrows.** `Alumnos (1,n) [arrow]` draws an arrowhead at the entity end.

**S25. Join attribute.** `Entity.attribute` names the attribute a participant joins through, usually its key:

```
Relation pide {
  Cliente.id (0,n)
  Pedido (1,1)
}
```

- A line written this way is always a participant.
- The attribute must belong to that entity. While you type, a missing one is an error. When you leave the editor (or paste), it's added: as a key if the entity has none yet, otherwise as a plain attribute.
- The board shows it next to the cardinality: `(0,n) · id`.

**S26. Crow's feet.** A relation with two participants also draws crow's-foot marks where its lines meet the entities, read across from the other side's cardinality. For `Cliente (0,n)` and `Pedido (1,1)`: a fork and a circle at `Pedido` (a Cliente has zero or many Pedido), and two bars at `Cliente` (a Pedido has exactly one Cliente). You never type them.

- Deleting the attribute removes the join and keeps the participant.
- In the form, each participant has a **Joins by** select.

**Building relations by dragging.** Drag a connect dot from an entity onto another entity (or an aggregation). A prompt asks what kind of relation it is (one to one, one to many, many to one or many to many), each with a picture and a sentence using the two names. It then asks which attribute the join goes through: the entity's key by default, a new key attribute `id`, or none. Many to many asks for both sides. Only then is the relation created, as one undo step. Esc or a click elsewhere cancels.

**S17. Missing entities.** If a relation or hierarchy names an entity that doesn't exist, it's **created** (empty) when you paste or leave the editor, with a note such as "Created the missing entity Factura". While you type, it shows as an error instead, so half-typed names don't turn into entities.

---

## Part D: Extended ER

**S18. Hierarchy / generalization** (the "ES UN" triangle):

```
Isa Empleado (1,1) [exclusive, total, by: tipo] {
  Astronauta
  Técnico (0,1)
  Científico
}
```

| Part                            | Meaning                                     | Drawn as                                   |
| ------------------------------- | ------------------------------------------- | ------------------------------------------ |
| `[exclusive]` / `[overlapping]` | Exclusiva / solapada (default: overlapping) | Arc under the triangle, or none            |
| `[total]` / `[partial]`         | Total / parcial (default: partial)          | Small circle on the parent's line, or none |
| `[by: tipo]`                    | Discriminator attribute                     | Attribute on the triangle                  |
| `Isa Parent (1,1)` (S23)        | Parent cardinality (optional)               | Label on the parent's line                 |
| `Child (0,1)`                   | Child cardinality (optional)                | Label on the child's line                  |

- Children that don't exist yet are created (S17). Give them attributes with their own `Entity Técnico { … }`.
- **Inline form:** `Entity Técnico [isa: Empleado] { … }` adds Técnico to Empleado's hierarchy.
- **S25. Chained hierarchies** work: a child can be the parent of another `Isa`.

**S19. Aggregation.** A box around a relation and its entities, which then takes part in other relations like an entity. The first line is the relation; the rest are the aggregation's own attributes.

```
Relation esta_casado_con {
  Hombre (1,1)
  Mujer (1,1)
}

Aggregate Matrimonio { esta_casado_con
  fecha_boda
}

Relation reside_en {
  Matrimonio (0,n)
  Dirección (1,1)
}
```

- Dragging the box moves everything inside it.
- Deleting the box keeps its contents.

**S20. Constraints between relations:**

```
Constraint exclusive Empleado: asignado, pertenece        // exclusividad: only one of them (arc)
Constraint inclusive Empleado (2,n): asiste -> diseña     // inclusividad: diseña needs asiste 2+ times
Constraint exclusion: diseña, fabrica                     // exclusión: not both (line between diamonds)
Constraint inclusion: se_casa -> se_divorcia              // inclusión: se_divorcia needs se_casa (arrow)
```

- `->` points from the requirement to the relation that needs it.
- Naming an unknown relation is an error.
- Removing a relation removes its constraints.

---

## Part E: Look

**S21. Attribute style.** Attributes are drawn as Chen ellipses by default. Switch to **lollipop** circles (keys filled black) with the panel button, or with this line at the top of the text:

```
Diagram [style: lollipop]
```

**S26. Diagram name.** The same line can name the diagram; the name shows in the panel header and its list of diagrams:

```
Diagram Ventas [style: lollipop]
```

When a shape is selected, the Text tab scrolls to its block and highlights it (an attribute highlights its owner's block).

**S27. Notation.** The same line says how the diagram is drawn. The model doesn't change, only its look. With no shape selected, the panel's **Visual** tab shows the same settings as pictures to pick from:

```
Diagram Ventas [notation: chen, ratio: across, participation: both, isa: circle, crowfeet: off]
```

| Setting         | Values                               | What it draws                                                                                                                                  |
| --------------- | ------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `notation`      | `chen` (the default)                 | The preset the other settings start from.                                                                                                      |
| `ratio`         | `across` (default), `own`            | The diamond's `1:N`: read across like the crow's feet (`Cliente (0,n)`, `Pedido (1,1)` is `1:N`), or from each side's own maximum (`N:1`).     |
| `participation` | `numbers` (default), `lines`, `both` | `(min,max)` labels, a double line where the minimum is at least 1, or both.                                                                    |
| `isa`           | `arc` (default), `circle`            | Hierarchies as the triangle with an arc, or a circle with **d** (exclusive) or **o** (overlapping); a total one's parent line is then doubled. |
| `crowfeet`      | `on` (default), `off`                | Crow's-foot marks on two-way relations.                                                                                                        |

- Only what differs from the preset is written back.
- Diagrams made before notations existed keep their first look: the text shows `ratio: own` on them. Change it to `across` (or pick it in the menu) to read the diamond like the crow's feet.
- Joining two diagrams keeps the notation of the one you dragged from.

---

## Part F: Full examples

### Actividad 11 (basic)

```
Entity Cliente {
  *dni
  nombre
  apellidos
  fecha_nac
  tfno
}

Entity Producto {
  *código
  nombre
  precio
}

Entity Proveedor {
  *nif
  nombre
  dirección
}

Relation compra {
  Cliente (0,n)
  Producto (0,n)
}

Relation suministra {
  Proveedor (1,1)
  Producto (1,n)
}
```

### Actividad 31: Star Trek (hierarchy)

```
Entity Personaje {
  *código
  nombre
  grado
}

Isa Personaje [exclusive, total, by: raza] {
  Humano
  Klingon
  Vulcano
}

Entity Humano {
  ciudad
  f_nacim
}

Entity Klingon {
  planeta
  f_ult_combate
}

Entity Vulcano {
  mentor
  fecha_grado
}
```

### Actividad 38: ONG Reyes Magos (weak entity, "I" mark, derived, loop)

```
Entity Vecino {
  *dni
  nombre
  apellidos
  rey_mago
}

Entity GrupoVecinos {
  *nombre
  barrio
  /n_integrantes
}

Entity Eventos [weak] {
  ~fecha_hora
  ubicación
}

Entity Niño {
  *código
  nombre
  dirección
}

Relation convence {
  Vecino (1,1) as captador
  Vecino (1,n) as convencido
}

Relation pertenece {
  Vecino (1,n)
  GrupoVecinos (1,1)
}

Relation organiza [id] {
  GrupoVecinos (1,1)
  Eventos (0,n)
}

Relation acude {
  Niño (1,n)
  Eventos (0,1)
}
```

### Actividad 37: Videoteca (aggregation, hierarchy, lollipop)

```
Diagram [style: lollipop]

Entity Socios {
  *num_soc
  nombre
  dirección
  dni [optional]
}

Entity Productos {
  *id_prod
  título
  num_copia
}

Entity Empleados {
  *dni
  nombre
  tfno
  dirección
}

Relation tiene_en_prestamo {
  Socios (1,n) [arrow]
  Productos (0,n) [arrow]
}

Aggregate Prestado { tiene_en_prestamo }

Relation préstamo {
  Prestado (0,n) [arrow]
  Empleados (1,1)
  fech_pres
  fech_dev
}

Isa Productos [exclusive, by: tipo_producto] {
  Discos
  Vídeos
}

Entity Discos {
  discografía
  autores
}

Entity Vídeos {
  protagonista
  duración
  director
}
```

### Constraints (slide 112)

```
Relation asignado {
  Empleado (0,1)
  GrupoPracticas (0,n)
}

Relation pertenece {
  Empleado (0,1)
  Departamento (0,n)
}

Relation asiste {
  Empleado (0,n)
  Curso (0,n)
}

Relation diseña {
  Empleado (0,n)
  Producto (0,n)
}

Relation fabrica {
  Empleado (0,n)
  Producto (0,n)
}

Constraint exclusive Empleado: asignado, pertenece
Constraint inclusive Empleado (2,n): asiste -> diseña
Constraint exclusion: diseña, fabrica
```

---

## Visual editor reference

The **Visual** tab shows a form for the selected shape. Every change is one undo step, and new shapes are placed for you.

| Selected    | Form                                                                                                                                                           |
| ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Entity      | Name, **Weak**, outline color, attributes, "Used in" (click to jump), **Add hierarchy**                                                                        |
| Attribute   | Name and the PK / PK~ / Multi / Derived / Opt toggles; ↑ ↓ to reorder; "Add a part" makes it composite; a button to edit its owner                             |
| Relation    | Name, **Identifying**, **I mark**, the computed ratio; participants (entity or aggregation, `(min,max)`, role, **Arrow**); attributes; **Make an aggregation** |
| Hierarchy   | Parent and its cardinality, Overlapping/Exclusive, Partial/Total, discriminator, children (pick existing or **New entity**)                                    |
| Aggregation | Name, the relation it groups, its attributes                                                                                                                   |
| Constraint  | Kind, entity (for exclusividad/inclusividad), the two relations (with a swap button), how many times (inclusividad)                                            |
