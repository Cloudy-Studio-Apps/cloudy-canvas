import { Fragment } from "react";
import { useNavigate } from "react-router";

import { BASE_COMMAND_LABELS } from "@canvas";
import { ExtensionIconView, useEditorModules } from "@canvas-ui";
import { SealLogo } from "@shared/ui/brand/seal-logo";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@shared/ui/components/ui/dropdown-menu";
import { useDesignEngine } from "../../design-engine-context";
import { designEditor, type MainMenuItem } from "../../modules";

const COMMAND_LABELS: Readonly<Record<string, string | undefined>> = BASE_COMMAND_LABELS;

/** The logo at the top of the rail: opens the main menu the modules fill (`mainMenu`). */
export function DesignMainMenu() {
  const engine = useDesignEngine();
  const navigate = useNavigate();
  const { host } = useEditorModules();
  const groups = [...host.get(designEditor.mainMenu)].sort((a, b) => a.order - b.order);

  const labelOf = (item: MainMenuItem) =>
    "command" in item ? (item.label ?? COMMAND_LABELS[item.command] ?? item.command) : item.label;

  const pick = (item: MainMenuItem) => {
    if ("command" in item) engine.commands[item.command]?.();
    else item.run({ engine, navigate: (to) => void navigate(to) });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="Main menu"
          className="mb-2 flex size-9 cursor-pointer items-center justify-center rounded-md hover:bg-hover data-[state=open]:bg-hover"
        >
          <SealLogo size={22} variant="mark" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="right" align="start" className="w-56">
        {groups.map((group, i) => (
          <Fragment key={group.id}>
            {i > 0 && <DropdownMenuSeparator />}
            {group.label && <DropdownMenuLabel>{group.label}</DropdownMenuLabel>}
            {group.items.map((item) => {
              const shortcut = "command" in item && (
                <DropdownMenuShortcut>{engine.keymap.label(item.command)}</DropdownMenuShortcut>
              );
              return item.checked ? (
                <DropdownMenuCheckboxItem
                  key={labelOf(item)}
                  checked={item.checked(engine)}
                  onSelect={() => pick(item)}
                >
                  {labelOf(item)}
                  {shortcut}
                </DropdownMenuCheckboxItem>
              ) : (
                <DropdownMenuItem key={labelOf(item)} onSelect={() => pick(item)}>
                  {item.icon ? <ExtensionIconView icon={item.icon} /> : <span className="size-4" />}
                  {labelOf(item)}
                  {shortcut}
                </DropdownMenuItem>
              );
            })}
          </Fragment>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
