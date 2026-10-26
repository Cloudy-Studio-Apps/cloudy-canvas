import {
  codeTokens,
  fromDtcg,
  fromTokensStudio,
  isTokensStudio,
  toCss,
  toDtcg,
  toKotlin,
  toScss,
  toSwift,
  toTailwind,
  type CodeTokens,
  type TokenStore,
} from "@canvas";

import { designCodeStyles } from "./code-styles";
import { DESIGN_STYLE_CODECS } from "./style-codecs";
import type { TokenFormat } from "./token-format.types";

const styles = { styles: DESIGN_STYLE_CODECS };
const code =
  (writer: (tokens: CodeTokens) => string) =>
  (store: TokenStore, title: string): string =>
    writer(codeTokens(store, title, designCodeStyles));

/** The formats the variables module brings: DTCG both ways, Tokens Studio in, code out. */
export const BUILT_IN_TOKEN_FORMATS: TokenFormat[] = [
  {
    id: "tokens-studio",
    label: "Tokens Studio (JSON)",
    extension: "json",
    fileLabel: "Tokens Studio tokens",
    read: (text) => fromTokensStudio(JSON.parse(text), styles),
    detect: isTokensStudio,
  },
  {
    id: "dtcg",
    label: "W3C Design Tokens (JSON)",
    extension: "tokens.json",
    fileLabel: "Design tokens",
    write: (store) => `${JSON.stringify(toDtcg(store, styles), null, 2)}\n`,
    read: (text) => fromDtcg(JSON.parse(text), styles),
    detect: (json) => typeof json === "object" && json !== null && !Array.isArray(json),
  },
  { id: "css", label: "CSS variables", extension: "css", fileLabel: "CSS", write: code(toCss) },
  {
    id: "tailwind",
    label: "Tailwind CSS v4",
    extension: "css",
    fileLabel: "Tailwind CSS",
    write: code(toTailwind),
  },
  { id: "scss", label: "SCSS", extension: "scss", fileLabel: "SCSS", write: code(toScss) },
  {
    id: "swift",
    label: "Swift (SwiftUI)",
    extension: "swift",
    fileLabel: "Swift",
    write: code(toSwift),
  },
  {
    id: "kotlin",
    label: "Kotlin (Compose)",
    extension: "kt",
    fileLabel: "Kotlin",
    write: code(toKotlin),
  },
];
