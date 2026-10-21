const EXAMPLE = `Entity Cliente {
  dni [pk]
  nombre
  tfno [multi]
  edad [derived]
  dirección {
    calle
    número
  }
}

Entity Pedido [weak] {
  número [partial]
}

Relation hace [identifying] {
  Cliente (1,1)
  Pedido (0,n)
  fecha
}`;

/** Collapsible cheat sheet for the ER language. */
export function ErSyntaxHint() {
  return (
    <details className="text-xs text-muted-foreground">
      <summary className="cursor-pointer select-none">Syntax</summary>
      <pre className="mt-2 rounded-md bg-muted p-2 font-mono leading-relaxed">{EXAMPLE}</pre>
      <p className="mt-2">
        A relation line with a cardinality, a role (<code>as jefe</code>) or an entity&apos;s name
        is a participant; any other line is an attribute of the relation.
      </p>
    </details>
  );
}
