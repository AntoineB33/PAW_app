import { useMediaFiles } from './hooks/useMediaFiles';
import MediaViewer from './components/MediaViewer';
import Spreadsheet from './components/Spreadsheet';
import spreadsheetModel from './models/SpreadsheetModel';

function App() {
  const { 
    isViewerOpen, 
    mediaPaths, 
    closeViewer, 
    showMediaViewer,
    currentMediaIndex,
    setCurrentMediaIndex
  } = useMediaFiles();

  const handleShowMedia = () => {
    const mediaFiles = spreadsheetModel.showMediaViewer();
    showMediaViewer(mediaFiles);
  };

  return (
    <div className="App">
      <Spreadsheet />
      
      <button 
        onClick={handleShowMedia}
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          padding: '10px 20px',
          zIndex: 100
        }}
      >
        Show Media
      </button>
      
      {isViewerOpen && (
        <MediaViewer 
          mediaPaths={mediaPaths}
          onClose={closeViewer}
        />
      )}
    </div>
  );
}

export default App;