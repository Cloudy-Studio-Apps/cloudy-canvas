const EXAMPLE = `Entity Cliente {
  *dni              // or dni [pk]
  +teléfono         // multivalued
  /edad             // derived
  dirección {       // composite
    calle
    número
  }
}

Entity Pedido [weak] { ~número }

Relation hace [identifying] {
  Cliente (1,1)
  Pedido (0,n)
  fecha             // relation attribute
}

Isa Cliente [exclusive, total, by: tipo] {
  Particular
  Empresa
}

Aggregate Compra { hace }

Constraint exclusion: r1, r2
Diagram [style: lollipop]`;

/** Collapsible cheat sheet for the ER language (the full reference is docs/er-language.md). */
export function ErSyntaxHint() {
  return (
    <details className="text-xs text-muted-foreground">
      <summary className="cursor-pointer select-none">Syntax</summary>
      <pre className="mt-2 overflow-x-auto rounded-md bg-muted p-2 font-mono leading-relaxed">
        {EXAMPLE}
      </pre>
      <p className="mt-2">
        A relation line with a cardinality, a role (<code>as jefe</code>), <code>[arrow]</code> or
        an entity&apos;s name is a participant; other lines are attributes (force one with{" "}
        <code>attr</code>). Entities a relation names are created when you leave the editor. The
        full reference is in <code>docs/er-language.md</code>.
      </p>
    </details>
  );
}
