import { InscriptionType } from '@axonivy/inscription-core';
import React, { useContext } from 'react';

export interface EditorContext {
  pid: string;
  readonly: boolean;
  type: InscriptionType;
}

export const DEFAULT_EDITOR_CONTEXT: EditorContext = {
  pid: '',
  readonly: false,
  type: {
    id: 'Unknown',
    label: 'Unknown Inscription Editor',
    shortLabel: 'Unknown',
    description: 'This is an Inscription Editor for an unknown element type',
    iconId: 'unknown'
  }
};

export const EditorContextInstance = React.createContext<EditorContext>(DEFAULT_EDITOR_CONTEXT);
export const useEditorContext = (): EditorContext => useContext(EditorContextInstance);
export const useReadonly = (): boolean => useContext(EditorContextInstance).readonly;
