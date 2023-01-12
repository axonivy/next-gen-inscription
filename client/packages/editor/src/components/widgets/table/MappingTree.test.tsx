import React from 'react';
import { USER_DIALOG_META_CALL } from '@axonivy/inscription-core/src/meta/';
import { Mapping } from '@axonivy/inscription-core';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MappingTree from './MappingTree';
import { DEFAULT_EDITOR_CONTEXT, EditorContextInstance } from '../../../context';

describe('MappingTree', () => {
  const COL_ATTRIBUTES = /▶️ Attribute/;
  const EXP_ATTRIBUTES = /🔽 Attribute/;
  const COL_PARAMS = /▶️ param <workflow.humantask.ProcurementRequest procurementRequest>/;
  const EXP_PARAMS = /🔽 param <workflow.humantask.ProcurementRequest procurementRequest>/;
  const COL_REQUEST = /▶️ procurementRequest workflow.humantask.ProcurementRequest in/;
  const EXP_REQUEST = /🔽 procurementRequest workflow.humantask.ProcurementRequest in/;
  const NODE_BOOLEAN = /🔵 accepted java.lang.Boolean/;
  const NODE_NUMBER = /🔵 amount java.lang.Number/;

  const data: Mapping[] = [{ key: 'param.procurementRequest', value: 'in' }];

  function renderTree(
    options: {
      onChange?: (change: Mapping[]) => void;
    } = {}
  ) {
    render(<MappingTree data={data} mappingTree={USER_DIALOG_META_CALL} onChange={options.onChange ? options.onChange : () => {}} />);
  }

  function assertTableHeaders(expectedHeaders: string[]) {
    const headers = screen.getAllByRole('columnheader');
    expect(headers).toHaveLength(expectedHeaders.length);
    headers.forEach((header, index) => {
      expect(header).toHaveTextContent(expectedHeaders[index]);
    });
  }

  function assertTableRows(expectedRows: (RegExp | string)[]) {
    const rows = screen.getAllByRole('row');
    expect(rows).toHaveLength(expectedRows.length);
    rows.forEach((row, index) => {
      expect(row).toHaveAccessibleName(expectedRows[index]);
    });
  }

  test('tree will render', () => {
    renderTree();
    assertTableHeaders(['▶️ Attribute', 'Type', 'Expression']);
    assertTableRows([COL_ATTRIBUTES, EXP_PARAMS, COL_REQUEST]);
  });

  test('tree can expand / collapse all', async () => {
    renderTree();
    const treeExpander = screen.getByRole('button', { name: 'Expand tree' });
    await userEvent.click(treeExpander);
    assertTableRows([EXP_ATTRIBUTES, EXP_PARAMS, EXP_REQUEST, NODE_BOOLEAN, NODE_NUMBER]);

    await userEvent.click(treeExpander);
    assertTableRows([COL_ATTRIBUTES, COL_PARAMS]);
  });

  test('tree can expand / collapse row', async () => {
    renderTree();
    const rowExpander = screen.getByRole('button', { name: 'Expand row' });
    await userEvent.click(rowExpander);
    assertTableRows([COL_ATTRIBUTES, EXP_PARAMS, EXP_REQUEST, NODE_BOOLEAN, NODE_NUMBER]);
    await userEvent.click(rowExpander);
    assertTableRows([COL_ATTRIBUTES, EXP_PARAMS, COL_REQUEST]);
  });

  test('tree can edit expression', async () => {
    let mapping = { ...data };
    renderTree({ onChange: (change: Mapping[]) => (mapping = change) });
    const rowExpander = screen.getByRole('button', { name: 'Expand row' });
    await userEvent.click(rowExpander);
    const inputs = screen.getAllByRole('textbox');
    expect(inputs).toHaveLength(4);

    await userEvent.type(inputs[3], 'text3');
    await userEvent.tab();
    expect(inputs[1]).toHaveValue('in');
    expect(inputs[3]).toHaveValue('text3');
    assertDataMapping(mapping[0], { key: 'param.procurementRequest', value: 'in' });
    assertDataMapping(mapping[1], { key: 'param.procurementRequest.amount', value: 'text3' });
  });

  test('tree support readonly mode', async () => {
    render(
      <EditorContextInstance.Provider value={{ ...DEFAULT_EDITOR_CONTEXT, readonly: true }}>
        <MappingTree data={data} mappingTree={USER_DIALOG_META_CALL} onChange={() => {}} />
      </EditorContextInstance.Provider>
    );

    expect(screen.getByDisplayValue(/in/)).toBeDisabled();
  });

  function assertDataMapping(mapping: Mapping, expectedMapping: Mapping) {
    expect(mapping.key).toEqual(expectedMapping.key);
    expect(mapping.value).toEqual(expectedMapping.value);
  }
});
