import './PrioritySelect.css';
import { useMemo } from 'react';
import { useData } from '../../../context';
import Select, { SelectItem } from './Select';
import { TaskDataAccess } from '@axonivy/inscription-core';
import { Message } from '../../../components/props';

const items: SelectItem[] = [
  { label: 'Low', value: 'LOW' },
  { label: 'Normal', value: 'NORMAL' },
  { label: 'High', value: 'HIGH' },
  { label: 'Exception', value: 'EXCEPTION' },
  { label: 'Script', value: 'SCRIPT' }
];

const PrioritySelect = (props: { dataPath: keyof TaskDataAccess; message?: Message }) => {
  const [, priority, setPriority] = useData(props.dataPath);
  const selectedItem = useMemo(() => items.find(e => e.value === priority), [priority]);

  return (
    <div className='priority-select'>
      <Select label='Priority' value={selectedItem} onChange={item => setPriority(item.value)} items={items} message={props.message}>
        <>{selectedItem?.value === 'SCRIPT' && <input className='input' />}</>
      </Select>
    </div>
  );
};

export default PrioritySelect;
