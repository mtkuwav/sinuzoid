import React, { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { FiMoreVertical, FiEdit, FiTrash2, FiPlay } from 'react-icons/fi';
import { Playlist } from '../../types/playlist';
import { usePlaylistUtils } from '../../hooks/usePlaylist';
import { Button } from '../ui';
import LogoIcon from '../../assets/logos/logo_sinuzoid-cyan.svg?react';

interface PlaylistCardProps {
  playlist: Playlist;
  onEdit?: (playlist: Playlist) => void;
  onDelete?: (playlist: Playlist) => void;
  onPlay?: (playlist: Playlist) => void;
}

const PlaylistCard: React.FC<PlaylistCardProps> = ({
  playlist,
  onEdit,
  onDelete,
  onPlay
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const { calculatePlaylistStats } = usePlaylistUtils();

  const stats = calculatePlaylistStats(playlist);

  const handlePlayClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onPlay) {
      onPlay(playlist);
    }
  };

  const handleMenuClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowMenu(!showMenu);
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      if (showMenu) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showMenu]);

  const handleEdit = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowMenu(false);
    if (onEdit) {
      onEdit(playlist);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowMenu(false);
    if (onDelete) {
      onDelete(playlist);
    }
  };

  return (
    <div className="group relative">
      <Link 
        to={`/playlists/${encodeURIComponent(playlist.id)}`}
        className="block bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 hover:shadow-lg dark:hover:shadow-xl transition-all duration-200"
      >
        {/* Cover Image */}
        <div className="relative aspect-square overflow-hidden rounded-t-lg">
          <div className="w-full h-full bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 dark:from-cyan-500 dark:via-blue-600 dark:to-purple-700 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
            <div className="text-center px-4">
              <LogoIcon className="w-16 h-16 mx-auto mb-3 fill-white opacity-90 drop-shadow-md" />
              <div className="text-white opacity-90 text-sm font-medium tracking-wide line-clamp-2 leading-tight">
                {playlist.name}
              </div>
            </div>
            
            {/* Play button - positioned in bottom right corner */}
            <Button
              variant="primary"
              size="sm"
              className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-200 transform translate-y-2 group-hover:translate-y-0 shadow-lg"
              onClick={handlePlayClick}
            >
              <FiPlay className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-semibold text-gray-800 dark:text-white text-lg truncate pr-2">
              {playlist.name}
            </h3>
          </div>

          {playlist.description && (
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">
              {playlist.description}
            </p>
          )}

          <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
            <span>{stats.totalTracks} titre{stats.totalTracks !== 1 ? 's' : ''}</span>
            <span>{stats.totalDuration}</span>
          </div>
        </div>
      </Link>

      {/* Menu button - positioned outside of Link */}
      <div className="absolute top-4 right-4 z-30">
        <button
          onClick={handleMenuClick}
          className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 opacity-0 group-hover:opacity-100 transition-all duration-200 bg-opacity-50 rounded-full"
        >
          <FiMoreVertical className="w-4 h-4" />
        </button>
      </div>

      {/* Dropdown menu - positioned independently to avoid clipping */}
      {showMenu && (
        <div className="absolute top-12 right-4 bg-white dark:bg-gray-700 rounded-md shadow-lg border border-gray-200 dark:border-gray-600 z-50 min-w-[120px]">
          <button
            onClick={handleEdit}
            className="w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center rounded-t-md"
          >
            <FiEdit className="w-3 h-3 mr-2" />
            Modifier
          </button>
          <button
            onClick={handleDelete}
            className="w-full px-3 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center rounded-b-md"
          >
            <FiTrash2 className="w-3 h-3 mr-2" />
            Supprimer
          </button>
        </div>
      )}

      {/* Close menu when clicking outside */}
      {showMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={(e) => {
            e.stopPropagation();
            setShowMenu(false);
          }}
        />
      )}
    </div>
  );
};

export default PlaylistCard;
