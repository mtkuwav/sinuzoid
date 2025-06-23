import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { FaMusic, FaUpload, FaClock, FaHeart, FaChartLine } from 'react-icons/fa';
import SinuzoidLogo from '../assets/logos/logo_sinuzoid-cyan.svg?react';
import { useTracks, Track, Album } from '../hooks/useTracks';
import { useAuth } from '../contexts/AuthContext';
import { useMusicImages } from '../hooks/useMusicStore';
import { useAudioPlayer } from '../hooks/useAudioPlayer';

const Home: React.FC = () => {
  const { tracks, albums, isLoading } = useTracks();
  const { user } = useAuth();
  const { getThumbnailUrl } = useMusicImages();
  const { toggleTrack } = useAudioPlayer();
  const navigate = useNavigate();
  const [recentTracks, setRecentTracks] = useState<Track[]>([]);
  const [featuredAlbums, setFeaturedAlbums] = useState<Album[]>([]);

  useEffect(() => {
    if (tracks.length > 0) {
      // Prendre les 6 morceaux les plus récents
      const recent = [...tracks]
        .sort((a, b) => new Date(b.upload_date).getTime() - new Date(a.upload_date).getTime())
        .slice(0, 6);
      setRecentTracks(recent);
    }
    
    if (albums.length > 0) {
      // Prendre les 4 premiers albums
      setFeaturedAlbums(albums.slice(0, 4));
    }
  }, [tracks, albums]);

  const formatDuration = (duration: string | number) => {
    if (typeof duration === 'string') {
      return duration;
    }
    const minutes = Math.floor(duration / 60);
    const seconds = Math.floor(duration % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const QuickActionCard = ({ icon: Icon, title, description, to, color }: {
    icon: any;
    title: string;
    description: string;
    to: string;
    color: string;
  }) => (
    <Link
      to={to}
      className="group bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-lg hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200"
    >
      <div className={`${color} p-3 rounded-lg w-fit mb-4 group-hover:scale-110 transition-transform duration-200`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-white">{title}</h3>
      <p className="text-gray-600 dark:text-gray-300 text-sm">{description}</p>
    </Link>
  );

  const TrackCard = ({ track }: { track: Track }) => {
    const [imageUrl, setImageUrl] = useState<string | null>(null);

    useEffect(() => {
      const loadImage = async () => {
        if (track.cover_thumbnail_path) {
          const url = await getThumbnailUrl(track.cover_thumbnail_path);
          setImageUrl(url);
        }
      };
      loadImage();
    }, [track.cover_thumbnail_path, getThumbnailUrl]);

    const handleTrackClick = () => {
      toggleTrack(track);
    };

    return (
      <div 
        onClick={handleTrackClick}
        className="flex items-center space-x-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-500 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 group cursor-pointer"
      >
        <div className="relative">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={track.metadata?.album || 'Album'}
              className="w-12 h-12 rounded object-cover group-hover:shadow-md transition-shadow duration-200"
            />
          ) : (
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700 rounded flex items-center justify-center group-hover:shadow-md transition-shadow duration-200">
              <SinuzoidLogo className="fill-white w-6 h-6" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-gray-800 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200">
            {track.metadata?.title || track.original_filename}
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
            {track.metadata?.artist || 'Artiste inconnu'}
          </p>
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400">
          {track.metadata?.duration ? formatDuration(track.metadata.duration) : track.duration}
        </div>
      </div>
    );
  };

  const AlbumCard = ({ album }: { album: Album }) => {
    const [imageUrl, setImageUrl] = useState<string | null>(null);

    useEffect(() => {
      const loadImage = async () => {
        if (album.cover_thumbnail_path) {
          const url = await getThumbnailUrl(album.cover_thumbnail_path);
          setImageUrl(url);
        }
      };
      loadImage();
    }, [album.cover_thumbnail_path, getThumbnailUrl]);

    const handleAlbumClick = () => {
      navigate(`/album/${encodeURIComponent(album.name)}`);
    };

    return (
      <div 
        onClick={handleAlbumClick}
        className="group cursor-pointer"
      >
        <div className="relative mb-3">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={album.name}
              className="w-full aspect-square rounded-lg object-cover group-hover:shadow-lg group-hover:scale-105 transition-all duration-200"
            />
          ) : (
            <div className="w-full aspect-square bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700 rounded-lg flex items-center justify-center group-hover:shadow-lg group-hover:scale-105 transition-all duration-200">
              <SinuzoidLogo className="fill-white w-16 h-16" />
            </div>
          )}
        </div>
        <h4 className="font-medium text-gray-800 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200">{album.name}</h4>
        <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
          {album.artist || 'Artiste inconnu'} • {album.tracks.length} titre{album.tracks.length > 1 ? 's' : ''}
        </p>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700 text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <SinuzoidLogo className="fill-white size-20 mx-auto mb-6" />
            <h1 className="text-5xl font-bold mb-4">
              {user ? `Bon retour, ${user.username}` : 'Bienvenue sur Sinuzoid'}
            </h1>
            <p className="text-xl opacity-90 mb-8">
              Votre musique, partout, tout le temps
            </p>
            {!user && (
              <div className="space-x-4">
                <Link
                  to="/register"
                  className="bg-white text-purple-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors duration-200"
                >
                  Commencer gratuitement
                </Link>
                <Link
                  to="/login"
                  className="border border-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-purple-600 transition-colors duration-200"
                >
                  Se connecter
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {user ? (
          <>
            {/* Actions rapides */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Actions rapides</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <QuickActionCard
                  icon={FaUpload}
                  title="Uploader"
                  description="Ajoutez de nouveaux morceaux à votre bibliothèque"
                  to="/upload"
                  color="bg-green-500"
                />
                <QuickActionCard
                  icon={FaMusic}
                  title="Ma bibliothèque"
                  description="Parcourez toute votre collection"
                  to="/library"
                  color="bg-blue-500"
                />
                <QuickActionCard
                  icon={FaHeart}
                  title="Mes playlists"
                  description="Gérez vos playlists personnalisées"
                  to="/playlists"
                  color="bg-red-500"
                />
                <QuickActionCard
                  icon={FaClock}
                  title="Récemment ajouté"
                  description="Découvrez les derniers ajouts"
                  to="/recently-added"
                  color="bg-purple-500"
                />
              </div>
            </section>

            {/* Morceaux récents */}
            {recentTracks.length > 0 && (
              <section className="mb-12">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Récemment ajouté</h2>
                  <Link
                    to="/recently-added"
                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                  >
                    Voir tout
                  </Link>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {recentTracks.map((track) => (
                    <TrackCard key={track.id} track={track} />
                  ))}
                </div>
              </section>
            )}

            {/* Albums en vedette */}
            {featuredAlbums.length > 0 && (
              <section className="mb-12">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Vos albums</h2>
                  <Link
                    to="/library"
                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                  >
                    Voir tout
                  </Link>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {featuredAlbums.map((album, index) => (
                    <AlbumCard key={`${album.name}-${index}`} album={album} />
                  ))}
                </div>
              </section>
            )}

            {/* Message si aucune musique */}
            {tracks.length === 0 && !isLoading && (
              <section className="text-center py-16">
                <div className="bg-white dark:bg-gray-800 rounded-xl p-8 border border-gray-200 dark:border-gray-700 max-w-md mx-auto">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700 rounded-full flex items-center justify-center mx-auto mb-4">
                    <SinuzoidLogo className="fill-white w-10 h-10" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
                    Votre bibliothèque est vide
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-6">
                    Commencez par uploader vos premiers morceaux pour créer votre collection musicale.
                  </p>
                  <Link
                    to="/upload"
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-200 inline-flex items-center space-x-2"
                  >
                    <FaUpload className="w-5 h-5" />
                    <span>Uploader de la musique</span>
                  </Link>
                </div>
              </section>
            )}
          </>
        ) : (
          /* Section pour les visiteurs non connectés */
          <section className="py-16">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">
                  Votre musique, organisée comme vous l'aimez
                </h2>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <FaChartLine className="w-6 h-6 text-blue-600 mt-1" />
                    <div>
                      <h3 className="font-semibold text-gray-800 dark:text-white">Uploadez facilement</h3>
                      <p className="text-gray-600 dark:text-gray-300">
                        Importez vos fichiers audio et créez votre bibliothèque personnelle
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <FaMusic className="w-6 h-6 text-purple-600 mt-1" />
                    <div>
                      <h3 className="font-semibold text-gray-800 dark:text-white">Organisez vos playlists</h3>
                      <p className="text-gray-600 dark:text-gray-300">
                        Créez des playlists thématiques et retrouvez facilement vos morceaux favoris
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <FaHeart className="w-6 h-6 text-red-600 mt-1" />
                    <div>
                      <h3 className="font-semibold text-gray-800 dark:text-white">Écoutez partout</h3>
                      <p className="text-gray-600 dark:text-gray-300">
                        Accédez à votre musique depuis n'importe quel appareil connecté
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 p-8 rounded-xl border border-gray-200 dark:border-gray-700">
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4 text-center">
                  Rejoignez Sinuzoid
                </h3>
                <div className="space-y-4">
                  <Link
                    to="/register"
                    className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-200 text-center block"
                  >
                    Créer un compte
                  </Link>
                  <Link
                    to="/login"
                    className="w-full border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-white py-3 rounded-lg font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 text-center block"
                  >
                    Se connecter
                  </Link>
                </div>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default Home;