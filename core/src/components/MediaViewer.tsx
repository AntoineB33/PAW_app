import React, { useState, useEffect, useRef } from 'react';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { ScreenReader } from '@capacitor/screen-reader';
import { Keyboard } from '@capacitor/keyboard';

interface MediaViewerProps {
  mediaPaths: string[];
  onClose: () => void;
}

const VIDEO_EXTENSIONS = ['.mp4', '.mkv', '.avi', '.mov', '.flv', '.webm'];

const MediaViewer: React.FC<MediaViewerProps> = ({ mediaPaths, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [mediaType, setMediaType] = useState<'image' | 'video' | 'gif'>('image');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef(0);

  // Get file extension
  const getExtension = (path: string) => {
    return path.substring(path.lastIndexOf('.')).toLowerCase();
  };

  // Detect media type
  const detectMediaType = (path: string) => {
    const ext = getExtension(path);
    if (ext === '.gif') return 'gif';
    if (VIDEO_EXTENSIONS.includes(ext)) return 'video';
    return 'image';
  };

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowRight':
          setCurrentIndex(prev => Math.min(prev + 1, mediaPaths.length - 1));
          break;
        case 'ArrowLeft':
          setCurrentIndex(prev => Math.max(prev - 1, 0));
          break;
        case 'f':
          setIsFullscreen(!isFullscreen);
          break;
        case ' ':
          if (mediaType === 'video') {
            setIsPaused(!isPaused);
          }
          break;
        case '4': // 5s back
          if (videoRef.current) videoRef.current.currentTime -= 5;
          break;
        case '6': // 5s forward
          if (videoRef.current) videoRef.current.currentTime += 5;
          break;
        case '7': // 10s back
          if (videoRef.current) videoRef.current.currentTime -= 10;
          break;
        case '9': // 10s forward
          if (videoRef.current) videoRef.current.currentTime += 10;
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, mediaType, isFullscreen, mediaPaths.length]);

  // Handle mobile back button (Android)
  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      const backButtonListener = () => onClose();
      // @ts-ignore
      document.addEventListener('ionBackButton', backButtonListener);
      
      return () => {
        // @ts-ignore
        document.removeEventListener('ionBackButton', backButtonListener);
      };
    }
  }, [onClose]);

  // Handle media type changes
  useEffect(() => {
    setMediaType(detectMediaType(mediaPaths[currentIndex]));
    setIsPaused(false);
  }, [currentIndex, mediaPaths]);

  // Handle fullscreen
  useEffect(() => {
    const handleFullscreenChange = () => {
      // @ts-ignore
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  // Get correct media path
  const getMediaPath = () => {
    const path = mediaPaths[currentIndex];
    if (Capacitor.isNativePlatform()) {
      return Capacitor.convertFileSrc(path);
    }
    return path;
  };

  return (
    <div 
      ref={containerRef}
      className="media-viewer"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'black',
        zIndex: 1000,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}
    >
      {/* Media container */}
      <div className="media-container" style={{ maxWidth: '100%', maxHeight: '100%' }}>
        {mediaType === 'image' || mediaType === 'gif' ? (
          <img 
            src={getMediaPath()} 
            alt={`Media ${currentIndex + 1}`}
            style={{ maxWidth: '100%', maxHeight: '100vh', objectFit: 'contain' }}
          />
        ) : (
          <video
            ref={videoRef}
            src={getMediaPath()}
            autoPlay={!isPaused}
            controls={false}
            style={{ maxWidth: '100%', maxHeight: '100vh' }}
            onEnded={() => setCurrentIndex(prev => Math.min(prev + 1, mediaPaths.length - 1))}
          />
        )}
      </div>

      {/* Controls overlay */}
      <div style={{
        position: 'absolute',
        bottom: '20px',
        left: 0,
        right: 0,
        display: 'flex',
        justifyContent: 'center',
        gap: '10px',
        opacity: 0.7
      }}>
        <button 
          onClick={() => setCurrentIndex(prev => Math.max(prev - 1, 0))}
          className="control-button"
        >
          &larr; Prev
        </button>
        
        {mediaType === 'video' && (
          <button 
            onClick={() => setIsPaused(!isPaused)}
            className="control-button"
          >
            {isPaused ? '▶ Play' : '⏸ Pause'}
          </button>
        )}
        
        <button 
          onClick={toggleFullscreen}
          className="control-button"
        >
          {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
        </button>
        
        <button 
          onClick={() => setCurrentIndex(prev => Math.min(prev + 1, mediaPaths.length - 1))}
          className="control-button"
        >
          Next &rarr;
        </button>
        
        <button 
          onClick={onClose}
          className="control-button"
          style={{ backgroundColor: 'red' }}
        >
          Close
        </button>
      </div>

      {/* Position indicator */}
      <div style={{
        position: 'absolute',
        top: '20px',
        right: '20px',
        backgroundColor: 'rgba(0,0,0,0.5)',
        color: 'white',
        padding: '5px 10px',
        borderRadius: '5px'
      }}>
        {currentIndex + 1} / {mediaPaths.length}
      </div>
    </div>
  );
};

export default MediaViewer;