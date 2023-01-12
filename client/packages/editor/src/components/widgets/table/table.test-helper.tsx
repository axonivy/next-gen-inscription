import { waitFor, screen, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DEFAULT_EDITOR_CONTEXT, EditorContextInstance } from '../../../context';

export function assertTableHeaders(expectedHeaders: string[]) {
  const headers = screen.getAllByRole('columnheader');
  expect(headers).toHaveLength(expectedHeaders.length);
  headers.forEach((header, index) => {
    expect(header).toHaveTextContent(expectedHeaders[index]);
  });
}

export function assertTableRows(expectedRows: (RegExp | string)[]) {
  const rows = screen.getAllByRole('row');
  expect(rows).toHaveLength(expectedRows.length);
  rows.forEach((row, index) => {
    expect(row).toHaveAccessibleName(expectedRows[index]);
  });
}

export function assertTableRowCount(expectedRows: number): Promise<void> {
  return waitFor(() => expect(screen.getAllByRole('row')).toHaveLength(expectedRows));
}

export async function assertAddRow(view: { data: () => any[]; rerender: () => void }, expectedRows: number): Promise<void> {
  await assertTableRowCount(expectedRows + 1);

  const addButton = screen.getByRole('button', { name: 'Add row' });
  await userEvent.click(addButton);
  expect(view.data()).toHaveLength(expectedRows);

  view.rerender();
  await assertTableRowCount(expectedRows + 2);
}

export async function assertRemoveRow(view: { data: () => any[]; rerender: () => void }, expectedRows: number): Promise<void> {
  await assertTableRowCount(expectedRows + 3);

  const removeButtons = screen.getAllByRole('button', { name: 'Remove row' });
  expect(removeButtons).toHaveLength(expectedRows + 1);
  await userEvent.click(removeButtons[0]);
  expect(view.data()).toHaveLength(expectedRows);

  view.rerender();
  await assertTableRowCount(expectedRows + 2);
}

export async function assertAddAndRemoveWithKeyboard(
  view: { data: () => any[]; rerender: () => void },
  defaultRows: number
): Promise<void> {
  await assertTableRowCount(defaultRows + 2);

  const addButton = screen.getByRole('button', { name: 'Add row' });
  addButton.focus();
  await userEvent.keyboard('[Enter]');
  expect(view.data()).toHaveLength(defaultRows + 1);

  view.rerender();
  await assertTableRowCount(defaultRows + 3);

  const removeButtons = screen.getAllByRole('button', { name: 'Remove row' });
  expect(removeButtons).toHaveLength(defaultRows + 1);
  removeButtons[2].focus();
  await userEvent.keyboard('[Enter]');
  expect(view.data()).toHaveLength(defaultRows);

  view.rerender();
  await assertTableRowCount(defaultRows + 2);
}

export async function renderReadonlyTable(table: JSX.Element): Promise<void> {
  render(<EditorContextInstance.Provider value={{ ...DEFAULT_EDITOR_CONTEXT, readonly: true }}>{table}</EditorContextInstance.Provider>);
  expect(screen.getByRole('button', { name: 'Add row' })).toBeDisabled();
  expect(screen.getAllByRole('button', { name: 'Remove row' })[0]).toBeDisabled();
}
