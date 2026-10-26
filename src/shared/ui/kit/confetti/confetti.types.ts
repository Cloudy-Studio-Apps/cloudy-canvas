export interface ConfettiProps {
  /** The pieces' colors (any CSS color); the theme's primary, accent and status colors without. */
  colors?: readonly string[];
  /** Changing it bursts again. */
  burst?: number | string;
  /** How many pieces. Default 170. */
  count?: number;
  className?: string;
}

/** One piece of confetti while it falls. */
export interface ConfettiPiece {
  x: number;
  y: number;
  vx: number;
  vy: number;
  w: number;
  h: number;
  angle: number;
  spin: number;
  color: string;
  round: boolean;
}
