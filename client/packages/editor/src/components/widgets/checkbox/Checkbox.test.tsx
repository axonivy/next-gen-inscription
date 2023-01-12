import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Checkbox from './Checkbox';
import { DEFAULT_EDITOR_CONTEXT, EditorContextInstance } from '../../../context';

describe('Checkbox', () => {
  function renderCheckbox(): {
    data: () => boolean;
    rerender: () => void;
  } {
    let value = false;
    userEvent.setup();
    const view = render(<Checkbox label='test checkbox' value={value} onChange={(change: boolean) => (value = change)} />);
    return {
      data: () => value,
      rerender: () => view.rerender(<Checkbox label='test checkbox' value={value} onChange={(change: boolean) => (value = change)} />)
    };
  }

  test('checkbox can be toggled by box', async () => {
    const view = renderCheckbox();
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).not.toBeChecked();
    expect(view.data()).toBeFalsy();

    await userEvent.click(checkbox);
    view.rerender();
    expect(checkbox).toBeChecked();
    expect(view.data()).toBeTruthy();

    await userEvent.click(checkbox);
    view.rerender();
    expect(checkbox).not.toBeChecked();
    expect(view.data()).toBeFalsy();
  });

  test('checkbox can be toggled by label', async () => {
    const view = renderCheckbox();
    const label = screen.getByLabelText('test checkbox');
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).not.toBeChecked();

    await userEvent.click(label);
    view.rerender();
    expect(checkbox).toBeChecked();
  });

  test('checkbox can be toggled with keyboard', async () => {
    const view = renderCheckbox();
    const checkbox = screen.getByRole('checkbox');
    await userEvent.tab();
    expect(checkbox).toHaveFocus();
    expect(checkbox).not.toBeChecked();

    await userEvent.keyboard('[Space]');
    view.rerender();
    expect(checkbox).toBeChecked();

    await userEvent.keyboard('[Space]');
    view.rerender();
    expect(checkbox).not.toBeChecked();
  });

  test('checkbox support readonly mode', () => {
    render(
      <EditorContextInstance.Provider value={{ ...DEFAULT_EDITOR_CONTEXT, readonly: true }}>
        <Checkbox label='test checkbox' value={true} onChange={() => {}} />
      </EditorContextInstance.Provider>
    );
    expect(screen.getByRole('checkbox')).toBeDisabled();
  });
});
