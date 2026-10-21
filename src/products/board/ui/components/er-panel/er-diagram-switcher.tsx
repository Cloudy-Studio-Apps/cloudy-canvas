import { Check, ChevronDown, Plus } from "lucide-react";

import { Button } from "@shared/ui/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@shared/ui/components/ui/dropdown-menu";
import { useEngine } from "@canvas-ui";
import { useBoardPanelStore } from "../../stores/board-panel-store";
import { useErModel, useErDiagram, useErQuery } from "../../er";
import { ErDiagramName } from "./er-diagram-name";

/**
 * The shown diagram's name (editable) and a menu of the board's diagrams: picking one takes the
 * view to it and selects its first entity; "New diagram" starts one beside the board's content.
 */
export function ErDiagramSwitcher() {
  const engine = useEngine();
  const er = useErModel();
  const diagram = useErDiagram();
  const setErDiagram = useBoardPanelStore((state) => state.setErDiagram);
  const diagrams = useErQuery((_, er) => er.diagrams());
  const name = diagrams.find((d) => d.id === diagram.id)?.name ?? "";

  const show = (id: string) => {
    const first = er.diagram(id).shapes().entities[0];
    if (first) engine.focusElement(first.id);
    else setErDiagram(id);
  };

  return (
    <div className="flex min-w-0 flex-1 items-center">
      <ErDiagramName key={`${diagram.id}:${name}`} name={name} onRename={diagram.rename} />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="size-7" aria-label="Diagrams on the board">
            <ChevronDown />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="max-w-64 min-w-52">
          <DropdownMenuLabel>Diagrams on this board</DropdownMenuLabel>
          {diagrams.map((item) => (
            <DropdownMenuItem key={item.id} onSelect={() => show(item.id)}>
              <Check className={item.id === diagram.id ? "" : "invisible"} />
              <span className="truncate">{item.label}</span>
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={() => engine.focusElement(er.newDiagram())}>
            <Plus />
            New diagram
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
