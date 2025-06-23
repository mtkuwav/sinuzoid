import React from 'react';
import { FiDownload, FiLoader } from 'react-icons/fi';
import { useDownload } from '../hooks/useDownload';
import { Track } from '../hooks/useTracks';

interface DownloadButtonProps {
  variant: 'track' | 'album' | 'playlist' | 'all';
  track?: Track;
  albumName?: string;
  playlistId?: number | string;
  playlistName?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const DownloadButton: React.FC<DownloadButtonProps> = ({
  variant,
  track,
  albumName,
  playlistId,
  playlistName,
  className = '',
  size = 'md'
}) => {
  const { downloadState, downloadTrack, downloadAlbum, downloadPlaylist, downloadAllTracks } = useDownload();

  const handleDownload = async () => {
    switch (variant) {
      case 'track':
        if (track) {
          await downloadTrack(track);
        }
        break;
      case 'album':
        if (albumName) {
          await downloadAlbum(albumName);
        }
        break;
      case 'playlist':
        if (playlistId && playlistName) {
          await downloadPlaylist(playlistId, playlistName);
        }
        break;
      case 'all':
        await downloadAllTracks();
        break;
    }
  };

  const getButtonText = () => {
    switch (variant) {
      case 'track':
        return 'Download Track';
      case 'album':
        return 'Download Album';
      case 'playlist':
        return 'Download Playlist';
      case 'all':
        return 'Download All';
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'px-2 py-1 text-xs';
      case 'md':
        return 'px-3 py-2 text-sm';
      case 'lg':
        return 'px-4 py-2 text-base';
    }
  };

  const getIconSize = () => {
    switch (size) {
      case 'sm':
        return 14;
      case 'md':
        return 16;
      case 'lg':
        return 18;
    }
  };

  return (
    <div className="flex flex-col">
      <button
        onClick={handleDownload}
        disabled={downloadState.isDownloading}
        className={`
          flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 
          text-white font-medium rounded-lg transition-colors duration-200
          ${getSizeClasses()} ${className}
        `}
        title={downloadState.currentTask || getButtonText()}
      >
        {downloadState.isDownloading ? (
          <FiLoader size={getIconSize()} className="animate-spin" />
        ) : (
          <FiDownload size={getIconSize()} />
        )}
        <span className="hidden sm:inline">
          {downloadState.isDownloading && downloadState.currentTask 
            ? downloadState.currentTask 
            : getButtonText()
          }
        </span>
      </button>
      
      {downloadState.error && (
        <div className="mt-1 text-xs text-red-600 max-w-xs">
          {downloadState.error}
        </div>
      )}
    </div>
  );
};

// Composant simple pour juste l'icône de téléchargement
interface DownloadIconButtonProps {
  variant: 'track' | 'album' | 'playlist' | 'all';
  track?: Track;
  albumName?: string;
  playlistId?: number | string;
  playlistName?: string;
  className?: string;
}

export const DownloadIconButton: React.FC<DownloadIconButtonProps> = ({
  variant,
  track,
  albumName,
  playlistId,
  playlistName,
  className = ''
}) => {
  const { downloadState, downloadTrack, downloadAlbum, downloadPlaylist, downloadAllTracks } = useDownload();

  const handleDownload = async () => {
    switch (variant) {
      case 'track':
        if (track) {
          await downloadTrack(track);
        }
        break;
      case 'album':
        if (albumName) {
          await downloadAlbum(albumName);
        }
        break;
      case 'playlist':
        if (playlistId && playlistName) {
          await downloadPlaylist(playlistId, playlistName);
        }
        break;
      case 'all':
        await downloadAllTracks();
        break;
    }
  };

  const getTooltipText = () => {
    switch (variant) {
      case 'track':
        return 'Download this track';
      case 'album':
        return 'Download album';
      case 'playlist':
        return 'Download playlist';
      case 'all':
        return 'Download all tracks';
    }
  };

  return (
    <button
      onClick={handleDownload}
      disabled={downloadState.isDownloading}
      className={`
        p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 
        transition-colors duration-200 disabled:opacity-50
        ${className}
      `}
      title={getTooltipText()}
    >
      {downloadState.isDownloading ? (
        <FiLoader size={16} className="animate-spin text-blue-600" />
      ) : (
        <FiDownload size={16} className="text-gray-600 dark:text-gray-400 hover:text-blue-600" />
      )}
    </button>
  );
};
