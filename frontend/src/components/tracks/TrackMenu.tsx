import React, { useState, useRef, useEffect } from 'react';
import { FiMoreHorizontal, FiTrash2, FiPlus } from 'react-icons/fi';
import { Track } from '../../hooks/useTracks';
import { DeleteTrackModal } from '../tracks';
import { AddToPlaylistModal } from '../playlists';
import { useMusicDeletion } from '../../hooks';

interface TrackMenuProps {
  track: Track;
  showAddToPlaylist?: boolean;
  onTrackDeleted?: () => void;
}

const TrackMenu: React.FC<TrackMenuProps> = ({ 
  track, 
  showAddToPlaylist = true,
  onTrackDeleted 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAddToPlaylistModal, setShowAddToPlaylistModal] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState<'bottom' | 'top'>('bottom');
  const menuRef = useRef<HTMLDivElement>(null);
  const { handleTrackDeleted } = useMusicDeletion();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const calculateDropdownPosition = () => {
    if (menuRef.current) {
      const rect = menuRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const dropdownHeight = 120; // Approximate height of dropdown
      
      // If dropdown would go below viewport, position it above
      if (rect.bottom + dropdownHeight > windowHeight) {
        setDropdownPosition('top');
      } else {
        setDropdownPosition('bottom');
      }
    }
  };

  const handleDeleteSuccess = () => {
    handleTrackDeleted(track.id);
    setShowDeleteModal(false);
    setIsOpen(false);
    if (onTrackDeleted) {
      onTrackDeleted();
    }
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteModal(true);
    setIsOpen(false);
  };

  const handleAddToPlaylistClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowAddToPlaylistModal(true);
    setIsOpen(false);
  };

  const toggleMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isOpen) {
      calculateDropdownPosition();
    }
    setIsOpen(!isOpen);
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={toggleMenu}
        className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
      >
        <FiMoreHorizontal className="w-4 h-4" />
      </button>

      {isOpen && (
        <div className={`absolute right-0 ${dropdownPosition === 'top' ? 'bottom-8 mb-1' : 'top-8 mt-1'} w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-[9999]`}>
          {showAddToPlaylist && (
            <button
              onClick={handleAddToPlaylistClick}
              className="w-full px-4 py-2 text-sm text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
            >
              <FiPlus className="w-4 h-4 mr-3" />
              Ajouter à une playlist
            </button>
          )}
          <button
            onClick={handleDeleteClick}
            className="w-full px-4 py-2 text-sm text-left text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center"
          >
            <FiTrash2 className="w-4 h-4 mr-3" />
            Supprimer
          </button>
        </div>
      )}

      {/* Delete Modal */}
      <DeleteTrackModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        track={track}
        onSuccess={handleDeleteSuccess}
      />

      {/* Add to Playlist Modal */}
      {showAddToPlaylist && (
        <AddToPlaylistModal
          isOpen={showAddToPlaylistModal}
          onClose={() => setShowAddToPlaylistModal(false)}
          track={track}
        />
      )}
    </div>
  );
};

export default TrackMenu;
