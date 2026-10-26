/**
 * How generated content looks where templates don't say otherwise. It's document content (saved
 * with the file, the same in every theme), so these are data colors, not UI tokens.
 */
export const SHEET_LOOK = {
  font: "Inter",
  ink: "#1F2328",
  muted: "#6B7280",
  line: "#E5E7EB",
  surface: "#FFFFFF",
  /** Font sizes: a category's heading, a group's title, labels. */
  heading: 40,
  title: 20,
  label: 12,
  /** Gaps: between items, between a group's title and body, between groups. */
  gap: 24,
  titleGap: 16,
  groupGap: 48,
  /** Inside a sheet. */
  padding: 64,
} as const;
