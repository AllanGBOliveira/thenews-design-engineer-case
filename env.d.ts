/// <reference types="vite/client" />

interface ImportMetaEnv {
  // Adicione aqui variáveis VITE_ expostas ao cliente
  // readonly VITE_API_URL: string
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
