import { Mapping, MappingData, Variable } from '@axonivy/inscription-core';
import Editor from '@monaco-editor/react';
import { memo } from 'react';
import { MINIMAL_STYLE } from '../../monaco-editor-util';
import { Message } from '../props/message';
import LabelInput from './label/LabelInput';
import MappingTree from './table/MappingTree';

const MappingTreeWithCode = (props: {
  data: MappingData;
  onChange: (change: MappingData) => void;
  mappingTree?: Variable[];
  message?: Message;
}) => {
  const handleMappingChange = (change: Mapping[]) => props.onChange({ ...props.data, mappings: change });
  const handleCodeChange = (code?: string) => props.onChange({ ...props.data, code: code || '' });

  return (
    <>
      <LabelInput label='Mapping' htmlFor='mapping'>
        <MappingTree data={props.data.mappings} mappingTree={props.mappingTree} onChange={handleMappingChange} />
      </LabelInput>
      <LabelInput label='Code' htmlFor='code' message={props.message}>
        <Editor
          className='input code-editor'
          defaultValue={props.data.code}
          value={props.data.code}
          defaultLanguage='form'
          height='90px'
          defaultPath='root.form'
          options={MINIMAL_STYLE}
          theme='axon-input'
          onChange={handleCodeChange}
        />
      </LabelInput>
    </>
  );
};

export default memo(MappingTreeWithCode);
