import set from 'lodash/fp/set';

import { InscriptionData, InscriptionType, InscriptionValidation } from '@axonivy/inscription-core';
import debounce from 'lodash/debounce';
import isEqual from 'lodash/isEqual';
import { ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import '../style/App.css';
import UserDialogEditor from './components/editors/UserDialogEditor';
import UserTaskEditor from './components/editors/UserTaskEditor';
import { DataContextInstance, useClient } from './context';

export interface AppState {
  state: 'waiting' | 'success' | 'error';
  initialData: InscriptionData | null;
  error: string | null;
}

export function waiting(): AppState {
  return { state: 'waiting', initialData: null, error: null };
}

export function error(error: string): AppState {
  return { state: 'error', initialData: null, error };
}

export function success(initialData: InscriptionData): AppState {
  return { state: 'success', initialData, error: null };
}

export interface AppProps {
  pid: string;
  onStateChanged?: (data: InscriptionData, dirty: boolean) => void;
}

const App: React.FC<AppProps> = ({ pid, onStateChanged }) => {
  const [data, setData] = useState<InscriptionData>();
  const [appState, setAppState] = useState<AppState>(waiting());
  const [validation, setValidation] = useState<InscriptionValidation[]>([]);
  const client = useClient();

  const updateData = useCallback(<T,>(path: string | string[], value: T): void => {
    // we know this function is always called on success when (previous) data is available
    setData((prevData: InscriptionData | undefined) => ({ ...prevData!, data: set(path, value, prevData!.data) }));
  }, []);

  useEffect(() => {
    const dispose = client.onValidation(validation => setValidation(validation));
    return () => dispose.dispose();
  }, [client]);
  
  useEffect(() => {
    const dispose = client.onDataChanged(newData => setAppState(success(newData)));
    return () => dispose.dispose();
  }, [client]);


  useEffect(() => {
    client.data(pid).then(data => {
      if (data) {
        setAppState(success(data));
        setData(data);
      } else {
        setAppState(error('No data found.'));
      }
    }).catch(error => setAppState(error(error)));
  }, [client, pid]);

  useEffect(() => {
    if (data) {
      const dirty = !isEqual(appState.initialData, data);
      if (onStateChanged) {
        onStateChanged(data, dirty);
      }
    }
  }, [appState.initialData, data, onStateChanged]);

  const dataContext = useMemo(() => {
    return { data: data?.data, initialData: appState.initialData?.data, updateData, validation };
  }, [appState.initialData?.data, data?.data, updateData, validation]);

  if (appState.state === 'waiting') {
    return <div>Loading...</div>;
  }
  if (appState.state === 'error') {
    return <div>Error: {appState.error}</div>;
  }

  return (
    <div className='App-header'>
      <DataContextInstance.Provider value={dataContext}>{InscriptionEditor(appState.initialData?.type)}</DataContextInstance.Provider>
    </div>
  );
}

export interface AutoSaveAppProps {
  pid: string;
  autoSaveDelay?: number;
}

export const AutoSaveApp: React.FC<AutoSaveAppProps> = ({ pid, autoSaveDelay = 200 }) => {
  const client = useClient();

  const autoSaveData = useMemo(() => debounce((data: InscriptionData, dirty: boolean): void => {
    if (dirty) {
      client.saveData(data);
    }
  }, autoSaveDelay), [client, autoSaveDelay]);

  return <App pid={pid} onStateChanged={autoSaveData} />;
}

const InscriptionEditor = (type?: InscriptionType): ReactNode => {
  switch (type) {
    case 'UserDialog':
      return <UserDialogEditor />;
    case 'UserTask':
      return <UserTaskEditor />;
    default:
      return <div>No Editor found for type: {type}</div>;
  }
};

export default App;
