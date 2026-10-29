import { CodeEditor } from "@shared/ui/components/code-editor";
import type { CodePreviewProps } from "./code-preview.types";

const NO_LANGUAGE: never[] = [];
const ignore = () => {};

/** A generated file's code, read-only. */
export function CodePreview({ file }: CodePreviewProps) {
  return (
    <CodeEditor
      key={file.path}
      value={file.content}
      onChange={ignore}
      language={NO_LANGUAGE}
      label={file.path}
      readOnly
      className="min-h-0 flex-1"
    />
  );
}
