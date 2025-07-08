import Dexie from 'dexie';

export interface Cell {
  id: string;
  value: string;
}

class SpreadsheetDB extends Dexie {
  cells: Dexie.Table<Cell, string>;

  constructor() {
    super('SpreadsheetDB');
    this.version(1).stores({
      cells: 'id'  // Primary key
    });
    this.cells = this.table('cells');
  }
}

export const db = new SpreadsheetDB();

// CRUD operations
export const saveCell = async (cellId: string, value: string) => {
  await db.cells.put({ id: cellId, value });
};

export const loadCells = async () => {
  return db.cells.toArray();
};