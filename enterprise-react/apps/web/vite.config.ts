import { createAppConfig } from '@enterprise/vite-config';
import { defineConfig } from 'vite';

export default defineConfig(
  createAppConfig({
    root: __dirname,
    port: 3000,
  }),
);
