import * as vscode from 'vscode'
import { toonToJson } from '../converter'
import { getDecodeOptions, getFullDocumentRange } from '../utils'

export async function toonToJsonCommand(): Promise<void> {
  const editor = vscode.window.activeTextEditor
  if (!editor)
    return

  const document = editor.document
  const languageId = document.languageId

  if (languageId === 'json' || languageId === 'jsonc') {
    vscode.window.showInformationMessage('This file is already JSON.')
    return
  }

  if (languageId !== 'toon') {
    vscode.window.showInformationMessage('This command works on TOON files.')
    return
  }

  const selection = editor.selection
  const range = selection.isEmpty
    ? getFullDocumentRange(document)
    : new vscode.Range(selection.start, selection.end)

  const text = document.getText(range)

  if (!text.trim()) {
    vscode.window.showInformationMessage('Nothing to convert — selection is empty.')
    return
  }

  const options = getDecodeOptions()
  const result = toonToJson(text, options)

  if (!result.success) {
    vscode.window.showErrorMessage(`Conversion failed: ${result.error}`)
    if (result.line !== undefined) {
      const pos = new vscode.Position(range.start.line + result.line - 1, 0)
      editor.selection = new vscode.Selection(pos, pos)
      editor.revealRange(new vscode.Range(pos, pos))
    }
    return
  }

  await editor.edit(editBuilder => {
    editBuilder.replace(range, result.output)
  })

  if (selection.isEmpty) {
    await vscode.languages.setTextDocumentLanguage(document, 'json')
  }

  vscode.window.setStatusBarMessage('$(check) Converted to JSON', 3000)
}
