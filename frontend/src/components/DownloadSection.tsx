import React from 'react';
import { DownloadButton } from './DownloadButton';
import { Track, Album } from '../hooks/useTracks';

interface DownloadSectionProps {
  tracks: Track[];
  albums: Album[];
  className?: string;
}

export const DownloadSection: React.FC<DownloadSectionProps> = ({
  tracks,
  albums,
  className = ''
}) => {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 ${className}`}>
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
        Downloads
      </h2>
      
      <div className="space-y-4">
        {/* Download all tracks */}
        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white">
              All Tracks
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Download all your tracks ({tracks.length} tracks)
            </p>
          </div>
          <DownloadButton variant="all" size="md" />
        </div>

        {/* Download by albums */}
        {albums.length > 0 && (
          <div className="space-y-2">
            <h3 className="font-medium text-gray-900 dark:text-white">
              Albums
            </h3>
            <div className="space-y-2">
              {albums.map((album, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    {album.cover_thumbnail_path && (
                      <img
                        src={`http://localhost:8000${album.cover_thumbnail_path}`}
                        alt={`${album.name} cover`}
                        className="w-10 h-10 rounded object-cover"
                      />
                    )}
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {album.name}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {album.artist} • {album.tracks.length} tracks
                      </p>
                    </div>
                  </div>
                  <DownloadButton
                    variant="album"
                    albumName={album.name}
                    size="sm"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Info section */}
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
            Download Information
          </h3>
          <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
            <li>• Individual tracks are downloaded in their original format</li>
            <li>• Albums and playlists are packaged as ZIP files</li>
            <li>• Large downloads may take some time to prepare</li>
            <li>• Downloads will start automatically once ready</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
