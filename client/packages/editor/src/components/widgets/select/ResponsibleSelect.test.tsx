import React from 'react';
import { render, screen } from '@testing-library/react';
import ResponsibleSelect from './ResponsibleSelect';
import { Message } from '../../props';
import { DataContext, DataContextInstance } from '../../../context';

describe('ResponsibleSelect', () => {
  function renderSelect(responsible: any, message?: Message) {
    const data: DataContext = {
      data: { config: { task: { expiry: { responsible: { ...responsible } } } } },
      initialData: {},
      updateData: () => {},
      validation: []
    };
    render(
      <DataContextInstance.Provider value={data}>
        <ResponsibleSelect />
      </DataContextInstance.Provider>
    );
  }

  test('responsible select will render select for role', async () => {
    renderSelect({ role: 'ROLE' });
    const selects = screen.getAllByRole('combobox');
    expect(selects[0]).toHaveTextContent('Role');
    expect(selects[1]).toHaveTextContent('Everybody');
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });

  test('responsible select will render input for role attr option', async () => {
    renderSelect({ role: 'ROLE_FROM_ATTR' });
    expect(screen.getByRole('combobox')).toHaveTextContent('Role from Attr');
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  test('responsible select will render input for user attr option', async () => {
    renderSelect({ role: 'USER_FROM_ATTR' });
    expect(screen.getByRole('combobox')).toHaveTextContent('User from Attr');
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  test('responsible select will render nothing for delete option', async () => {
    renderSelect({ role: 'NOBODY_DELETE' });
    expect(screen.getByRole('combobox')).toHaveTextContent('Nobody & delete');
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });
});
