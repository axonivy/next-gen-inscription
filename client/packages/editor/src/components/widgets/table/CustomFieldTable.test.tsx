import React from 'react';
import { CustomField, CustomFieldType } from '@axonivy/inscription-core/src/data/task-data';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CustomFieldTable from './CustomFieldTable';
import {
  assertAddAndRemoveWithKeyboard,
  assertAddRow,
  assertRemoveRow,
  assertTableHeaders,
  assertTableRows,
  renderReadonlyTable
} from './table.test-helper';

describe('CustomFieldTable', () => {
  const customFields: CustomField[] = [
    { name: 'field1', type: CustomFieldType.STRING, value: 'this is a string' },
    { name: 'number', type: CustomFieldType.NUMBER, value: '1' }
  ];
  function renderTable(): {
    data: () => CustomField[];
    rerender: () => void;
  } {
    let data: CustomField[] = customFields;
    const view = render(<CustomFieldTable data={data} onChange={change => (data = change)} />);
    return {
      data: () => data,
      // eslint-disable-next-line testing-library/no-unnecessary-act
      rerender: () => view.rerender(<CustomFieldTable data={data} onChange={change => (data = change)} />)
    };
  }

  test('table will render', () => {
    renderTable();
    assertTableHeaders(['Name', 'Type', 'Expression', 'Actions', '']);
    assertTableRows([/Name/, /field1/, /number/, '']);
  });

  test('table can sort columns', async () => {
    renderTable();
    const columnHeader = screen.getByRole('button', { name: 'Name' });
    await userEvent.click(columnHeader);
    const firstHeader = screen.getAllByRole('columnheader')[0];
    expect(firstHeader).toHaveTextContent('Name 🔼');
    assertTableRows([/Name/, /field1/, /number/, '']);

    await userEvent.click(columnHeader);
    expect(firstHeader).toHaveTextContent('Name 🔽');
    assertTableRows([/Name/, /number/, /field1/, '']);
  });

  test('table can add new row', async () => {
    const view = renderTable();
    await assertAddRow(view, 3);
  });

  test('table can remove a row', async () => {
    const view = renderTable();
    await assertRemoveRow(view, 1);
  });

  test('table can add/remove rows by keyboard', async () => {
    const view = renderTable();
    await assertAddAndRemoveWithKeyboard(view, 2);
  });

  test('table can edit cells', async () => {
    const view = renderTable();
    const field1 = screen.getByDisplayValue(/field1/);
    await userEvent.clear(field1);
    await userEvent.type(field1, 'Hello[Tab]');
    view.rerender();

    const type = screen.getAllByRole('combobox')[1];
    await userEvent.click(type);
    await userEvent.keyboard('[ArrowDown][Enter]');

    expect(view.data()).toEqual([
      { name: 'Hello', type: CustomFieldType.STRING, value: 'this is a string' },
      { name: 'number', type: CustomFieldType.STRING, value: '1' }
    ]);
  });

  test('table support readonly mode', async () => {
    await renderReadonlyTable(<CustomFieldTable data={customFields} onChange={() => {}} />);
    expect(screen.getByDisplayValue(/field1/)).toBeDisabled();
    expect(screen.getAllByRole('combobox')[0]).toBeDisabled();
  });
});
