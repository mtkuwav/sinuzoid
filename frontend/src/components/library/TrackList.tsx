import React, { useState, useEffect } from 'react';
import { FiMusic, FiUser, FiCalendar, FiPlay, FiMoreVertical } from 'react-icons/fi';
import { Track } from '../../hooks/useTracks';

interface TrackListProps {
  tracks: Track[];
  getThumbnailUrl: (thumbnailPath?: string) => Promise<string | null>;
  formatDuration: (duration: string) => string;
  onTrackPlay?: (track: Track) => void;
}

const TrackItem: React.FC<{
  track: Track;
  index: number;
  getThumbnailUrl: (thumbnailPath?: string) => Promise<string | null>;
  formatDuration: (duration: string) => string;
  onTrackPlay?: (track: Track) => void;
}> = ({ track, index, getThumbnailUrl, formatDuration, onTrackPlay }) => {
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  
  useEffect(() => {
    const loadThumbnail = async () => {
      if (track.cover_thumbnail_path) {
        const url = await getThumbnailUrl(track.cover_thumbnail_path);
        setThumbnailUrl(url);
      }
    };
    
    loadThumbnail();
  }, [track.cover_thumbnail_path, getThumbnailUrl]);

  return (
    <div className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 group">
      <div className="grid grid-cols-12 gap-4 items-center">
        {/* Index/Play button */}
        <div className="col-span-1">
          <div className="w-8 h-8 flex items-center justify-center">
            <span className="text-sm text-gray-500 dark:text-gray-400 group-hover:hidden">
              {index + 1}
            </span>
            <button
              onClick={() => onTrackPlay?.(track)}
              className="w-6 h-6 hidden group-hover:flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-colors duration-200"
            >
              <FiPlay className="w-3 h-3 ml-0.5" />
            </button>
          </div>
        </div>

        {/* Titre et artiste */}
        <div className="col-span-5 flex items-center space-x-3 min-w-0">
          {/* Thumbnail */}
          <div className="w-10 h-10 rounded bg-gray-100 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
            {thumbnailUrl ? (
              <img
                src={thumbnailUrl}
                alt={`Pochette de ${track.metadata?.title || track.original_filename}`}
                className="w-full h-full object-cover rounded"
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
              <FiMusic className="w-4 h-4 text-gray-400 dark:text-gray-500 fallback-icon" />
            )}
            <FiMusic className="w-4 h-4 text-gray-400 dark:text-gray-500 fallback-icon hidden" />
          </div>

          {/* Info */}
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-800 dark:text-white truncate">
              {track.metadata?.title || track.original_filename.replace(/\.[^/.]+$/, "")}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate flex items-center">
              <FiUser className="w-3 h-3 mr-1" />
              {track.metadata?.artist || 'Artiste inconnu'}
            </p>
          </div>
        </div>

        {/* Album */}
        <div className="col-span-3 min-w-0">
          <p className="text-sm text-gray-600 dark:text-gray-300 truncate">
            {track.metadata?.album || 'Album inconnu'}
          </p>
          {track.metadata?.year && (
            <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
              <FiCalendar className="w-3 h-3 mr-1" />
              {track.metadata.year}
            </p>
          )}
        </div>

        {/* Durée */}
        <div className="col-span-2 text-sm text-gray-500 dark:text-gray-400">
          {formatDuration(track.duration)}
        </div>

        {/* Actions */}
        <div className="col-span-1 flex justify-end">
          <button className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <FiMoreVertical className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

const TrackList: React.FC<TrackListProps> = ({
  tracks,
  getThumbnailUrl,
  formatDuration,
  onTrackPlay
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
        <div className="grid grid-cols-12 gap-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          <div className="col-span-1">#</div>
          <div className="col-span-5">Titre</div>
          <div className="col-span-3">Album</div>
          <div className="col-span-2">Durée</div>
          <div className="col-span-1"></div>
        </div>
      </div>

      {/* Tracks */}
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {tracks.map((track, index) => (
          <TrackItem
            key={track.id}
            track={track}
            index={index}
            getThumbnailUrl={getThumbnailUrl}
            formatDuration={formatDuration}
            onTrackPlay={onTrackPlay}
          />
        ))}
      </div>

      {tracks.length === 0 && (
        <div className="p-8 text-center">
          <FiMusic className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">Aucun titre trouvé</p>
        </div>
      )}
    </div>
  );
};

export default TrackList;
