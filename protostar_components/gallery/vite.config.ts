import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';
import { readSourceInfo } from './scripts/source-info.mjs';

export default defineConfig({
  plugins: [react()],
  define: {
    __COMPONENT_SOURCE__: JSON.stringify(readSourceInfo(fileURLToPath(new URL('../../', import.meta.url)))),
  },
  server: { host: '127.0.0.1' },
});
