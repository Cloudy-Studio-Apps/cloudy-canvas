/** The colors a new project starts from, one picked at random. */
export const PROJECT_COLORS = ["#3f6b4f", "#b8643a", "#3b5fb0", "#b8433a", "#6b4fa0", "#2f7f86"];

export function randomProjectColor(): string {
  return PROJECT_COLORS[Math.floor(Math.random() * PROJECT_COLORS.length)] ?? "#3b5fb0";
}
