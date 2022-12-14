import { InscriptionValidation } from '@axonivy/inscription-core';
import { useDataContext } from './useDataContext';

export type ValidationAccess = 'name' | 'description' | 'config/dialog';

export function useValidation<K extends ValidationAccess>(path: K): InscriptionValidation;
export function useValidation(path: string): InscriptionValidation {
  const { validation } = useDataContext();
  const valResult = validation.find(val => val.path === path) as any;
  return valResult;
}
