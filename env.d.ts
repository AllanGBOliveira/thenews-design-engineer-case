/// <reference types="vite/client" />

interface ImportMetaEnv {
    // Add VITE_ client-side variables here
  // readonly VITE_API_URL: string
  readonly [key: string]: string | undefined
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV?: "development" | "production" | "test"
    PORT?: string
  }
}
