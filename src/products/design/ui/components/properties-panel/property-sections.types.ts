export interface PropertySectionsProps {
  tab: "design" | "prototype";
  /** Only these sections (ids), when given (a mode's kept sections). */
  only?: readonly string[];
}
