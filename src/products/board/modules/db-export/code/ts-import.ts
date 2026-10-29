/** Prettier's line width, which TypeScript projects usually keep. */
const WIDTH = 100;

/** `import { a, b } from 'x';`, one name per line when it's longer than a line. */
export function tsImport(names: readonly string[], from: string): string[] {
  const line = `import { ${names.join(", ")} } from '${from}';`;
  if (line.length <= WIDTH) return [line];
  return ["import {", ...names.map((name) => `  ${name},`), `} from '${from}';`];
}
