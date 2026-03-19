import { createLibConfig } from '@enterprise/vite-config';
import { defineConfig } from 'vite';

export default defineConfig(
  createLibConfig({
    root: __dirname,
    entry: 'src/index.ts',
    name: 'EnterpriseUtils',
  }),
);
