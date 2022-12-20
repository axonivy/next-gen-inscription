import { CallData, Document, InscriptionValidation, MappingData, NameData } from '@axonivy/inscription-core';
import get from 'lodash/get';
import React, { useContext } from 'react';

export interface DataContext {
  initialData: any;
  data: any;
  updateData: <T>(path: string | string[], value: T) => void;
  validation: InscriptionValidation[];
}

const defaultDataContext: any = undefined;

export const DataContextInstance = React.createContext<DataContext>(defaultDataContext);
export const useDataContext = (): DataContext => useContext(DataContextInstance);

export interface DataAccess {
  nameData: NameData;
  'nameData/displayName': string;
  'nameData/description': string;
  'nameData/documents': Document[];
  'nameData/tags': string[];
  callData: CallData;
  'callData/dialogStart': string;
  'callData/mappingData': MappingData;
  'callData/mappingData/code': string;
}

export function useData<K extends keyof DataAccess>(path: K): [DataAccess[K], DataAccess[K], (newData: DataAccess[K]) => void];
export function useData<T>(path: string): [T, T, (newData: T) => void];
export function useData<T>(path: string): [T, T, (newData: T) => void] {
  const fullPath = path.split('/');
  const { initialData, data, updateData } = useDataContext();
  return [get(initialData, fullPath), get(data, fullPath), (newData: T) => updateData<T>(fullPath, newData)];
}