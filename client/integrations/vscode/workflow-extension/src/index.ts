import 'reflect-metadata';
import * as vscode from 'vscode';
import { activate as extensionActivate, GlspApi } from './workflow-extension';

export function activate(context: vscode.ExtensionContext): Promise<GlspApi> {
  return extensionActivate(context);
}
