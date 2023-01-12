import { FormLanguage, InscriptionClient, InscriptionClientMock, MonacoUtil } from '@axonivy/inscription-core';
import { AutoSaveApp } from '@axonivy/inscription-editor/lib/App';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { ClientContextInstance, MonacoEditorUtil } from '../../../packages/editor/lib';
import './index.css';

declare var acquireVsCodeApi: any;

interface Message {
  command: string;
}

interface PidMessage extends Message {
  args: { pid?: string };
}

export async function start(): Promise<void> {
  MonacoEditorUtil.initMonaco();
  // for the demonstration we do not load web workers as their support is not great in web extensions
  // potential work arounds can be found here: https://github.com/microsoft/vscode/issues/87282
  MonacoUtil.initStandalone(false);
  FormLanguage.startWebSocketClient('ws://localhost:5013');

  const root = ReactDOM.createRoot(document.getElementById('root')!);
  const inscriptionClient = new InscriptionClientMock();

  window.addEventListener('message', event => {
    const message = event.data;
    switch (message?.command) {
      case 'pid':
        root.render(render(inscriptionClient, (message as PidMessage).args.pid));
        break;
    }
  });

  root.render(render(inscriptionClient, '1'));

  const vscode = acquireVsCodeApi();
  vscode.postMessage({ command: 'ready' });
}

export function render(inscriptionClient: InscriptionClient, pid: string = '1'): React.ReactNode {
  return (
    <React.StrictMode>
      <ClientContextInstance.Provider value={{ client: inscriptionClient }}>
        <AutoSaveApp pid={pid} />
      </ClientContextInstance.Provider>
    </React.StrictMode>
  );
}

start();
