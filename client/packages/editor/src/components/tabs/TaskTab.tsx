import { useData, useReadonly } from '../../context';
import { TabProps, TabState } from '../props';
import CollapsiblePart from '../widgets/collapsible/CollapsiblePart';
import LabelInput from '../widgets/label/LabelInput';
import PrioritySelect from '../widgets/select/PrioritySelect';
import Checkbox from '../widgets/checkbox/Checkbox';
import { CodeEditor } from '../widgets';
import Expiry from '../widgets/Expiry';
import CustomFieldTable from '../widgets/table/CustomFieldTable';

export function useTaskTab(): TabProps {
  return { name: 'Task', state: TabState.CONFIGURED, content: <TaskTab /> };
}

const TaskTab = () => {
  const [, name, setName] = useData('config/task/name');
  const [, description, setDescription] = useData('config/task/description');
  const [, category, setCategory] = useData('config/task/category');
  const [, persist, setPersist] = useData('config/persist');
  const [, customField, setCustomField] = useData('config/task/customFields');
  const [, code, setCode] = useData('config/task/code');
  const readonly = useReadonly();

  return (
    <>
      <LabelInput label='Name' htmlFor='name'>
        <input className='input' id='name' value={name} onChange={event => setName(event.target.value)} disabled={readonly} />
      </LabelInput>
      <LabelInput label='Description' htmlFor='description'>
        <textarea
          rows={2}
          className='input'
          id='description'
          value={description}
          onChange={event => setDescription(event.target.value)}
          disabled={readonly}
        />
      </LabelInput>
      <LabelInput label='Category' htmlFor='category'>
        <input className='input' id='category' value={category} onChange={event => setCategory(event.target.value)} disabled={readonly} />
      </LabelInput>
      <PrioritySelect dataPath='config/task/priority' />
      <CollapsiblePart collapsibleLabel='Options' defaultOpen={persist}>
        <Checkbox label='Persist task on creation' value={persist} onChange={setPersist} />
      </CollapsiblePart>
      <Expiry />
      <CollapsiblePart collapsibleLabel='Custom Fields' defaultOpen={false}>
        <CustomFieldTable data={customField ?? []} onChange={setCustomField} />
      </CollapsiblePart>
      <CollapsiblePart collapsibleLabel='Code' defaultOpen={false}>
        <CodeEditor code={code} onChange={code => setCode(code ?? '')} location='task.code' />
      </CollapsiblePart>
    </>
  );
};
