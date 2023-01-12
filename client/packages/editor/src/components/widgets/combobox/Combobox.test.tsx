import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Message } from '../../props/message';
import Combobox from './Combobox';
import { ComboboxItem } from '../../props/combobox';
import { DEFAULT_EDITOR_CONTEXT, EditorContextInstance } from '../../../context';

describe('Combobox', () => {
  function renderCombobox(
    value: string,
    options: {
      itemFilter?: (item: ComboboxItem, input?: string) => boolean;
      comboboxItem?: (item: ComboboxItem) => JSX.Element;
      onChange?: (change: string) => void;
      message?: Message;
    } = {}
  ) {
    const items: ComboboxItem[] = [{ value: 'test' }, { value: 'bla' }];
    render(
      <Combobox
        label='Combobox'
        items={items}
        itemFilter={options.itemFilter}
        comboboxItem={options.comboboxItem ? options.comboboxItem : item => <span>{item.value}</span>}
        value={value}
        onChange={options.onChange ? options.onChange : () => {}}
        message={options.message}
      />
    );
  }

  function assertMenuContent(expectedItems?: string[]) {
    const menu = screen.getByRole('listbox');
    if (expectedItems) {
      expect(menu).not.toBeEmptyDOMElement();
      const items = screen.getAllByRole('option');
      expect(items).toHaveLength(expectedItems.length);
      items.forEach((item, index) => {
        expect(item).toHaveTextContent(expectedItems[index]);
      });
    } else {
      expect(menu).toBeEmptyDOMElement();
    }
  }

  test('combobox will render', async () => {
    renderCombobox('test');
    const combobox = screen.getByRole('combobox', { name: 'Combobox' });
    expect(combobox).toHaveValue('test');
    expect(combobox).toHaveAttribute('placeholder', 'Select Combobox');
    const button = screen.getByRole('button', { name: 'toggle menu' });
    expect(button).toHaveTextContent('↓');
  });

  test('combobox will open on button click', async () => {
    renderCombobox('test');
    assertMenuContent();
    const button = screen.getByRole('button', { name: 'toggle menu' });
    await userEvent.click(button);
    assertMenuContent(['test', 'bla']);
  });

  test('combobox will render custom items', async () => {
    renderCombobox('test', { comboboxItem: item => <span>+ {item.value}</span> });
    assertMenuContent();
    const button = screen.getByRole('button', { name: 'toggle menu' });
    await userEvent.click(button);
    assertMenuContent(['+ test', '+ bla']);
  });

  test('combobox will update on item select', async () => {
    let data = 'test';
    renderCombobox(data, { onChange: (change: string) => (data = change) });
    const button = screen.getByRole('button', { name: 'toggle menu' });
    await userEvent.click(button);
    const item = screen.getByRole('option', { name: 'bla' });
    await userEvent.click(item);
    assertMenuContent();
    const combobox = screen.getByRole('combobox', { name: 'Combobox' });
    expect(combobox).toHaveValue('bla');
    expect(data).toEqual('bla');
  });

  test('combobox will not update on invalid input', async () => {
    let data = 'test';
    renderCombobox(data, { onChange: (change: string) => (data = change) });
    const combobox = screen.getByRole('combobox', { name: 'Combobox' });
    await userEvent.type(combobox, '123');
    expect(combobox).toHaveValue('test123');
    expect(data).toEqual('test');
  });

  test('combobox will update on input change', async () => {
    let data = 'test';
    renderCombobox(data, { onChange: (change: string) => (data = change) });
    const combobox = screen.getByRole('combobox', { name: 'Combobox' });
    await userEvent.clear(combobox);
    await userEvent.type(combobox, 'la');
    await userEvent.keyboard('[ArrowDown]');
    const item = screen.getByRole('option', { name: 'bla' });
    expect(item).toHaveClass('hover');
    await userEvent.keyboard('[Enter]');
    expect(data).toEqual('bla');
  });

  test('combobox will use custom filter', async () => {
    const itemFilter = (item: ComboboxItem, input?: string) => {
      if (!input) {
        return true;
      }
      return item.value.startsWith(input);
    };
    renderCombobox('test', { itemFilter: itemFilter });
    const combobox = screen.getByRole('combobox', { name: 'Combobox' });
    await userEvent.clear(combobox);
    await userEvent.type(combobox, 'la');
    assertMenuContent();
    await userEvent.clear(combobox);
    await userEvent.type(combobox, 'b');
    assertMenuContent(['bla']);
  });

  test('combobox will render message', async () => {
    renderCombobox('test', { message: { message: 'this is a message', severity: 'error' } });
    expect(screen.getByText('this is a message')).toHaveClass('input-message', 'input-error');
  });

  test('combobox support readonly mode', async () => {
    render(
      <EditorContextInstance.Provider value={{ ...DEFAULT_EDITOR_CONTEXT, readonly: true }}>
        <Combobox
          label='Combobox'
          items={[{ value: 'test' }]}
          comboboxItem={item => <span>{item.value}</span>}
          value={'test'}
          onChange={() => {}}
        />
      </EditorContextInstance.Provider>
    );

    expect(screen.getByRole('combobox', { name: 'Combobox' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'toggle menu' })).toBeDisabled();
  });
});
