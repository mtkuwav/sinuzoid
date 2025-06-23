import React from 'react';
import { useMusicStore } from '../../store/musicStore';

/**
 * Composant de débogage pour visualiser l'état du store en développement
 */
const MusicStoreDebugger: React.FC = () => {
  const store = useMusicStore();

  // N'afficher qu'en développement
  if (import.meta.env.PROD) {
    return null;
  }

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  const getCacheStats = () => {
    const thumbnailCount = Object.keys(store.thumbnailCache).length;
    const coverCount = Object.keys(store.coverCache).length;
    const lastFetchFormatted = store.lastFetch ? formatTimestamp(store.lastFetch) : 'Jamais';
    
    return {
      thumbnailCount,
      coverCount,
      lastFetchFormatted
    };
  };

  const stats = getCacheStats();

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white p-4 rounded-lg text-xs font-mono max-w-xs z-50">
      <div className="font-bold mb-2">🎵 Music Store Debug</div>
      <div className="space-y-1">
        <div>Tracks: {store.tracks.length}</div>
        <div>Albums: {store.albums.length}</div>
        <div>Loading: {store.isLoading ? '✓' : '✗'}</div>
        <div>Error: {store.error ? '✗' : '✓'}</div>
        <div>Last fetch: {stats.lastFetchFormatted}</div>
        <div>Thumbnails: {stats.thumbnailCount}</div>
        <div>Covers: {stats.coverCount}</div>
        <div>Should refetch: {store.shouldRefetch() ? '✓' : '✗'}</div>
      </div>
      <div className="mt-2 pt-2 border-t border-gray-500">
        <button
          onClick={() => store.clearCache()}
          className="text-xs bg-red-600 hover:bg-red-700 px-2 py-1 rounded"
        >
          Clear Cache
        </button>
        <button
          onClick={() => store.forceFetch()}
          className="text-xs bg-blue-600 hover:bg-blue-700 px-2 py-1 rounded ml-2"
        >
          Force Fetch
        </button>
      </div>
    </div>
  );
};

export default MusicStoreDebugger;
