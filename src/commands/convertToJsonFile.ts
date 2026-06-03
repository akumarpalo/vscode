import * as vscode from 'vscode'
import { toonToJson } from '../converter'
import { getDecodeOptions } from '../utils'

export async function convertToJsonFileCommand(uri?: vscode.Uri): Promise<void> {
  const sourceUri = uri ?? vscode.window.activeTextEditor?.document.uri
  if (!sourceUri)
    return

  const fileContent = await vscode.workspace.fs.readFile(sourceUri)
  const text = new TextDecoder('utf-8').decode(fileContent)

  if (!text.trim()) {
    vscode.window.showInformationMessage('Nothing to convert — file is empty.')
    return
  }

  const options = getDecodeOptions()
  const result = toonToJson(text, options)

  if (!result.success) {
    vscode.window.showErrorMessage(`Conversion failed: ${result.error}`)
    return
  }

  const defaultPath = sourceUri.fsPath.replace(/\.toon$/, '.json')
  const defaultUri = vscode.Uri.file(defaultPath)

  const targetUri = await vscode.window.showSaveDialog({
    defaultUri,
    filters: { 'JSON files': ['json'] },
    title: 'Save JSON file as…',
  })

  if (!targetUri)
    return

  await vscode.workspace.fs.writeFile(targetUri, new TextEncoder().encode(result.output))

  const config = vscode.workspace.getConfiguration('toon')
  if (config.get<boolean>('openAfterConvert', true)) {
    const doc = await vscode.workspace.openTextDocument(targetUri)
    await vscode.window.showTextDocument(doc)
  }

  vscode.window.setStatusBarMessage('$(check) Saved JSON file', 3000)
}
