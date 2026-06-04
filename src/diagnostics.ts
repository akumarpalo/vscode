import { decode } from '@toon-format/toon'
import * as vscode from 'vscode'

let diagnosticCollection: vscode.DiagnosticCollection
const debounceTimers = new Map<string, ReturnType<typeof setTimeout>>()

export function setupDiagnostics(context: vscode.ExtensionContext): void {
  diagnosticCollection = vscode.languages.createDiagnosticCollection('toon')
  context.subscriptions.push(diagnosticCollection)

  context.subscriptions.push(
    vscode.workspace.onDidOpenTextDocument(validateToonDocument),
    vscode.workspace.onDidChangeTextDocument((e) => {
      validateDebounced(e.document)
    }),
    vscode.workspace.onDidCloseTextDocument((document) => {
      const key = document.uri.toString()
      const timer = debounceTimers.get(key)
      if (timer) {
        clearTimeout(timer)
        debounceTimers.delete(key)
      }
      diagnosticCollection.delete(document.uri)
    }),
  )

  vscode.workspace.textDocuments.forEach(validateToonDocument)
}

function validateDebounced(document: vscode.TextDocument): void {
  const key = document.uri.toString()
  const existing = debounceTimers.get(key)
  if (existing)
    clearTimeout(existing)

  debounceTimers.set(
    key,
    setTimeout(() => {
      debounceTimers.delete(key)
      validateToonDocument(document)
    }, 300),
  )
}

function validateToonDocument(document: vscode.TextDocument): void {
  if (document.languageId !== 'toon')
    return

  const config = vscode.workspace.getConfiguration('toon')
  if (!config.get<boolean>('validation.enable', true)) {
    diagnosticCollection.set(document.uri, [])
    return
  }

  const text = document.getText()
  if (!text.trim()) {
    diagnosticCollection.set(document.uri, [])
    return
  }

  try {
    decode(text, { strict: true })
    diagnosticCollection.set(document.uri, [])
  }
  catch (e) {
    const err = e as Error & { line?: number }
    const lineNum = (err.line ?? 1) - 1
    const lineText = document.lineAt(Math.min(lineNum, document.lineCount - 1))
    const range = new vscode.Range(lineText.range.start, lineText.range.end)

    const diagnostic = new vscode.Diagnostic(
      range,
      err.message,
      vscode.DiagnosticSeverity.Error,
    )
    diagnostic.source = 'TOON'

    diagnosticCollection.set(document.uri, [diagnostic])
  }
}
