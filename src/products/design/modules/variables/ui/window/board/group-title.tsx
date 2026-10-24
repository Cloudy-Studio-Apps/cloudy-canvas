import { CommitInput } from "@canvas-ui";
import { useBoard } from "../use-board";
import type { GroupTitleProps } from "./board.types";

/** A group's title: its name, renamed in place (its variables move), its count and what it holds. */
export function GroupTitle({ group, count, label }: GroupTitleProps) {
  const { tokens, collection } = useBoard();
  return (
    <div className="mb-2 flex items-baseline gap-2">
      {group ? (
        <CommitInput
          aria-label="Group name"
          title="Rename group"
          value={group}
          onCommit={(to) => {
            if (collection && to.trim()) tokens.renameGroup(collection.id, group, to);
          }}
          className="[field-sizing:content] h-6 w-auto max-w-56 border-transparent bg-transparent px-1 text-sm font-semibold shadow-none hover:border-border"
        />
      ) : (
        <span className="text-sm font-semibold">Ungrouped</span>
      )}
      <span className="text-xs text-subtle-foreground">
        {count} · {label}
      </span>
    </div>
  );
}
