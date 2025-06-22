import React, { useState, useMemo, useRef, useEffect } from 'react';
import { FiSearch, FiX, FiMusic, FiDisc } from 'react-icons/fi';
import { useNavigate } from 'react-router';
import { useMusicData } from '../../hooks/useMusicStore';
import { Track, Album } from '../../hooks/useTracks';
import { Input } from '../ui';

interface GlobalSearchProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SearchResult {
  type: 'track' | 'album';
  item: Track | Album;
  matchType: 'title' | 'artist' | 'album' | 'genre';
}

const GlobalSearch: React.FC<GlobalSearchProps> = ({ isOpen, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const { tracks, albums } = useMusicData();
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Utility functions
  const getDisplayText = (result: SearchResult): string => {
    if (result.type === 'track') {
      const track = result.item as Track;
      return track.metadata?.title || track.original_filename;
    } else {
      const album = result.item as Album;
      return album.name;
    }
  };

  const getSecondaryText = (result: SearchResult): string => {
    if (result.type === 'track') {
      const track = result.item as Track;
      return track.metadata?.artist || 'Artiste inconnu';
    } else {
      const album = result.item as Album;
      return album.artist || 'Artiste inconnu';
    }
  };

  const getMatchTypeLabel = (matchType: SearchResult['matchType']): string => {
    switch (matchType) {
      case 'title': return 'Titre';
      case 'artist': return 'Artiste';
      case 'album': return 'Album';
      case 'genre': return 'Genre';
      default: return '';
    }
  };

  const handleResultClick = (result: SearchResult) => {
    if (result.type === 'track') {
      // Navigate to library with track selected
      navigate('/library', { 
        state: { 
          searchQuery: searchQuery,
          viewMode: 'tracks'
        }
      });
    } else {
      // Navigate to library with album view
      navigate('/library', { 
        state: { 
          searchQuery: searchQuery,
          viewMode: 'albums'
        }
      });
    }
    onClose();
    setSearchQuery('');
  };

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];

    const query = searchQuery.toLowerCase();
    const results: SearchResult[] = [];

    // Search in tracks
    tracks.forEach(track => {
      const matches: Array<{ type: SearchResult['matchType'], score: number }> = [];

      // Title match
      if (track.metadata?.title?.toLowerCase().includes(query)) {
        matches.push({ type: 'title', score: track.metadata.title.toLowerCase().indexOf(query) === 0 ? 10 : 5 });
      }
      if (track.original_filename.toLowerCase().includes(query)) {
        matches.push({ type: 'title', score: track.original_filename.toLowerCase().indexOf(query) === 0 ? 8 : 3 });
      }

      // Artist match
      if (track.metadata?.artist?.toLowerCase().includes(query)) {
        matches.push({ type: 'artist', score: track.metadata.artist.toLowerCase().indexOf(query) === 0 ? 9 : 4 });
      }

      // Album match
      if (track.metadata?.album?.toLowerCase().includes(query)) {
        matches.push({ type: 'album', score: track.metadata.album.toLowerCase().indexOf(query) === 0 ? 7 : 3 });
      }

      // Genre match
      if (track.metadata?.genre?.toLowerCase().includes(query)) {
        matches.push({ type: 'genre', score: 2 });
      }

      if (matches.length > 0) {
        const bestMatch = matches.sort((a, b) => b.score - a.score)[0];
        results.push({
          type: 'track',
          item: track,
          matchType: bestMatch.type
        });
      }
    });

    // Search in albums
    albums.forEach(album => {
      const matches: Array<{ type: SearchResult['matchType'], score: number }> = [];

      // Album name match
      if (album.name.toLowerCase().includes(query)) {
        matches.push({ type: 'album', score: album.name.toLowerCase().indexOf(query) === 0 ? 10 : 5 });
      }

      // Artist match
      if (album.artist?.toLowerCase().includes(query)) {
        matches.push({ type: 'artist', score: album.artist.toLowerCase().indexOf(query) === 0 ? 9 : 4 });
      }

      if (matches.length > 0) {
        const bestMatch = matches.sort((a, b) => b.score - a.score)[0];
        results.push({
          type: 'album',
          item: album,
          matchType: bestMatch.type
        });
      }
    });

    // Sort results by relevance and limit to 10
    return results
      .sort((a, b) => {
        // Prioritize exact matches at the beginning
        const aStartsWith = getDisplayText(a).toLowerCase().startsWith(query);
        const bStartsWith = getDisplayText(b).toLowerCase().startsWith(query);
        
        if (aStartsWith && !bStartsWith) return -1;
        if (!aStartsWith && bStartsWith) return 1;
        
        // Then by type (albums first, then tracks)
        if (a.type !== b.type) {
          return a.type === 'album' ? -1 : 1;
        }
        
        return 0;
      })
      .slice(0, 10);
  }, [searchQuery, tracks, albums]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => Math.min(prev + 1, searchResults.length - 1));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => Math.max(prev - 1, 0));
          break;
        case 'Enter':
          e.preventDefault();
          if (searchResults[selectedIndex]) {
            handleResultClick(searchResults[selectedIndex]);
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, searchResults, handleResultClick]);

  // Reset selected index when results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [searchResults]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[10000] bg-black/50 backdrop-blur-sm">
      <div className="container mx-auto px-4 pt-20">
        <div className="max-w-2xl mx-auto">
          {/* Search Input */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl border dark:border-gray-700 mb-4">
            <div className="relative">
              <Input
                ref={inputRef}
                type="text"
                placeholder="Rechercher des titres, albums, artistes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                leftIcon={<FiSearch className="h-5 w-5 text-gray-400" />}
                rightIcon={
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  >
                    <FiX className="h-5 w-5" />
                  </button>
                }
                variant="rounded"
                className="border-0 text-lg py-4"
              />
            </div>
          </div>

          {/* Results */}
          {searchQuery.trim() && (
            <div 
              ref={resultsRef}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-xl border dark:border-gray-700 max-h-96 overflow-y-auto"
            >
              {searchResults.length > 0 ? (
                <div className="py-2">
                  {searchResults.map((result, index) => (
                    <button
                      key={`${result.type}-${result.type === 'track' ? (result.item as Track).id : `${(result.item as Album).name}-${(result.item as Album).artist}`}`}
                      onClick={() => handleResultClick(result)}
                      className={`w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                        index === selectedIndex ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          {result.type === 'track' ? (
                            <FiMusic className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                          ) : (
                            <FiDisc className="h-5 w-5 text-green-600 dark:text-green-400" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                              {getDisplayText(result)}
                            </p>
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                              {getMatchTypeLabel(result.matchType)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                            {getSecondaryText(result)}
                          </p>
                        </div>
                        <div className="flex-shrink-0">
                          <span className="text-xs text-gray-400 dark:text-gray-500 uppercase font-medium">
                            {result.type === 'track' ? 'Titre' : 'Album'}
                          </span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="px-4 py-8 text-center">
                  <FiSearch className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500 dark:text-gray-400">Aucun résultat trouvé</p>
                  <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                    Essayez avec d'autres termes de recherche
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Quick help */}
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-400 dark:text-gray-500">
              Utilisez ↑↓ pour naviguer, Entrée pour sélectionner, Échap pour fermer
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GlobalSearch;
