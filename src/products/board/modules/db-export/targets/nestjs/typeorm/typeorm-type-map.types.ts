/** A column's TypeORM type option and the property's TypeScript type. */
export interface TypeormType {
  /** `type:` in `@Column`, e.g. `varchar`. */
  db: string;
  ts: string;
  /** `length`, `precision`, `scale`… */
  extra: string[];
}
