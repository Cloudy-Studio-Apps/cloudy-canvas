/** The Mermaid nodes of a diagram's shapes. */
export interface ErMermaidNodes {
  /** Each shape's node id, by shape id. */
  ids: ReadonlyMap<string, string>;
  /** One definition per shape (aggregations are subgraphs, `erMermaidAggregates`). */
  lines: string[];
  /** Node ids drawn with a heavier outline: identifying relations. */
  identifying: string[];
  /** Node ids drawn with a dashed outline: derived attributes. */
  derived: string[];
}
