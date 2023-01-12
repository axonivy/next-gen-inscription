import set from 'lodash/fp/set';

import { InscriptionValidation } from '@axonivy/inscription-core';
import { useEffect, useMemo, useState } from 'react';
import './App.css';
import '@axonivy/editor-icons/dist/ivy-icons.css';
import { DataContextInstance, DEFAULT_EDITOR_CONTEXT, EditorContext, EditorContextInstance, useClient, useTheme } from './context';
import { inscriptionEditor } from './components/editors/InscriptionEditor';
import AppStateView from './AppStateView';
import { AppState, errorState, successState, waitingState } from './app-state';

export interface AppProps {
  pid: string;
}

function App(props: AppProps) {
  const [data, setData] = useState<any>();
  const [appState, setAppState] = useState<AppState>(waitingState());
  const [validation, setValidation] = useState<InscriptionValidation[]>([]);
  const client = useClient();
  const theme = useTheme();

  useEffect(() => {
    client
      .data(props.pid)
      .then(data => {
        setAppState(successState(data));
        setData(data.data);
      })
      .catch(error => errorState(error));
  }, [client, props.pid]);

  useEffect(() => {
    //Fix: first load shouldn't trigger a save
    if (appState.initialData) {
      client
        .saveData({ data: data, pid: appState.initialData.pid, type: appState.initialData.type.id })
        .then(validation => setValidation(validation));
    }
  }, [client, data, appState]);

  const updateData = <T,>(path: string | string[], value: T): void => {
    // we know this function is always called on success when data is available
    setData((prev: any) => set(path, value, prev!));
  };

  const dataContext = useMemo(() => {
    return { data: data, initialData: appState.initialData?.data, updateData, validation: validation };
  }, [appState.initialData, data, validation]);

  const editorContext = useMemo<EditorContext>(() => {
    return {
      pid: props.pid,
      readonly: appState.initialData?.readonly ?? DEFAULT_EDITOR_CONTEXT.readonly,
      type: appState.initialData?.type ?? DEFAULT_EDITOR_CONTEXT.type
    };
  }, [props.pid, appState.initialData]);

  if (appState.state === 'success') {
    return (
      <div className='editor-root' data-theme={theme}>
        <EditorContextInstance.Provider value={editorContext}>
          <DataContextInstance.Provider value={dataContext}>
            {inscriptionEditor(appState.initialData?.type.id)}
          </DataContextInstance.Provider>
        </EditorContextInstance.Provider>
      </div>
    );
  }

  return <AppStateView {...appState} />;
}

export default App;
