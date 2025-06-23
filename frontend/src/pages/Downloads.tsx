import React from 'react';
import { FiDownload, FiPackage, FiMusic, FiList } from 'react-icons/fi';
import { useMusicData } from '../hooks/useMusicStore';
import { usePlaylistData } from '../hooks/usePlaylist';
import { DownloadButton } from '../components/DownloadButton';

const Downloads: React.FC = () => {
  const { tracks, albums, isLoading } = useMusicData();
  const { playlists, isLoading: playlistsLoading } = usePlaylistData();

  if (isLoading || playlistsLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <FiDownload className="w-8 h-8 text-blue-600 dark:text-blue-400 animate-pulse mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">
              Chargement des options de téléchargement...
            </p>
          </div>
        </div>
      </div>
    );
  }

  const totalTracks = tracks.length;
  const totalAlbums = albums.length;
  const totalPlaylists = playlists.length;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
          Téléchargements
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Téléchargez votre collection musicale en lot ou individuellement
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <FiMusic className="w-8 h-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Total Tracks
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {totalTracks}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <FiPackage className="w-8 h-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Albums
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {totalAlbums}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <FiList className="w-8 h-8 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Playlists
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {totalPlaylists}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex items-center justify-center">
            <DownloadButton
              variant="all"
              size="lg"
              className="w-full"
            />
          </div>
        </div>
      </div>

      {/* Download Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Albums Download Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <FiPackage className="w-5 h-5 mr-2" />
            Télécharger par Album
          </h2>
          
          {albums.length > 0 ? (
            <div className="space-y-3">
              {albums.slice(0, 5).map((album, index) => (
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
              {albums.length > 5 && (
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                  Et {albums.length - 5} autres albums...
                </p>
              )}
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-center py-4">
              Aucun album disponible
            </p>
          )}
        </div>

        {/* Playlists Download Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <FiList className="w-5 h-5 mr-2" />
            Télécharger par Playlist
          </h2>
          
          {playlists.length > 0 ? (
            <div className="space-y-3">
              {playlists.slice(0, 5).map((playlist) => (
                <div
                  key={playlist.id}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {playlist.name}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {playlist.tracks.length} tracks
                      {playlist.description && ` • ${playlist.description}`}
                    </p>
                  </div>
                  <DownloadButton
                    variant="playlist"
                    playlistId={playlist.id}
                    playlistName={playlist.name}
                    size="sm"
                  />
                </div>
              ))}
              {playlists.length > 5 && (
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                  Et {playlists.length - 5} autres playlists...
                </p>
              )}
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-center py-4">
              Aucune playlist disponible
            </p>
          )}
        </div>
      </div>

      {/* Download Information */}
      <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
        <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-4 flex items-center">
          <FiDownload className="w-5 h-5 mr-2" />
          Informations sur les téléchargements
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800 dark:text-blue-200">
          <div>
            <h4 className="font-medium mb-2">Formats disponibles :</h4>
            <ul className="space-y-1">
              <li>• Tracks individuelles : Format original (FLAC, MP3, etc.)</li>
              <li>• Albums : Archive ZIP avec toutes les tracks</li>
              <li>• Playlists : Archive ZIP organisée</li>
              <li>• Collection complète : Archive ZIP de tout</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-2">À savoir :</h4>
            <ul className="space-y-1">
              <li>• Les métadonnées sont préservées</li>
              <li>• Téléchargement direct dans le navigateur</li>
              <li>• Pas de limite de taille</li>
              <li>• Organisé par dossiers dans les archives</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Downloads;
