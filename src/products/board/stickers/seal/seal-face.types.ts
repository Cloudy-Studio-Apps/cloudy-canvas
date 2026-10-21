/** One "foca watona" expression: the parts drawn on top of the shared head. */
export interface SealFace {
  /** Eyes (and brows), from `SEAL_EYES` or custom markup. */
  eyes: string;
  /** Drawn under the muzzle; the muzzle alone reads as a calm ω. */
  mouth?: string;
  /** Drawn behind the head (raised flippers). */
  back?: string;
  /** Drawn over everything (props, hearts, tears). */
  front?: string;
  /** Opacity of the blush on the cheeks (0.75 by default). */
  blush?: number;
}
