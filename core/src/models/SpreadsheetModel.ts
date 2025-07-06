import { makeAutoObservable } from 'mobx';
import { MEDIA_ROOT } from '../config';
import { useMediaFiles } from '../hooks/useMediaFiles';

class SpreadsheetModel {
  data: any[][] = [];
  columns: string[] = [];
  mediaFiles: string[] = [];
  
  constructor() {
    makeAutoObservable(this);
  }

  // Call this when your spreadsheet data loads
  setData(data: any[][], columns: string[]) {
    this.data = data;
    this.columns = columns;
    this.extractMediaFiles();
  }

  extractMediaFiles() {
    const urlColIndex = this.columns.findIndex(col => col === 'PATH');
    if (urlColIndex === -1) return;

    this.mediaFiles = this.data
      .map(row => row[urlColIndex])
      .filter(url => url && typeof url === 'string')
      .map(url => `${MEDIA_ROOT}/${url}`);
  }

  showMediaViewer() {
    return this.mediaFiles;
  }
}

export default SpreadsheetModel;