// The original reference directive `/// <reference types="vite/client" />` was causing a "Cannot find type definition file" error.
// This file now manually defines the necessary types that 'vite/client' would provide,
// resolving errors related to `import.meta.env` and static asset imports.

// 1. Define types for Vite's environment variables (import.meta.env)
interface ImportMetaEnv {
  readonly VITE_CRM_API_URL: string;
  // Add other Vite environment variables here
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// 2. Define types for static asset imports (e.g., import logo from './logo.svg')
declare module "*.svg" {
  const src: string;
  export default src;
}

declare module "*.png" {
  const src: string;
  export default src;
}

declare module "*.jpeg" {
  const src: string;
  export default src;
}

declare module "*.jpg" {
  const src: string;
  export default src;
}

declare module "*.mp4" {
  const src: string;
  export default src;
}
