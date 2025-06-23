import { useState } from 'react';
import { trackApi } from '../services/trackApi';
import { Track } from './useTracks';

interface DownloadState {
  isDownloading: boolean;
  error: string | null;
  progress?: number;
  currentTask?: string;
}

export const useDownload = () => {
  const [downloadState, setDownloadState] = useState<DownloadState>({
    isDownloading: false,
    error: null
  });

  const downloadTrack = async (track: Track) => {
    setDownloadState({ isDownloading: true, error: null });
    
    try {
      const filename = trackApi.getTrackFilename(track);
      const { blob, originalFilename } = await trackApi.downloadTrack(filename);
      
      // Use the original filename from server headers (preferred) or fallback to server filename
      const downloadName = originalFilename || filename;
      trackApi.triggerDownload(blob, downloadName);
      
      setDownloadState({ isDownloading: false, error: null });
    } catch (error) {
      console.error('Error downloading track:', error);
      setDownloadState({ 
        isDownloading: false, 
        error: error instanceof Error ? error.message : 'Failed to download track'
      });
    }
  };

  const downloadAlbum = async (albumName: string) => {
    setDownloadState({ isDownloading: true, error: null, currentTask: 'Preparing album download...' });
    
    try {
      const blob = await trackApi.downloadAlbum(albumName);
      const filename = `${albumName}.zip`;
      trackApi.triggerDownload(blob, filename);
      
      setDownloadState({ isDownloading: false, error: null });
    } catch (error) {
      console.error('Error downloading album:', error);
      setDownloadState({ 
        isDownloading: false, 
        error: error instanceof Error ? error.message : 'Failed to download album'
      });
    }
  };

  const downloadPlaylist = async (playlistId: number | string, playlistName: string) => {
    setDownloadState({ isDownloading: true, error: null, currentTask: 'Preparing playlist download...' });
    
    try {
      const blob = await trackApi.downloadPlaylist(playlistId);
      const filename = `${playlistName}.zip`;
      trackApi.triggerDownload(blob, filename);
      
      setDownloadState({ isDownloading: false, error: null });
    } catch (error) {
      console.error('Error downloading playlist:', error);
      setDownloadState({ 
        isDownloading: false, 
        error: error instanceof Error ? error.message : 'Failed to download playlist'
      });
    }
  };

  const downloadAllTracks = async () => {
    setDownloadState({ isDownloading: true, error: null, currentTask: 'Preparing complete library download...' });
    
    try {
      const blob = await trackApi.downloadAllTracks();
      const filename = `all_tracks_${new Date().toISOString().split('T')[0]}.zip`;
      trackApi.triggerDownload(blob, filename);
      
      setDownloadState({ isDownloading: false, error: null });
    } catch (error) {
      console.error('Error downloading all tracks:', error);
      setDownloadState({ 
        isDownloading: false, 
        error: error instanceof Error ? error.message : 'Failed to download all tracks'
      });
    }
  };

  return {
    downloadState,
    downloadTrack,
    downloadAlbum,
    downloadPlaylist,
    downloadAllTracks
  };
};
