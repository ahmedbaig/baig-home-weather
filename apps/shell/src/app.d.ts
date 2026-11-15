declare global {
  interface ImportMetaEnv {
    readonly PUBLIC_API_BASE?: string;
    readonly PUBLIC_MANIFEST_URL?: string;
  }

  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
}

export {};
