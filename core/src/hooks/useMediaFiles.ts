import { useState, useEffect } from 'react';
import { Filesystem, Directory } from '@capacitor/filesystem';

export const useMediaFiles = () => {
  const [mediaPaths, setMediaPaths] = useState<string[]>([]);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);

  const showMediaViewer = async (paths: string[]) => {
    // Convert file URIs for native platforms
    const convertedPaths = await Promise.all(
      paths.map(async path => {
        if (path.startsWith('file://')) {
          const file = await Filesystem.stat({ path, directory: Directory.Data });
          return file.uri;
        }
        return path;
      })
    );
    
    setMediaPaths(convertedPaths);
    setCurrentMediaIndex(0);
    setIsViewerOpen(true);
  };

  return {
    mediaPaths,
    isViewerOpen,
    currentMediaIndex,
    showMediaViewer,
    closeViewer: () => setIsViewerOpen(false),
    setCurrentMediaIndex
  };
};