import * as vscode from 'vscode'
import { decode } from '@toon-format/toon'

let diagnosticCollection: vscode.DiagnosticCollection
let debounceTimer: ReturnType<typeof setTimeout> | undefined

export function setupDiagnostics(context: vscode.ExtensionContext): void {
  diagnosticCollection = vscode.languages.createDiagnosticCollection('toon')
  context.subscriptions.push(diagnosticCollection)

  context.subscriptions.push(
    vscode.workspace.onDidOpenTextDocument(onDocumentEvent),
    vscode.workspace.onDidChangeTextDocument((e) => {
      onDocumentEventDebounced(e.document)
    }),
    vscode.workspace.onDidCloseTextDocument((document) => {
      diagnosticCollection.delete(document.uri)
    }),
  )

  vscode.workspace.textDocuments.forEach(onDocumentEvent)
}

function onDocumentEvent(document: vscode.TextDocument): void {
  validateToonDocument(document)
}

function onDocumentEventDebounced(document: vscode.TextDocument): void {
  if (debounceTimer)
    clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => validateToonDocument(document), 300)
}

function validateToonDocument(document: vscode.TextDocument): void {
  if (document.languageId !== 'toon') {
    return
  }

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
