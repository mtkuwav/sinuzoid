import React, { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { FiMoreVertical, FiEdit, FiTrash2, FiPlay } from 'react-icons/fi';
import { Playlist } from '../../types/playlist';
import { usePlaylistUtils } from '../../hooks/usePlaylist';
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
    if (onPlay && playlist.tracks.length > 0) {
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
    <div 
      className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 transition-all duration-200 hover:shadow-lg cursor-pointer group relative"
    >
      <Link 
        to={`/playlists/${encodeURIComponent(playlist.id)}`}
        className="block"
      >
        {/* Cover Image */}
        <div className="relative aspect-square overflow-hidden rounded-t-lg">
          <div className="w-full h-full bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 dark:from-cyan-500 dark:via-blue-600 dark:to-purple-700 flex items-center justify-center">
            <div className="text-center px-4">
              <LogoIcon className="w-16 h-16 mx-auto mb-3 fill-white opacity-90 drop-shadow-md" />
              <div className="text-white opacity-90 text-sm font-medium tracking-wide line-clamp-2 leading-tight">
                {playlist.name}
              </div>
            </div>
          </div>
            
          {/* Overlay with play button - similar to AlbumCard */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
            <button
              onClick={handlePlayClick}
              className="w-12 h-12 bg-white/90 hover:bg-white text-black rounded-full flex items-center justify-center transition-all duration-200 transform scale-90 hover:scale-100"
            >
              <FiPlay className="w-6 h-6 ml-1" />
            </button>
          </div>

          {/* Badge with track count */}
          <div className="absolute top-2 right-2">
            <span className="px-2 py-1 bg-black/60 text-white rounded text-xs font-medium backdrop-blur-sm">
              {stats.totalTracks} titre{stats.totalTracks !== 1 ? 's' : ''}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="font-semibold text-gray-800 dark:text-white text-lg truncate mb-1">
            {playlist.name}
          </h3>

          {playlist.description && (
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">
              {playlist.description}
            </p>
          )}

          <div className="text-sm text-gray-500 dark:text-gray-400">
            <span>{stats.totalDuration}</span>
          </div>
        </div>
      </Link>

      {/* Menu button - positioned like in AlbumCard */}
      <div className="absolute top-2 left-2 z-[100000]">
        <button
          onClick={handleMenuClick}
          className="p-1.5 bg-black/60 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 backdrop-blur-sm hover:bg-black/80"
        >
          <FiMoreVertical className="w-4 h-4" />
        </button>
      </div>

      {/* Dropdown menu - positioned independently to avoid clipping */}
      {showMenu && (
        <div className="absolute top-12 left-2 bg-white dark:bg-gray-700 rounded-md shadow-lg border border-gray-200 dark:border-gray-600 z-50 min-w-[120px]">
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
