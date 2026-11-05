/**
 * Names for `width` columns, trimmed: empty ones `column_N`, repeated ones `name_2`, `name_3`, all
 * unique.
 */
export function columnNames(header: string[], width: number): string[] {
  const used = new Set<string>();
  return Array.from({ length: width }, (_, i) => {
    const raw = (header[i] ?? "").trim();
    const base = raw === "" ? `column_${i + 1}` : raw;
    let name = base;
    for (let n = 2; used.has(name); n++) name = `${base}_${n}`;
    used.add(name);
    return name;
  });
}
