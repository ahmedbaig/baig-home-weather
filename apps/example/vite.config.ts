import { fileURLToPath } from 'node:url';
import { mockApi, serveModule } from '@dashboard/mock';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [
    mockApi(),
    serveModule({ dir: fileURLToPath(new URL('./dist/module', import.meta.url)) }),
    sveltekit()
  ],
  envPrefix: ['VITE_', 'PUBLIC_'],
  server: { port: 5174, strictPort: true },
  preview: { port: 4174, strictPort: true }
});
