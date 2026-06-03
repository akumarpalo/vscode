import * as vscode from 'vscode'
import {
  convertToJsonFileCommand,
  convertToToonFileCommand,
  jsonToToonCommand,
  toonToJsonCommand,
} from './commands'
import { setupDiagnostics } from './diagnostics'

export function activate(context: vscode.ExtensionContext): void {
  context.subscriptions.push(
    vscode.commands.registerCommand('toon.jsonToToon', jsonToToonCommand),
    vscode.commands.registerCommand('toon.toonToJson', toonToJsonCommand),
    vscode.commands.registerCommand('toon.convertToToonFile', convertToToonFileCommand),
    vscode.commands.registerCommand('toon.convertToJsonFile', convertToJsonFileCommand),
  )

  setupDiagnostics(context)
}

export function deactivate(): void {}
