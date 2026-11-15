import { mockApi } from '@dashboard/mock';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [mockApi(), sveltekit()],
  envPrefix: ['VITE_', 'PUBLIC_'],
  server: { port: 5173, strictPort: true },
  preview: { port: 4173, strictPort: true }
});
