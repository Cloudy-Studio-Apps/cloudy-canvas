/** A column as an entity property: its decorator, the property line and what it imports. */
export interface TypeormColumn {
  decorator: string;
  property: string;
  /** The `typeorm` decorator it uses, e.g. `Column`. */
  uses: string;
}
