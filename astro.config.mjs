// @ts-check
import { defineConfig, envField } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';
import preloaderMongo from './src/integrations/preloader-mongo';
import preloaderRedis from './src/integrations/preloader-redis';
import dotenv from 'dotenv';

import icon from "astro-icon";

const isProduction = import.meta.env.PROD;
dotenv.config({ path: '.env' });
dotenv.config({ path: '.env.local', override: true });
if (isProduction) {
  dotenv.config({ path: '.env.production', override: true });
  dotenv.config({ path: '.env.production.local', override: true });
}
else {
  dotenv.config({ path: '.env.development', override: true });
  dotenv.config({ path: '.env.development.local', override: true });
}

// https://astro.build/config
export default defineConfig({
  integrations: [tailwind({
    applyBaseStyles: false,
  }), react(), preloaderMongo(), preloaderRedis(), icon()],
  env: {
    schema: {
      REDIS_HOST: envField.string({ context: "server", access: "secret", optional: false }),
      REDIS_PORT: envField.string({ context: "server", access: "secret", optional: false }),
      DEBUG_DATA: envField.boolean({ context: "server", access: "secret", optional: true, default: true }),
      MONGODB_HOST: envField.string({ context: "server", access: "secret", optional: false }),
      MONGODB_PORT: envField.number({ context: "server", access: "secret", optional: false }),
      MONGODB_DATABASE: envField.string({ context: "server", access: "secret", optional: false }),
      BATCH_MODE: envField.boolean({ context: "server", access: "secret", optional: true, default: true }),
      EXCLUDE_LATEST_VERSION: envField.boolean({ context: "server", access: "secret", optional: true, default: false }),
      APP_URL: envField.string({ context: "server", access: "public", optional: true, default: "" }),
      REPOSITORY_URL: envField.string({ context: "server", access: "public", optional: true, default: undefined }),
      LAST_UPDATED_AT: envField.string({ context: "server", access: "public", optional: true, default: undefined }),
    }
  },
});