import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { FiMusic, FiClock, FiHardDrive, FiPlay } from 'react-icons/fi';
import { Track, Album } from '../../hooks/useTracks';
import { useMusicImages } from '../../hooks/useMusicStore';

interface AlbumCardProps {
  album: Album;
  formatFileSize: (bytes: number) => string;
  onTrackPlay?: (track: Track) => void;
}

const AlbumCard: React.FC<AlbumCardProps> = ({
  album,
  formatFileSize,
  onTrackPlay
}) => {
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const navigate = useNavigate();
  const { getThumbnailUrl } = useMusicImages();
  
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

  const getMainCodec = () => {
    // Get the most common file type in the album
    const codecCounts = album.tracks.reduce((acc, track) => {
      const codec = track.file_type.toUpperCase();
      acc[codec] = (acc[codec] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(codecCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'UNKNOWN';
  };

  const handleAlbumClick = () => {
    navigate(`/album/${encodeURIComponent(album.name)}`);
  };
  
  return (
    <div 
      className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden transition-all duration-200 hover:shadow-lg cursor-pointer group"
      onClick={handleAlbumClick}
    >
      {/* Album cover */}
      <div className="relative aspect-square overflow-hidden">
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt={`Pochette de ${album.name}`}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
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
          <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center">
            <FiMusic className="w-12 h-12 text-gray-400 dark:text-gray-500 fallback-icon" />
          </div>
        )}
        <FiMusic className="w-12 h-12 text-gray-400 dark:text-gray-500 fallback-icon hidden absolute inset-0 m-auto" />
        
        {/* Overlay with play button */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (album.tracks.length > 0) {
                onTrackPlay?.(album.tracks[0]);
              }
            }}
            className="w-12 h-12 bg-white/90 hover:bg-white text-black rounded-full flex items-center justify-center transition-all duration-200 transform scale-90 hover:scale-100"
          >
            <FiPlay className="w-6 h-6 ml-1" />
          </button>
        </div>

        {/* Codec badge */}
        <div className="absolute top-2 right-2">
          <span className="px-2 py-1 bg-black/60 text-white rounded text-xs font-medium backdrop-blur-sm">
            {getMainCodec()}
          </span>
        </div>
      </div>

      {/* Album info */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-800 dark:text-white truncate mb-1">
          {album.name}
        </h3>
        {album.artist && (
          <p className="text-sm text-gray-600 dark:text-gray-300 truncate mb-3">
            {album.artist}
          </p>
        )}
        
        {/* Album stats */}
        <div className="space-y-1 text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center justify-between">
            <span className="flex items-center">
              <FiMusic className="w-3 h-3 mr-1" />
              {album.tracks.length} titre{album.tracks.length > 1 ? 's' : ''}
            </span>
            {album.year && <span>{album.year}</span>}
          </div>
          <div className="flex items-center justify-between">
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
  );
};

export default AlbumCard;
