import * as vscode from 'vscode'
import { jsonToToon } from '../converter'
import { getEncodeOptions } from '../utils'

export async function convertToToonFileCommand(uri?: vscode.Uri): Promise<void> {
  const sourceUri = uri ?? vscode.window.activeTextEditor?.document.uri
  if (!sourceUri)
    return

  let text: string
  try {
    const fileContent = await vscode.workspace.fs.readFile(sourceUri)
    text = new TextDecoder('utf-8').decode(fileContent)
  }
  catch (e) {
    vscode.window.showErrorMessage(`Failed to read file: ${(e as Error).message}`)
    return
  }

  if (!text.trim()) {
    vscode.window.showInformationMessage('Nothing to convert — file is empty.')
    return
  }

  const languageId = sourceUri.fsPath.endsWith('.jsonc') ? 'jsonc' : 'json'
  const options = getEncodeOptions()
  const result = jsonToToon(text, languageId, options)

  if (!result.success) {
    vscode.window.showErrorMessage(`Conversion failed: ${result.error}`)
    return
  }

  const defaultPath = sourceUri.fsPath.replace(/\.jsonc?$/, '.toon')
  const defaultUri = vscode.Uri.file(defaultPath)

  const targetUri = await vscode.window.showSaveDialog({
    defaultUri,
    filters: { 'TOON files': ['toon'] },
    title: 'Save TOON file as…',
  })

  if (!targetUri)
    return

  await vscode.workspace.fs.writeFile(targetUri, new TextEncoder().encode(result.output))

  const config = vscode.workspace.getConfiguration('toon')
  if (config.get<boolean>('openAfterConvert', true)) {
    const doc = await vscode.workspace.openTextDocument(targetUri)
    await vscode.window.showTextDocument(doc)
  }

  vscode.window.setStatusBarMessage('$(check) Saved TOON file', 3000)
}
