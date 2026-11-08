export interface ProjectIconProps {
  name: string;
  /** `#rrggbb`. */
  color: string;
  /** A picture to show instead of the initials (a URL). */
  image?: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
}
