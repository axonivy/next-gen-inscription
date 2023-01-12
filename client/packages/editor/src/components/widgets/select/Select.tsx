import './Select.css';
import { useSelect } from 'downshift';
import { memo } from 'react';
import LabelInput from '../label/LabelInput';
import { useReadonly } from '../../../context';
import { Message } from 'src/components/props';

export interface SelectItem {
  label: string;
  value: string;
}

const Select = (props: {
  label: string;
  value?: SelectItem;
  onChange: (value: SelectItem) => void;
  items: SelectItem[];
  message?: Message;
  children?: JSX.Element;
}) => {
  const { isOpen, selectedItem, getToggleButtonProps, getLabelProps, getMenuProps, highlightedIndex, getItemProps } = useSelect<SelectItem>(
    {
      selectedItem: props.value,
      items: props.items,
      onSelectedItemChange: change => change.selectedItem && props.onChange(change.selectedItem)
    }
  );
  const readonly = useReadonly();

  return (
    <div className='select'>
      <LabelInput label={props.label} htmlFor='input' message={props.message} {...getLabelProps()}>
        <div className='select-input'>
          <button aria-label='toggle menu' className='select-button' type='button' {...getToggleButtonProps()} disabled={readonly}>
            <span>{selectedItem ? selectedItem.label : ''}</span>
            <span>{isOpen ? <>&#8593;</> : <>&#8595;</>}</span>
          </button>
          {props.children}
        </div>
      </LabelInput>
      <ul {...getMenuProps()} className='select-menu'>
        {isOpen &&
          props.items.map((item, index) => (
            <li
              className={`select-menu-entry ${highlightedIndex === index ? 'hover' : ''} ${
                selectedItem?.value === item.value ? 'selected' : ''
              }`}
              key={`${item.value}${index}`}
              {...getItemProps({ item, index })}
            >
              {item.label}
            </li>
          ))}
      </ul>
    </div>
  );
};

export default memo(Select);
