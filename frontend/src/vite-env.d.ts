/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Base address of the backend API. Unused while the frontend runs on sample data. */
  readonly VITE_API_BASE_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
