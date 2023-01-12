import React from 'react';
import { render, screen } from '@testing-library/react';
import PrioritySelect from './PrioritySelect';
import { Message } from '../../props';
import { DataContext, DataContextInstance } from '../../../context';

describe('PrioritySelect', () => {
  function renderSelect(selectedItem: string, message?: Message) {
    const data: DataContext = {
      data: { config: { task: { priority: selectedItem } } },
      initialData: {},
      updateData: () => {},
      validation: []
    };
    render(
      <DataContextInstance.Provider value={data}>
        <PrioritySelect dataPath='config/task/priority' message={message} />
      </DataContextInstance.Provider>
    );
  }

  test('priority select input will not render', async () => {
    renderSelect('LOW');
    expect(screen.getByRole('combobox')).toHaveTextContent('Low');
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    //TODO: replace with script content validation
  });

  test('priority select input will render for script option', async () => {
    renderSelect('SCRIPT');
    expect(screen.getByRole('combobox')).toHaveTextContent('Script');
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  test('priority select will render message', async () => {
    renderSelect('LOW', { message: 'this is a test message', severity: 'error' });
    expect(screen.getByText('this is a test message')).toHaveClass('input-error');
  });
});
