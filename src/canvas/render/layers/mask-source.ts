import { AlphaMask, Container, ExtensionType, extensions, type ExtensionMetadata } from "pixi.js";

/**
 * What a mask is drawn from: the mask element's view and the views of what it holds. It's never
 * drawn on its own (`includeInBuild` stays off); its scope renders it into a texture as its mask.
 * Its `order` sorts it before the scope's other children.
 */
export class MaskSource extends Container {
  readonly order = "";

  constructor() {
    super();
    this.includeInBuild = false;
  }
}

/**
 * Pixi masks with a container's pixels only when the container is a `Sprite`; any other container
 * becomes a stencil (its geometry alone). This effect makes a `MaskSource` an alpha mask, which
 * Pixi then renders into a texture each frame.
 */
class MaskSourceEffect extends AlphaMask {
  // Sorted before Pixi's own effects, which would take the source for a stencil.
  static override extension: ExtensionMetadata = { type: ExtensionType.MaskEffect, priority: 10 };

  static override test(mask: unknown): boolean {
    return mask instanceof MaskSource;
  }
}

extensions.add(MaskSourceEffect);
