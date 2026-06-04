import { defineConfig } from 'tsdown/config'

export default defineConfig({
  entry: 'src/extension.ts',
  external: ['vscode'],
  noExternal: ['@toon-format/toon', 'jsonc-parser'],
  dts: false,
  clean: true,
})
