/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_MOCK_RECENTS?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
