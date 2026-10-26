import { Upload } from "lucide-react";
import { useRef } from "react";

import { notifyError, toast } from "@shared/stores/toast-store";
import { Button, Swatch, Textarea } from "@shared/ui/kit";
import { parsePalette } from "../..";
import { MAX_COLORS, takePalette, useColorWizardStore } from "../store";
import { SectionLabel } from "./section-label";

const EXAMPLES = {
  "Coolors link": "https://coolors.co/264653-2a9d8f-e9c46a-f4a261-e76f51",
  "CSS variables":
    ":root {\n  --brand-primary: #6D28D9;\n  --brand-accent: hsl(330 80% 60%);\n  --neutral: rgb(100, 116, 139);\n}",
  "JSON tokens":
    '{\n  "color": {\n    "primary": { "$type": "color", "$value": "#0E7490" },\n    "secondary": { "$type": "color", "$value": "#F59E0B" },\n    "neutral": { "$type": "color", "$value": "#57534E" }\n  }\n}',
} as const;

/** A palette pasted (a Coolors link, CSS, JSON tokens, any text with colors) or read from a file. */
export function ImportSource() {
  const text = useColorWizardStore((s) => s.importText);
  const imported = useColorWizardStore((s) => s.imported);
  const set = useColorWizardStore((s) => s.set);
  const file = useRef<HTMLInputElement>(null);
  const read = (value: string) => {
    const found = parsePalette(value);
    set({ importText: value, imported: found });
    if (!found.length)
      toast({ title: "No colors found", description: "Paste hex codes, CSS or tokens." });
  };
  return (
    <div className="flex flex-col gap-3 p-4">
      <SectionLabel>Paste a palette</SectionLabel>
      <p className="text-xs text-muted-foreground">
        A Coolors link, CSS variables, JSON tokens, or any text with hex, rgb(), hsl() or oklch()
        colors. Named colors keep their names as roles.
      </p>
      <Textarea
        value={text}
        spellCheck={false}
        placeholder="https://coolors.co/264653-2a9d8f-e9c46a…"
        className="h-36 font-mono text-xs"
        onChange={(event) => set({ importText: event.target.value })}
      />
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-muted-foreground">Try:</span>
        {Object.entries(EXAMPLES).map(([label, example]) => (
          <Button key={label} variant="outline" size="sm" onClick={() => read(example)}>
            {label}
          </Button>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={() => file.current?.click()}>
          <Upload />
          Choose a file…
        </Button>
        <Button size="sm" className="ml-auto" onClick={() => read(text)}>
          Read colors
        </Button>
      </div>
      {/* eslint-disable-next-line no-restricted-syntax -- bespoke: the hidden file input behind "Choose a file…" */}
      <input
        ref={file}
        type="file"
        accept=".css,.scss,.json,.txt,.md"
        hidden
        onChange={(event) => {
          const picked = event.target.files?.[0];
          event.target.value = "";
          picked
            ?.text()
            .then(read, (error: unknown) => notifyError("Couldn't read the file", error));
        }}
      />
      {imported.length > 0 && (
        <>
          <SectionLabel aside={`${imported.length} found`}>Colors</SectionLabel>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(110px,1fr))] gap-1.5">
            {imported.map((c) => (
              <span key={c.hex} className="flex min-w-0 items-center gap-1.5 text-xs">
                <Swatch color={c.hex} size="xs" />
                <span className="truncate">
                  {c.name && <b>{c.name} </b>}
                  {c.hex}
                </span>
              </span>
            ))}
          </div>
          <Button onClick={() => takePalette(imported)}>
            Use {Math.min(imported.length, MAX_COLORS)} colors
          </Button>
        </>
      )}
      <p className="rounded-lg border border-border bg-surface-sunken p-2.5 text-xs text-muted-foreground">
        Adobe Color links don't carry the colors: export the theme as CSS from Adobe and paste that.
      </p>
    </div>
  );
}
