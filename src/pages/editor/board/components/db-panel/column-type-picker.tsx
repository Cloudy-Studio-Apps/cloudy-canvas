import { useState } from "react";
import { ChevronDown } from "lucide-react";

import { COLUMN_TYPES } from "@engine";
import { Button } from "@ui/components/ui/button";
import { Input } from "@ui/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@ui/components/ui/popover";
import { Tabs, TabsList, TabsTrigger } from "@ui/components/ui/tabs";
import { useEngine } from "../../engine/engine-context";
import { useDbQuery } from "../../engine/use-db-table";
import { CommitInput } from "./commit-input";
import { TypeOptionList } from "./type-option-list";
import type { ColumnTypePickerProps, TypeTab } from "./column-type-picker.types";
import type { TypeOption } from "./type-option-list.types";

const BUILT_IN: TypeOption[] = COLUMN_TYPES.map((name) => ({ name, kind: "type" }));

/**
 * A column's type: type anything (custom types are fine), or pick from the board's enums and the
 * built-in types, split into tabs.
 */
export function ColumnTypePicker({ table, column }: ColumnTypePickerProps) {
  const engine = useEngine();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<TypeTab>("all");
  const enums = useDbQuery((db) =>
    db.enums().map((e): TypeOption => ({
      name: e.name,
      kind: "enum",
      detail: `${e.values.length} values`,
    })),
  );

  const pool = tab === "enums" ? enums : tab === "types" ? BUILT_IN : [...enums, ...BUILT_IN];
  const needle = query.trim().toLowerCase();
  const options = needle ? pool.filter((o) => o.name.toLowerCase().includes(needle)) : pool;
  const custom = query.trim();
  const isKnown = [...enums, ...BUILT_IN].some((o) => o.name === custom);

  const pick = (type: string) => {
    engine.db.updateColumn(table.id, column.id, { type });
    setOpen(false);
  };

  return (
    <div className="flex w-32 shrink-0">
      <CommitInput
        value={column.type}
        aria-label="Column type"
        className="h-7 min-w-0 rounded-r-none font-mono text-xs"
        onCommit={(type) => engine.db.updateColumn(table.id, column.id, { type: type.trim() })}
      />
      <Popover
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) setQuery("");
        }}
      >
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="size-7 rounded-l-none border-l-0"
            aria-label="Choose a type"
          >
            <ChevronDown />
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-64 space-y-2 p-2">
          <Input
            autoFocus
            placeholder="Search, or type a custom type…"
            value={query}
            className="h-7 text-sm"
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key !== "Enter" || !custom) return;
              pick(options.find((o) => o.name.toLowerCase() === needle)?.name ?? custom);
            }}
          />
          <Tabs value={tab} onValueChange={(value) => setTab(value as TypeTab)}>
            <TabsList className="w-full">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="enums">Enums ({enums.length})</TabsTrigger>
              <TabsTrigger value="types">Types</TabsTrigger>
            </TabsList>
          </Tabs>
          {tab === "enums" && enums.length === 0 && !needle ? (
            <p className="px-2 py-1.5 text-sm text-muted-foreground">
              No enums yet. Add one with the Database tool (Enum) or in the Schema view.
            </p>
          ) : (
            <TypeOptionList options={options} current={column.type} onPick={pick} />
          )}
          {custom && !isKnown && (
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start font-normal"
              onClick={() => pick(custom)}
            >
              Use custom type <span className="font-mono text-xs">{custom}</span>
            </Button>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
}
