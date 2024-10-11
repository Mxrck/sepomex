declare module 'astro:env/server' {
  export const REDIS_HOST: string;
  export const REDIS_PORT: string;
  export const DEBUG_DATA: boolean;
  export const MONGODB_HOST: string;
  export const MONGODB_PORT: number;
  export const MONGODB_DATABASE: string;
  export const BATCH_MODE: boolean;
  export const EXCLUDE_LATEST_VERSION: boolean;
}