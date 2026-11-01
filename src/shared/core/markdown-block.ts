/** Code as a fenced Markdown block, ready to paste into a `.md` file. */
export function markdownCodeBlock(language: string, code: string): string {
  return `\`\`\`${language}\n${code.trimEnd()}\n\`\`\`\n`;
}
