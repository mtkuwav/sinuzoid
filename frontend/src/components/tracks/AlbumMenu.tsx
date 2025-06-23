import React, { useState, useRef, useEffect } from 'react';
import { FiMoreHorizontal, FiTrash2, FiMusic, FiDownload } from 'react-icons/fi';
import { Album } from '../../hooks/useTracks';
import { DeleteAlbumModal } from '../tracks';
import { useDownload } from '../../hooks/useDownload';
import { useMusicDeletion } from '../../hooks';

interface AlbumMenuProps {
  album: Album;
  onAlbumDeleted?: () => void;
  alignLeft?: boolean;
}

const AlbumMenu: React.FC<AlbumMenuProps> = ({ 
  album, 
  onAlbumDeleted,
  alignLeft = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState<'bottom' | 'top'>('bottom');
  const menuRef = useRef<HTMLDivElement>(null);
  const { handleAlbumDeleted } = useMusicDeletion();
  const { downloadAlbum } = useDownload();

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
    handleAlbumDeleted(album.name);
    setShowDeleteModal(false);
    setIsOpen(false);
    if (onAlbumDeleted) {
      onAlbumDeleted();
    }
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowDeleteModal(true);
    setIsOpen(false);
  };

  const handleDownloadClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await downloadAlbum(album.name);
      setIsOpen(false);
    } catch (error) {
      console.error('Download failed:', error);
      // The error will be shown by the useDownload hook
    }
  };

  const toggleMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isOpen) {
      calculateDropdownPosition();
    }
    setIsOpen(!isOpen);
  };

  // Don't show delete option for the "Singles and miscellaneous tracks" album
  if (album.name === 'Singles and miscellaneous tracks') {
    return null;
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={toggleMenu}
        className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 opacity-0 group-hover:opacity-100 transition-all duration-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
      >
        <FiMoreHorizontal className="w-5 h-5" />
      </button>

      {isOpen && (
        <div className={`absolute ${alignLeft ? 'left-0' : 'right-0'} ${dropdownPosition === 'top' ? 'bottom-10 mb-1' : 'top-10 mt-1'} w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-[99999]`}>
          <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
              <FiMusic className="w-3 h-3 mr-2" />
              {album.tracks.length} titre{album.tracks.length !== 1 ? 's' : ''}
            </div>
          </div>
          <button
            onClick={handleDownloadClick}
            className="w-full px-4 py-2 text-sm text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
          >
            <FiDownload className="w-4 h-4 mr-3" />
            Télécharger l'album
          </button>
          <button
            onClick={handleDeleteClick}
            className="w-full px-4 py-2 text-sm text-left text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center"
          >
            <FiTrash2 className="w-4 h-4 mr-3" />
            Supprimer l'album
          </button>
        </div>
      )}

      {/* Delete Modal */}
      <DeleteAlbumModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        album={album}
        onSuccess={handleDeleteSuccess}
      />
    </div>
  );
};

export default AlbumMenu;
