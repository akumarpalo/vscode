import * as vscode from 'vscode'
import { jsonToToon } from '../converter'
import { getEncodeOptions, getFullDocumentRange } from '../utils'

export async function jsonToToonCommand(): Promise<void> {
  const editor = vscode.window.activeTextEditor
  if (!editor)
    return

  const document = editor.document
  const languageId = document.languageId
  const selection = editor.selection
  const hasSelection = !selection.isEmpty

  if (!hasSelection) {
    if (languageId === 'toon') {
      vscode.window.showInformationMessage('This file is already TOON.')
      return
    }
    if (languageId !== 'json' && languageId !== 'jsonc') {
      vscode.window.showInformationMessage('Select JSON text to convert, or open a .json file.')
      return
    }
  }

  const range = hasSelection
    ? new vscode.Range(selection.start, selection.end)
    : getFullDocumentRange(document)

  const text = document.getText(range)

  if (!text.trim()) {
    vscode.window.showInformationMessage('Nothing to convert — selection is empty.')
    return
  }

  const parseLanguageId = (languageId === 'json' || languageId === 'jsonc') ? languageId : 'json'
  const options = getEncodeOptions()
  const result = jsonToToon(text, parseLanguageId, options)

  if (!result.success) {
    vscode.window.showErrorMessage(`Conversion failed: ${result.error}`)
    if (result.line !== undefined) {
      const pos = new vscode.Position(range.start.line + result.line - 1, 0)
      editor.selection = new vscode.Selection(pos, pos)
      editor.revealRange(new vscode.Range(pos, pos))
    }
    return
  }

  const applied = await editor.edit(editBuilder => {
    editBuilder.replace(range, result.output)
  })

  if (!applied) {
    vscode.window.showErrorMessage('Failed to apply edit — the document may have changed.')
    return
  }

  if (!hasSelection) {
    await vscode.languages.setTextDocumentLanguage(document, 'toon')
  }

  vscode.window.setStatusBarMessage('$(check) Converted to TOON', 3000)
}
