/** An option's letter in its page (A, B, C, …), as the page badges and lists show them. */
export function optionLetter(position: number): string {
  return position < 26 ? String.fromCharCode(65 + position) : String(position + 1);
}
