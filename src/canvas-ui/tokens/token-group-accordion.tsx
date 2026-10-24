import { ChevronRight } from "lucide-react";

import type { TokenGroupNode } from "@canvas";
import { cn } from "@shared/ui/lib/utils";
import type { GroupBodyProps, TokenGroupAccordionProps } from "./tokens.types";
import { useOpenGroups } from "./use-open-groups";

/**
 * Variables in their groups (slash paths) as nested accordions: the root's variables first, then
 * each group, collapsed until opened (remembered per `storageKey`).
 */
export function TokenGroupAccordion<T extends { id: string; name: string }>(
  props: TokenGroupAccordionProps<T>,
) {
  const [open, toggle] = useOpenGroups(props.storageKey);
  return <GroupBody {...props} open={open} toggle={toggle} depth={0} />;
}

function GroupBody<T extends { id: string; name: string }>({
  group,
  open,
  toggle,
  depth,
  ...props
}: GroupBodyProps<T>) {
  return (
    <div className="flex flex-col">
      {group.variables.map((variable) => (
        <div key={variable.id}>{props.renderVariable(variable)}</div>
      ))}
      {group.groups.map((child) => (
        <GroupSection
          key={child.path}
          {...props}
          group={child}
          open={open}
          toggle={toggle}
          depth={depth}
        />
      ))}
    </div>
  );
}

function GroupSection<T extends { id: string; name: string }>({
  group,
  open,
  toggle,
  depth,
  ...props
}: GroupBodyProps<T>) {
  const expanded = props.defaultOpen === true || open.has(group.path);
  return (
    <div className="flex flex-col">
      <div className="group/token-group flex h-7 items-center gap-1 rounded-md pr-1 hover:bg-muted">
        <button
          type="button"
          onClick={() => toggle(group.path)}
          aria-expanded={expanded}
          className="flex h-full min-w-0 flex-1 items-center gap-1 text-left text-xs font-medium"
          style={{ paddingLeft: depth * 12 }}
        >
          <ChevronRight
            className={cn("size-3.5 shrink-0 text-muted-foreground transition-transform", {
              "rotate-90": expanded,
            })}
          />
          <span className="truncate">{group.name}</span>
          <span className="text-subtle-foreground">{countVariables(group)}</span>
        </button>
        {props.renderGroupActions?.(group)}
      </div>
      {expanded && (
        <div style={{ paddingLeft: (depth + 1) * 12 }}>
          <GroupBody {...props} group={group} open={open} toggle={toggle} depth={0} />
        </div>
      )}
    </div>
  );
}

function countVariables<T extends { name: string }>(group: TokenGroupNode<T>): number {
  return group.variables.length + group.groups.reduce((n, g) => n + countVariables(g), 0);
}
