import { CallDataAccess, NameDataAccess } from '@axonivy/inscription-core';
import get from 'lodash/get';
import { useCallback, useMemo } from 'react';
import { useDataContext } from './useDataContext';

export interface DataAccess extends NameDataAccess, CallDataAccess {}

export function useData<K extends keyof DataAccess>(path: K): [DataAccess[K], DataAccess[K], (newData: DataAccess[K]) => void];
export function useData<T>(path: string): [T, T, (newData: T) => void];
export function useData<T>(path: string): [T, T, (newData: T) => void] {
  const { initialData, data, updateData } = useDataContext();
  const fullPath = useMemo(() => path.split('/'), [path]);
  const setData = useCallback((newData: T) => updateData(fullPath, newData), [updateData, fullPath]);
  return [get(initialData, fullPath), get(data, fullPath), setData];
}
