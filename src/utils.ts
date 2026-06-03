import * as vscode from 'vscode'
import type { JsonToToonOptions, ToonToJsonOptions } from './converter'

export function getEncodeOptions(): JsonToToonOptions {
  const config = vscode.workspace.getConfiguration('toon')
  return {
    indent: config.get<number>('encode.indent', 2),
    delimiter: config.get<',' | '|' | '\t'>('encode.delimiter', ','),
    keyFolding: config.get<'off' | 'safe'>('encode.keyFolding', 'off'),
  }
}

export function getDecodeOptions(): ToonToJsonOptions {
  const config = vscode.workspace.getConfiguration('toon')
  return {
    indent: config.get<number>('json.indent', 2),
    strict: config.get<boolean>('decode.strict', true),
    expandPaths: config.get<'off' | 'safe'>('decode.expandPaths', 'off'),
  }
}

export function getFullDocumentRange(document: vscode.TextDocument): vscode.Range {
  return new vscode.Range(
    document.positionAt(0),
    document.positionAt(document.getText().length),
  )
}
