import { defineConfig } from 'tsdown/config'
import { resolve } from 'node:path'

export default defineConfig({
  entry: 'src/extension.ts',
  format: 'cjs',
  outDir: 'dist',
  external: ['vscode'],
  noExternal: ['@toon-format/toon', 'jsonc-parser'],
  dts: false,
  clean: true,
  alias: {
    'jsonc-parser': resolve('node_modules/jsonc-parser/lib/esm/main.js'),
  },
})
