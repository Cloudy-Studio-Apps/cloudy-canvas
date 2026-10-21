# ER language: syntax draft (temporary, for review)

Every rule has an id (**S1**, **S2**, …) so you can answer things like "S7: rename to …", "S12: drop it" or "S15: make it shorter".

- ✅ means it already works today.
- 🆕 means a proposal that isn't built yet.
- ❓ means an open question for you.

---

## Part A: Basics

**S1 ✅ Comments.** Use `// one line` or `/* several lines */`.

**S2 ✅ Names.**
- Letters (accents included), digits and `_`, for example `dirección`, `fecha_nac`, `Cliente2`.
- Use quotes for anything else: `"fecha de nacimiento"`.
- Upper and lower case are kept as written. Keywords are case-insensitive: `entity`, `Entity` and `ENTITY` all work.

**S3 ✅ Settings** go in square brackets after a name, separated by commas: `[pk, multi]`.

**S4 ✅ One item per line** inside `{ … }`. A trailing comma is allowed and ignored.

---

## Part B: Entities and attributes

**S5 ✅ Entity**
```
Entity Cliente {
  dni [pk]
  nombre
}
```

**S6 ✅ Weak entity** (double rectangle)
```
Entity Ejemplar [weak] {
  número [partial]
}
```

**S7 ✅ Attribute settings**

| Setting | Meaning | Drawn as |
|---|---|---|
| `[pk]` (alias `[key]`) | Key attribute | Underlined name |
| `[partial]` | Partial key of a weak entity | Dashed underline |
| `[multi]` (alias `[multivalued]`) | Multivalued attribute | Double ellipse |
| `[derived]` | Derived (calculated) attribute | Dashed ellipse |

**S8 🆕 ❓ Optional attribute** `[optional]`. Your PDF draws these as a half-filled circle in the "lollipop" style (Actividad 37). Do you want it?

**S9 ✅ Composite attribute.** Its parts fan out from the attribute's own ellipse.
```
  dirección {
    calle
    número
    ciudad
  }
```

**S10 🆕 ❓ Short symbols** (optional, alongside the settings):

| Symbol | Same as |
|---|---|
| `*dni` | `dni [pk]` |
| `~número` | `número [partial]` |
| `+teléfono` | `teléfono [multi]` |
| `/edad` | `edad [derived]` (the slash is the UML convention for derived) |

Should we add these, or keep only the `[...]` form?

---

## Part C: Relations

**S11 ✅ Relation**
```
Relation compra {
  Cliente (0,n)
  Producto (0,n)
  fecha            // attribute of the relation
}
```

**S12 ✅ How a line inside a relation is read:**
- It's a **participant** if it has a cardinality, a role, or names an entity.
- Otherwise it's an **attribute of the relation**.

❓ Would you rather mark relation attributes explicitly, to avoid any guessing? For example:
```
Relation compra {
  Cliente (0,n)
  Producto (0,n)
  attr fecha
}
```

**S13 ✅ Cardinality `(min,max)`.**
- `min` is a number.
- `max` is a number, `n`, `m` or `*`.
- `(1:n)` also works (your PDF writes both).
- Cardinality is optional.

**S14 ✅ Ratio label** (`1:1`, `1:N`, `N:M`). It's **computed** from the max values, never typed.

🆕 For three or more participants, show it as `1:N:N` like your PDF. Today nothing is shown in that case.

**S15 ✅ Roles** for an entity related to itself. 🆕 These would be drawn as a **loop**, like "convence" and "Representa" in your PDF.
```
Relation supervisa {
  Empleado (0,1) as jefe
  Empleado (0,n) as subordinado
}
```

**S16 ✅ Identifying relation** `[identifying]` (double diamond).

❓ Your PDF also draws an **"I" at the top of the diamond** (Actividades 38 and 40). Which do you prefer?
- (a) The double diamond, as now.
- (b) The "I" mark.
- (c) Both, with two settings: `[identifying]` for the double diamond and `[id]` for the "I".

**S17 🆕 Missing entities are created automatically.** If a relation names an entity that doesn't exist, it's created (empty) with a notice such as "Created the missing entity Factura".
- This happens on **paste** and when you **leave the editor**, not while you type, so half-typed names don't turn into entities. The DB tables already work this way.
- ❓ Or should it be created immediately, even while typing?

---

## Part D: Extended ER (from your PDF)

**S18 🆕 Hierarchy / generalization ("ES UN" triangle)**
```
Isa Empleado [exclusive, total, by: tipo] {
  Astronauta
  Técnico (0,1)
  Científico
}
```
- The parent goes on top; the children in the block are drawn below the triangle.
- Children that aren't defined yet are created (S17). You can still write `Entity Técnico { … }` for their own attributes.
- Settings:

| Setting | Meaning | Drawn as |
|---|---|---|
| `[exclusive]` / `[overlapping]` | Exclusiva / solapada | Arc under the triangle, or none |
| `[total]` / `[partial]` | Total / parcial | Small circle on the parent's line, or none |
| `[by: tipo]` | Discriminator attribute | Small attribute on the triangle |
| Child `(0,1)` | Child cardinality | Label on the child's line |

- ❓ Defaults: **overlapping + partial** (no arc, no circle)?
- ❓ Keyword: `Isa`, `Hierarchy`, `Generalization` or `Is`?
- ❓ Alternative inline form: `Entity Técnico [isa: Empleado] { … }`. Do you want it as well?

**S19 🆕 Aggregation** (a box around a relation and its entities, used like an entity)
```
Relation esta_casado_con {
  Hombre (1,1)
  Mujer (1,1)
}

Aggregate Matrimonio { esta_casado_con }

Relation reside_en {
  Matrimonio (0,n)      // the aggregation takes part like an entity
  Dirección (1,1)
}
```
- The box can also carry attributes:
```
Aggregate Matrimonio { esta_casado_con
  fecha_boda
}
```
- ❓ Keyword: `Aggregate`, `Aggregation` or `Group`?

**S20 🆕 Constraints between relations.** They're drawn like the slides: an arc, an arrow, or a dashed line between diamonds.
```
Constraint exclusive Empleado: asignado, pertenece        // exclusividad: only one of them (arc)
Constraint inclusive Empleado (2,n): asiste -> diseña     // inclusividad: diseña needs asiste at least 2 times
Constraint exclusion: diseña, fabrica                     // exclusión: not both for the same pair
Constraint inclusion: se_casa -> se_divorcia              // inclusión: se_divorcia needs se_casa first
```
- `->` points from the requirement to the relation that needs it.
- ❓ Keep a single `Constraint` keyword with the kind after it, or use four keywords (`Exclusive …`, `Inclusive …`, `Exclusion …`, `Inclusion …`)?

---

## Part E: Look (not part of the text)

**S21 🆕 ❓ Notation style.** Each diagram could switch between two styles:
- **Chen** (now): ellipses with names, keys underlined.
- **Lollipop**: small circles on sticks, keys filled black, like Actividades 32–35 and 37.

Choose it with a setting in the panel, or with a first line such as `Diagram [style: lollipop]`?

**S22 🆕 ❓ Colors.** `Entity Cliente [color: #e0484d]`? Or leave colors to the panel only?

---

## Part F: Full examples

### Actividad 11 (basic)
```
Entity Cliente {
  dni [pk]
  nombre
  apellidos
  fecha_nac
  tfno
}

Entity Producto {
  código [pk]
  nombre
  precio
}

Entity Proveedor {
  nif [pk]
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
  código [pk]
  nombre
  grado
}

Isa Personaje [exclusive, total, by: raza] {
  Humano
  Klingon
  Vulcano
}

Entity Humano { ciudad
  f_nacim
}
Entity Klingon { planeta
  f_ult_combate
}
Entity Vulcano { mentor
  fecha_grado
}
```

### Actividad 38: ONG Reyes Magos (weak entity, identifying relation, derived and partial keys)
```
Entity Vecino {
  dni [pk]
  nombre
  apellidos
  rey_mago
}

Entity GrupoVecinos {
  nombre [pk]
  barrio
  n_integrantes [derived]
}

Entity Eventos [weak] {
  fecha_hora [partial]
  ubicación
}

Entity Niño {
  código [pk]
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

Relation organiza [identifying] {
  GrupoVecinos (1,1)
  Eventos (0,n)
}

Relation acude {
  Niño (1,n)
  Eventos (0,1)
}
```

### Actividad 37: Videoteca (aggregation and hierarchy)
```
Entity Socios {
  num_soc [pk]
  nombre
  dirección
  dni
}

Entity Productos {
  id_prod [pk]
  título
  num_copia
}

Entity Empleados {
  dni [pk]
  nombre
  tfno
  dirección
}

Relation tiene_en_prestamo {
  Socios (1,n)
  Productos (0,n)
}

Aggregate Prestado { tiene_en_prestamo }

Relation préstamo {
  Prestado (0,n)
  Empleados (1,1)
  fech_pres
  fech_dev
}

Isa Productos [exclusive, by: tipo_producto] {
  Discos
  Vídeos
}

Entity Discos { discografía
  autores [multi]
}
Entity Vídeos { protagonista
  duración
  director
}
```

### Constraints (slide 112)
```
Constraint exclusive Empleado: asignado, pertenece
Constraint inclusive Empleado (2,n): asiste -> diseña
Constraint exclusion: diseña, fabrica
Constraint inclusion: se_casa -> se_divorcia
```

---

## Open questions in one list

1. **S8:** `[optional]` attributes, yes or no?
2. **S10:** short symbols `* ~ + /`, yes or no?
3. **S12:** mark relation attributes with `attr`, or keep guessing them?
4. **S16:** identifying relations as a double diamond, an "I", or both?
5. **S17:** create missing entities on paste/blur, or immediately?
6. **S18:** hierarchy keyword and defaults? Inline `[isa: …]` too?
7. **S19:** aggregation keyword?
8. **S20:** one `Constraint` keyword, or four keywords?
9. **S21:** lollipop style, chosen in the panel or in the text?
10. **S22:** colors in the text?
