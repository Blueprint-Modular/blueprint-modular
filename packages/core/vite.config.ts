import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import dts from 'vite-plugin-dts'
import { resolve } from 'path'

// Alias @ vers racine du repo pour que les composants bpm qui importent @/lib, @/hooks, etc. résolvent au build.
const repoRoot = resolve(__dirname, '../..')

export default defineConfig({
  resolve: {
    alias: { '@': repoRoot },
  },
  plugins: [
    react(),
    dts({ insertTypesEntry: true }),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'BlueprintModular',
      formats: ['es', 'cjs'],
      fileName: (format) => format === 'es' ? 'index.mjs' : 'index.js',
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'react-plotly.js', 'plotly.js'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
        },
        assetFileNames: (assetInfo) => {
          const name = assetInfo.name || '';
          if (name.endsWith('.css')) return 'style.css';
          return '[name].[ext]';
        },
      },
    },
  },
})
