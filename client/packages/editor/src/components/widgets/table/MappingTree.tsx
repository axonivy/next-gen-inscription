import React, { memo, useMemo } from 'react';

import { Mapping, Variable } from '@axonivy/inscription-core';
import {
  ColumnDef,
  ExpandedState,
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable
} from '@tanstack/react-table';
import { EditableCell } from './cell/EditableCell';
import { ExpandableCell, ExpandableHeader } from './cell/ExpandableCell';
import { Table } from './table/Table';
import { MappingTreeData } from './mapping-tree-data';
import { TableHeader } from './header/TableHeader';
import { TableCell } from './cell/TableCell';

const MappingTree = (props: { data: Mapping[]; mappingTree?: Variable[]; onChange: (change: Mapping[]) => void }) => {
  const data: MappingTreeData[] = useMemo(() => {
    const treeData = MappingTreeData.of(props.mappingTree);
    props.data?.forEach(mapping => MappingTreeData.update(treeData, mapping.key.split('.'), mapping.value));
    return treeData;
  }, [props.data, props.mappingTree]);

  const columns = React.useMemo<ColumnDef<MappingTreeData>[]>(
    () => [
      {
        accessorFn: row => row.attribute,
        id: 'attribute',
        header: header => <ExpandableHeader header={header} name='Attribute' />,
        cell: cell => <ExpandableCell cell={cell} />,
        footer: props => props.column.id,
        enableSorting: false
      },
      {
        accessorFn: row => row.simpleType,
        id: 'simpleType',
        header: () => <span>Type</span>,
        cell: cell => <span title={cell.row.original.type}>{cell.getValue() as string}</span>,
        footer: props => props.column.id,
        enableSorting: false
      },
      {
        accessorFn: row => row.value,
        id: 'value',
        header: () => <span>Expression</span>,
        cell: cell => <EditableCell cell={cell} />,
        footer: props => props.column.id
      }
    ],
    []
  );

  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [expanded, setExpanded] = React.useState<ExpandedState>({ 0: true });

  const table = useReactTable({
    data: data,
    columns,
    state: {
      sorting,
      expanded
    },
    onExpandedChange: setExpanded,
    getSubRows: row => row.children,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    meta: {
      updateData: (rowId: string, columnId: string, value: unknown) => {
        const rowIndex = rowId.split('.').map(parseFloat);
        props.onChange(MappingTreeData.to(MappingTreeData.updateDeep(data, rowIndex, columnId, value)));
      }
    }
  });

  return (
    <Table>
      <thead>
        {table.getHeaderGroups().map(headerGroup => (
          <tr key={headerGroup.id}>
            {headerGroup.headers.map(header => (
              <TableHeader key={header.id} colSpan={header.colSpan}>
                {flexRender(header.column.columnDef.header, header.getContext())}
              </TableHeader>
            ))}
          </tr>
        ))}
      </thead>
      <tbody>
        {table.getRowModel().rows.map(row => (
          <tr key={row.id}>
            {row.getVisibleCells().map(cell => (
              <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
            ))}
          </tr>
        ))}
      </tbody>
    </Table>
  );
};

export default memo(MappingTree);
