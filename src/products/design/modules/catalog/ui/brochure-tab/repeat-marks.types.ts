export interface RepeatBracketProps {
  /** The depth of the run it marks (`PageTreeRow.bracket`); nothing drawn for `null`. */
  depth: number | null;
}

export interface RepeatMarkProps {
  /** A template that repeats (its loop's badge) or a copy a repeat made (the data mark). */
  kind: "template" | "copy";
  /** What it says on hover and to a screen reader. */
  label: string;
}
