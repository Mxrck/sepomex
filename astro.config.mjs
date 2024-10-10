// @ts-check
import { defineConfig, envField } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';
import preloaderMongo from './src/integrations/preloader-mongo';
import preloaderRedis from './src/integrations/preloader-redis';
import dotenv from 'dotenv';

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
  integrations: [
    tailwind({
      applyBaseStyles: false,
    }), 
    react(), 
    preloaderMongo(),
    preloaderRedis(),
  ],
  env: {
    schema: {
      REDIS_HOST: envField.string({ context: "server", access: "secret", optional: false }),
    }
  },
});