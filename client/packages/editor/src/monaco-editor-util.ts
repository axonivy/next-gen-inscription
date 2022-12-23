import { loader, Monaco } from '@monaco-editor/react';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';

export const MINIMAL_STYLE: monaco.editor.IStandaloneEditorConstructionOptions = {
  glyphMargin: false,
  lineNumbers: 'off',
  minimap: { enabled: false },
  overviewRulerBorder: false,
  overviewRulerLanes: 1,
  lineDecorationsWidth: 0,
  lineNumbersMinChars: 0,
  folding: false,
  renderLineHighlight: 'none',
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
  fontSize: 12
};

export namespace MonacoEditorUtil {
  export function initMonaco(usableMonaco: Monaco = monaco): Monaco {
    loader.config({ monaco: usableMonaco });

    monaco.languages.register({
      id: 'form',
      extensions: ['.form', '.form'],
      aliases: ['Form', 'form']
    });

    monaco.editor.defineTheme('axon-input', {
      base: 'vs-dark',
      colors: {
        'editor.foreground': '#FFFFFF',
        'editorCursor.foreground': '#FFFFFF',
        'editor.background': '#202020'
      },
      inherit: true,
      rules: []
    });

    return usableMonaco;
  }
}
