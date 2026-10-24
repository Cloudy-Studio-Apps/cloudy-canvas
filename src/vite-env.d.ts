/// <reference types="vite/client" />

/** `version` from package.json, set by `define` in vite.config.ts. */
declare const __APP_VERSION__: string;

interface ImportMetaEnv {
  readonly VITE_MOCK_RECENTS?: string;
  /** The relay live sessions use by default (`BUILT_IN_RELAY`), and its access token. */
  readonly VITE_CLOUDY_RELAY_URL?: string;
  readonly VITE_CLOUDY_RELAY_TOKEN?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
