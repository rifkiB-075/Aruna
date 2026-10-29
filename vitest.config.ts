import { defineConfig } from 'vitest/config';
import path from 'node:path';
import { loadEnv } from 'vite';

export default defineConfig(({ mode }) => ({
  test: { 
    include: ['src/**/*.test.ts', 'tests/unit/**/*.test.ts', 'tests/integration/**/*.test.ts'], 
    environment: 'node',
    env: loadEnv(mode, process.cwd(), ''),
  },
  resolve: { alias: { '@': path.resolve(__dirname, 'src') } },
}));
