import type { ChangeTextProps } from "./changelog-groups.types";

/** One change's text, its `code` spans shown as code. */
export function ChangeText({ text }: ChangeTextProps) {
  return text.split("`").map((part, index) =>
    index % 2 === 1 ? (
      <code key={index} className="rounded-sm bg-muted px-1 font-mono text-[0.9em]">
        {part}
      </code>
    ) : (
      part
    ),
  );
}
