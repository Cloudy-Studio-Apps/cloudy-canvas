/// <reference types="vite/client" />

/** `version` from package.json, set by `define` in vite.config.ts. */
declare const __APP_VERSION__: string;

interface ImportMetaEnv {
  readonly VITE_MOCK_RECENTS?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
