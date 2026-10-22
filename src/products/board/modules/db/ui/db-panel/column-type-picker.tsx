import { useState } from "react";
import { ChevronDown } from "lucide-react";

import { COLUMN_TYPES, formatColumnType, splitColumnType, TYPE_ARGS } from "@board";
import { Button } from "@shared/ui/components/ui/button";
import { Input } from "@shared/ui/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@shared/ui/components/ui/popover";
import { Tabs, TabsList, TabsTrigger } from "@shared/ui/components/ui/tabs";
import { useBoardSchema, useDbQuery } from "../schema";
import { CommitInput } from "./commit-input";
import { TypeOptionList } from "./type-option-list";
import type { ColumnTypePickerProps, TypeTab } from "./column-type-picker.types";
import type { TypeOption } from "./type-option-list.types";

const BUILT_IN: TypeOption[] = COLUMN_TYPES.map((name) => ({ name, kind: "type" }));
const BUILT_IN_NAMES = new Set<string>(COLUMN_TYPES);

/**
 * A column's type: type anything (custom types are fine), or pick from the board's enums and the
 * built-in types, split into tabs. Arguments (`255` in `varchar(255)`) get their own box, shown for
 * types that take them; typing `varchar(255)` as the type fills it too.
 */
export function ColumnTypePicker({ table, column }: ColumnTypePickerProps) {
  const schema = useBoardSchema();
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
  // What a typed custom type becomes: `int` → `integer`, `varchar(80)` stays as written.
  const resolved = formatColumnType(splitColumnType(custom));

  const spec = TYPE_ARGS[column.type];
  const isEnum = enums.some((e) => e.name === column.type);
  // Built-in types without arguments and enums hide the box; custom types may take arguments.
  const showArgs =
    !!spec || column.typeArgs !== "" || (!BUILT_IN_NAMES.has(column.type) && !isEnum);

  /** Switches the type; the arguments stay when they mean the same thing, else take the new default. */
  const setType = (text: string) => {
    const { type, typeArgs: typed } = splitColumnType(text);
    const next = TYPE_ARGS[type];
    const keep = next && spec?.label === next.label && column.typeArgs !== "";
    const typeArgs = typed || (keep ? column.typeArgs : (next?.initial ?? ""));
    return schema.updateColumn(table.id, column.id, { type, typeArgs });
  };

  const pick = (type: string) => {
    setType(type);
    setOpen(false);
  };

  return (
    <div className="flex w-40 shrink-0">
      <CommitInput
        value={column.type}
        aria-label="Column type"
        className="h-7 min-w-0 flex-1 rounded-r-none font-mono text-xs"
        onCommit={setType}
      />
      {showArgs && (
        <CommitInput
          value={column.typeArgs}
          aria-label="Type arguments"
          placeholder={spec?.label ?? "args"}
          title={spec ? `${column.type} ${spec.label}` : "Type arguments"}
          className="h-7 w-14 shrink-0 rounded-none border-l-0 px-1.5 font-mono text-xs"
          onCommit={(typeArgs) => schema.updateColumn(table.id, column.id, { typeArgs })}
        />
      )}
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
              {resolved === custom ? "Use custom type" : "Use"}{" "}
              <span className="font-mono text-xs">{resolved}</span>
            </Button>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
}
