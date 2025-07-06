import React, { useEffect, useState } from 'react';
import DataGrid, { Column, TextEditor, Row } from 'react-data-grid';
import 'react-data-grid/lib/styles.css';
import { loadCells, saveCell } from '../db/indexedDB';

interface SpreadsheetRow {
  id: number;
  [key: string]: string | number;
}

const COLUMNS: Column<SpreadsheetRow>[] = Array.from({ length: 26 }, (_, i) => ({
  key: String.fromCharCode(65 + i),
  name: String.fromCharCode(65 + i),
  editor: TextEditor
}));

const ROWS_COUNT = 100;

const createRow = (rowIndex: number, cells: Record<string, string>): SpreadsheetRow => ({
  id: rowIndex,
  ...Object.fromEntries(
    COLUMNS.map(col => [
      col.key, 
      cells[`${col.key}${rowIndex}`] || ''
    ])
  )
});

export default function Spreadsheet() {
  const [rows, setRows] = useState<SpreadsheetRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initGrid = async () => {
      const cells = await loadCells();
      const cellMap = Object.fromEntries(
        cells.map(cell => [cell.id, cell.value])
      );
      
      setRows(
        Array.from({ length: ROWS_COUNT }, (_, i) => 
          createRow(i, cellMap)
        )
      );
      setIsLoading(false);
    };

    initGrid();
  }, []);

  const handleCellChange = async (changes: { row: SpreadsheetRow, column: Column<SpreadsheetRow>, value: string }[]) => {
    const updates = changes.map(async ({ row, column, value }) => {
      const cellId = `${column.key}${row.id}`;
      await saveCell(cellId, value);
      return { ...row, [column.key]: value };
    });

    const updatedRows = await Promise.all(updates);
    setRows(prev => prev.map(r => 
      updatedRows.find(ur => ur.id === r.id) || r
    ));
  };

  if (isLoading) return <div>Loading spreadsheet...</div>;

  return (
    <DataGrid
      columns={COLUMNS}
      rows={rows}
      onRowsChange={handleCellChange}
      rowKeyGetter={(row: SpreadsheetRow) => row.id}
      className="fill-grid"
    />
  );
}