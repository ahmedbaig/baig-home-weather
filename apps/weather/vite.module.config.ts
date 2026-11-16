import { svelte } from '@sveltejs/vite-plugin-svelte';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [svelte({ emitCss: false, compilerOptions: { css: 'injected' } })],
  envPrefix: ['VITE_', 'PUBLIC_'],
  define: { 'process.env.NODE_ENV': JSON.stringify('production') },
  build: {
    outDir: 'dist/module',
    emptyOutDir: true,
    sourcemap: true,
    lib: {
      entry: 'src/module.ts',
      formats: ['es'],
      fileName: () => 'module.js'
    }
  }
});
