import React, { useState, useEffect } from 'react';
import { FiMusic, FiClock, FiHardDrive, FiPlay } from 'react-icons/fi';
import { Track, Album } from '../../hooks/useTracks';

interface AlbumCardProps {
  album: Album;
  getThumbnailUrl: (thumbnailPath?: string) => Promise<string | null>;
  formatDuration: (duration: string) => string;
  formatFileSize: (bytes: number) => string;
  onTrackPlay?: (track: Track) => void;
}

const AlbumCard: React.FC<AlbumCardProps> = ({
  album,
  getThumbnailUrl,
  formatDuration,
  formatFileSize,
  onTrackPlay
}) => {
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  
  useEffect(() => {
    const loadThumbnail = async () => {
      if (album.cover_thumbnail_path) {
        const url = await getThumbnailUrl(album.cover_thumbnail_path);
        setThumbnailUrl(url);
      }
    };
    
    loadThumbnail();
  }, [album.cover_thumbnail_path, getThumbnailUrl]);
  const totalDuration = album.tracks.reduce((total, track) => {
    // Handle both ISO 8601 (PT3M45S) and standard (MM:SS) formats
    if (track.duration.startsWith('PT') || track.duration.startsWith('P')) {
      const regex = /PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+(?:\.\d+)?)S)?/;
      const match = track.duration.match(regex);
      
      if (match) {
        const hours = parseInt(match[1] || '0');
        const minutes = parseInt(match[2] || '0');
        const seconds = Math.floor(parseFloat(match[3] || '0'));
        return total + (hours * 3600) + (minutes * 60) + seconds;
      }
    } else {
      // Standard format
      const parts = track.duration.split(':');
      let seconds = 0;
      if (parts.length === 3) {
        seconds = parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + parseInt(parts[2]);
      } else if (parts.length === 2) {
        seconds = parseInt(parts[0]) * 60 + parseInt(parts[1]);
      }
      return total + seconds;
    }
    return total;
  }, 0);

  const formatTotalDuration = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}min`;
    } else {
      return `${minutes}min`;
    }
  };

  const totalSize = album.tracks.reduce((total, track) => total + track.file_size, 0);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden transition-all duration-200 hover:shadow-lg">
      {/* Header de l'album */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-start space-x-4">
          {/* Pochette de l'album */}
          <div className="flex-shrink-0">
            <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
              {thumbnailUrl ? (
                <img
                  src={thumbnailUrl}
                  alt={`Pochette de ${album.name}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    const parent = e.currentTarget.parentElement;
                    if (parent) {
                      const icon = parent.querySelector('.fallback-icon');
                      if (icon) icon.classList.remove('hidden');
                    }
                  }}
                />
              ) : (
                <FiMusic className="w-8 h-8 text-gray-400 dark:text-gray-500 fallback-icon" />
              )}
              <FiMusic className="w-8 h-8 text-gray-400 dark:text-gray-500 fallback-icon hidden" />
            </div>
          </div>

          {/* Informations de l'album */}
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white truncate">
              {album.name}
            </h3>
            {album.artist && (
              <p className="text-gray-600 dark:text-gray-300 text-sm truncate">
                {album.artist}
              </p>
            )}
            <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
              {album.year && (
                <span>{album.year}</span>
              )}
              <span className="flex items-center">
                <FiMusic className="w-3 h-3 mr-1" />
                {album.tracks.length} titre{album.tracks.length > 1 ? 's' : ''}
              </span>
              <span className="flex items-center">
                <FiClock className="w-3 h-3 mr-1" />
                {formatTotalDuration(totalDuration)}
              </span>
              <span className="flex items-center">
                <FiHardDrive className="w-3 h-3 mr-1" />
                {formatFileSize(totalSize)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Liste des tracks */}
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {album.tracks.map((track, index) => (
          <div
            key={track.id}
            className="p-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 group"
          >
            <div className="flex items-center space-x-3">
              {/* Numéro de piste ou bouton play */}
              <div className="w-8 h-8 flex items-center justify-center flex-shrink-0">
                <span className="text-sm text-gray-500 dark:text-gray-400 group-hover:hidden">
                  {track.metadata?.track_number || index + 1}
                </span>
                <button
                  onClick={() => onTrackPlay?.(track)}
                  className="w-6 h-6 hidden group-hover:flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-colors duration-200"
                >
                  <FiPlay className="w-3 h-3 ml-0.5" />
                </button>
              </div>

              {/* Titre et artiste */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 dark:text-white truncate">
                  {track.metadata?.title || track.original_filename.replace(/\.[^/.]+$/, "")}
                </p>
                {track.metadata?.artist && track.metadata.artist !== album.artist && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {track.metadata.artist}
                  </p>
                )}
              </div>

              {/* Durée */}
              <div className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">
                {formatDuration(track.duration)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AlbumCard;
