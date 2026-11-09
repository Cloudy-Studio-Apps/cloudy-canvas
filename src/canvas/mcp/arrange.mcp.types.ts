import type { CanvasWorkspace } from "../workspace";

/**
 * How a product reaches the elements of the align, distribute, tidy up and scale tools
 * (`arrangeTools`) and of the copy properties one (`copyPropertiesTool`). Their names,
 * descriptions and arguments are the same in both products, which serve them as shared tools.
 */
export interface ArrangeToolsOptions<H> {
  /** The open canvas, and the ids after checking they exist. Throws when either is missing. */
  resolve(host: H, ids: string[]): { engine: CanvasWorkspace; ids: string[] };
}
