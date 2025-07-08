// core/src/components/Spreadsheet.tsx
import React, { useEffect, useState } from 'react';
import DataGrid from 'react-data-grid';
import type { Column } from 'react-data-grid';
import 'react-data-grid/lib/styles.css';

import { loadCells, saveCell } from '../db/indexedDB';
import type { Cell } from '../db/indexedDB';
import { useHotkeys } from 'react-hotkeys-hook';

const COLUMN_COUNT = 26;
const ROW_COUNT = 100;

// Define custom row interface
interface SpreadsheetRow {
  id: number;
  [key: string]: string | number;
}

// Generate columns A–Z, all editable
const columns: Column<any>[] = Array.from({ length: COLUMN_COUNT }, (_, i) => ({
  key: String.fromCharCode(65 + i),
  name: String.fromCharCode(65 + i),
  width: 120,
  editable: true, // uses the built-in text editor :contentReference[oaicite:1]{index=1}
  resizable: true,
}));

const createEmptyRow = (rowIndex: number): SpreadsheetRow => {
  const row: any = { id: rowIndex };
  columns.forEach(col => {
    row[col.key] = '';
  });
  return row;
};

const getCellId = (columnKey: string, rowId: number) => `${columnKey}${rowId + 1}`;

const Spreadsheet = () => {
  const [rows, setRows] = useState<SpreadsheetRow[]>([]);
  const [selectedCell, setSelectedCell] = useState<{ rowIdx: number; colIdx: number } | null>(null);

  // Initialize empty rows
  useEffect(() => {
    setRows(Array.from({ length: ROW_COUNT }, (_, i) => createEmptyRow(i)));
  }, []);

  // Load from IndexedDB
  useEffect(() => {
    (async () => {
      const cells = await loadCells();
      setRows(prev =>
        prev.map(row => {
          const newRow = { ...row };
          columns.forEach(col => {
            const id = getCellId(col.key, row.id);
            const cell = cells.find(c => c.id === id);
            if (cell) newRow[col.key] = cell.value;
          });
          return newRow;
        })
      );
    })();
  }, []);

  // Shortcut for Save
  useHotkeys('ctrl+s, cmd+s', e => {
    e.preventDefault();
    saveToDB();
  });

  const saveToDB = async () => {
    const cellsToSave: Cell[] = [];
    rows.forEach(row => {
      columns.forEach(col => {
        const value = row[col.key];
        if (value !== undefined && value !== '') {
          cellsToSave.push({ id: getCellId(col.key, row.id), value: String(value) });
        }
      });
    });
    await saveCell(cellsToSave);
    console.log('Saved cells to IndexedDB:', cellsToSave.length);
  };

  const handleRowsChange = (updatedRows: SpreadsheetRow[], { indexes, column }: any) => {
    setRows(updatedRows);
    if (column) {
      const cellsToSave: Cell[] = [];
      indexes.forEach((rIdx: number) => {
        const row = updatedRows[rIdx];
        const value = row[column.key];
        cellsToSave.push({ id: getCellId(column.key, row.id), value: String(value) });
      });
      if (cellsToSave.length) saveCells(cellsToSave);
    }
  };

  const handleCellSelect = (pos: { rowIdx: number; idx: number }) => {
    setSelectedCell(pos);
  };

  return (
    <div className="spreadsheet-container">
      <div className="toolbar">
        <button onClick={saveToDB} className="save-button">Save (Ctrl+S)</button>
        <div className="cell-info">
          {selectedCell
            ? `Selected: ${String.fromCharCode(65 + selectedCell.colIdx)}${selectedCell.rowIdx + 1}`
            : '🔲 Select a cell'}
        </div>
      </div>
      <DataGrid
        columns={columns}
        rows={rows}
        onRowsChange={handleRowsChange}
        rowKeyGetter={row => row.id}
        onCellSelect={handleCellSelect}
        className="fill-grid rdg-light"
      />
    </div>
  );
};

export default Spreadsheet;
