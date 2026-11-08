/** Words a name problem for one kind of item: `twice` in the text, or `taken` elsewhere on the board. */
export type NameProblemMessage = (problem: "twice" | "taken", name: string) => string;
