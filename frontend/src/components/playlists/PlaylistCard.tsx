import React, { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { FiMusic, FiMoreVertical, FiPlay, FiEdit, FiTrash2 } from 'react-icons/fi';
import { Playlist } from '../../types/playlist';
import { usePlaylistUtils } from '../../hooks/usePlaylist';
import { useMusicImages } from '../../hooks/useMusicStore';
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
  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const { calculatePlaylistStats, getPlaylistCoverUrl } = usePlaylistUtils();
  const { getThumbnailUrl } = useMusicImages();

  const stats = calculatePlaylistStats(playlist);

  useEffect(() => {
    const loadCover = async () => {
      const coverPath = getPlaylistCoverUrl(playlist);
      if (coverPath) {
        const url = await getThumbnailUrl(coverPath);
        setCoverUrl(url);
      }
    };
    loadCover();
  }, [playlist, getThumbnailUrl, getPlaylistCoverUrl]);

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
        className="block bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 hover:shadow-lg dark:hover:shadow-xl transition-all duration-200 overflow-hidden"
      >
        {/* Cover Image */}
        <div className="relative h-48 bg-gradient-to-br from-blue-500 to-purple-600 dark:from-blue-600 dark:to-purple-700 flex items-center justify-center">
          {coverUrl ? (
            <img
              src={coverUrl}
              alt={playlist.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="text-center">
              <LogoIcon className="w-12 h-12 mx-auto mb-2 fill-white opacity-50" />
              <FiMusic className="w-8 h-8 mx-auto text-white opacity-50" />
            </div>
          )}
          
          {/* Play button overlay */}
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
            <Button
              variant="primary"
              size="sm"
              className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 transform scale-90 group-hover:scale-100"
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
            
            {/* Menu button */}
            <div className="relative">
              <button
                onClick={handleMenuClick}
                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 opacity-0 group-hover:opacity-100 transition-all duration-200"
              >
                <FiMoreVertical className="w-4 h-4" />
              </button>
              
              {/* Dropdown menu */}
              {showMenu && (
                <div className="absolute right-0 top-full mt-1 bg-white dark:bg-gray-700 rounded-md shadow-lg border border-gray-200 dark:border-gray-600 z-10 min-w-[120px]">
                  <button
                    onClick={handleEdit}
                    className="w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center"
                  >
                    <FiEdit className="w-3 h-3 mr-2" />
                    Modifier
                  </button>
                  <button
                    onClick={handleDelete}
                    className="w-full px-3 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center"
                  >
                    <FiTrash2 className="w-3 h-3 mr-2" />
                    Supprimer
                  </button>
                </div>
              )}
            </div>
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

      {/* Close menu when clicking outside */}
      {showMenu && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setShowMenu(false)}
        />
      )}
    </div>
  );
};

export default PlaylistCard;
