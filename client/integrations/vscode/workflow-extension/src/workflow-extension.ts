import { GlspVscodeConnector, NavigateAction } from '@eclipse-glsp/vscode-integration';
import {
  configureDefaultCommands,
  GlspServerLauncher,
  SocketGlspVscodeServer
} from '@eclipse-glsp/vscode-integration/lib/quickstart-components';
import * as path from 'path';
import * as process from 'process';
import 'reflect-metadata';
import * as vscode from 'vscode';

import * as config from './server-config.json';
import WorkflowEditorProvider from './workflow-editor-provider';

const DEFAULT_SERVER_PORT = '5007';
const { version, isSnapShot, classifier } = config;
const JAVA_EXECUTABLE = path.join(
  __dirname,
  `../server/org.eclipse.glsp.example.workflow-${version}${isSnapShot ? '-SNAPSHOT' : ''}-${classifier}.jar`
);

// command definitions
const OpenInscriptionEditorCommand = { id: 'inscriptionEditor.open', label: 'Open Inscription Editor' };

export interface GlspApi {
  connector: WorkflowVscodeConnector;
}

export class WorkflowVscodeConnector extends GlspVscodeConnector {
  getActiveSelection(): string[] {
    for (let [id, client] of this.clientMap) {
      if (client.webviewPanel.active) {
        return this.clientSelectionMap.get(id) || [];
      }
    }
    return [];
  }
}

export async function activate(context: vscode.ExtensionContext): Promise<GlspApi> {
  // Start server process using quickstart component
  if (process.env.GLSP_SERVER_DEBUG !== 'true') {
    const serverProcess = new GlspServerLauncher({
      executable: JAVA_EXECUTABLE,
      socketConnectionOptions: { port: JSON.parse(process.env.GLSP_SERVER_PORT || DEFAULT_SERVER_PORT) },
      additionalArgs: ['--fileLog', 'true', '--logDir', path.join(__dirname, '../server')],
      logging: true,
      serverType: 'java'
    });
    context.subscriptions.push(serverProcess);
    await serverProcess.start();
  }

  // Wrap server with quickstart component
  const workflowServer = new SocketGlspVscodeServer({
    clientId: 'glsp.workflow',
    clientName: 'workflow',
    serverPort: JSON.parse(process.env.GLSP_SERVER_PORT || DEFAULT_SERVER_PORT)
  });

  // Initialize GLSP-VSCode connector with server wrapper
  const vscodeConnector = new WorkflowVscodeConnector({
    server: workflowServer,
    logging: true
  });

  const customEditorProvider = vscode.window.registerCustomEditorProvider(
    'workflow.glspDiagram',
    new WorkflowEditorProvider(context, vscodeConnector),
    {
      webviewOptions: { retainContextWhenHidden: true },
      supportsMultipleEditorsPerDocument: false
    }
  );

  context.subscriptions.push(workflowServer, vscodeConnector, customEditorProvider);
  workflowServer.start();

  configureDefaultCommands({ extensionContext: context, connector: vscodeConnector, diagramPrefix: 'workflow' });

  context.subscriptions.push(
    vscode.commands.registerCommand('workflow.goToNextNode', () => {
      vscodeConnector.sendActionToActiveClient(NavigateAction.create('next'));
    }),
    vscode.commands.registerCommand('workflow.goToPreviousNode', () => {
      vscodeConnector.sendActionToActiveClient(NavigateAction.create('previous'));
    }),
    vscode.commands.registerCommand('workflow.showDocumentation', () => {
      vscodeConnector.sendActionToActiveClient(NavigateAction.create('documentation'));
    }),
    vscode.commands.registerCommand('workflow.openInscriptionEditor', () => {
      vscode.commands.executeCommand(OpenInscriptionEditorCommand.id);
    })
  );
  return { connector: vscodeConnector };
}
