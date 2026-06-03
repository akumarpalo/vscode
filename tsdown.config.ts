import { defineConfig } from 'tsdown/config'

export default defineConfig({
  entry: 'src/extension.ts',
  external: ['vscode'],
  dts: false,
  clean: true,
})
