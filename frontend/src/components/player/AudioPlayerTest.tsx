import React from 'react';
import { FiPlay, FiMusic } from 'react-icons/fi';
import { useAudioPlayer } from '../../hooks/useAudioPlayer';
import { useAuth } from '../../contexts/AuthContext';
import { Track } from '../../hooks/useTracks';

export const AudioPlayerTest: React.FC = () => {
  const { playTrack, currentTrack, isPlaying } = useAudioPlayer();
  const { isAuthenticated } = useAuth();

  // Pistes de test basées sur les fichiers du test HTML
  const testTracks: Track[] = [
    {
      id: 'test_mp3',
      user_id: 123,
      original_filename: 'Test MP3 (10MB).mp3',
      file_path: 'test_user_123_5445d37c-156e-4e65-aef5-dcf299633386.mp3',
      file_size: 10485760,
      file_type: 'mp3',
      duration: '3:45',
      upload_date: new Date().toISOString(),
      cover_thumbnail_path: 'test_user_123_5445d37c-156e-4e65-aef5-dcf299633386_cover.jpg',
      updated_at: new Date().toISOString(),
      metadata: {
        title: 'Test Audio MP3',
        artist: 'Sinuzoid Test',
        album: 'Demo Album',
        genre: 'Test',
        year: 2024,
        track_number: 1,
        duration: 225
      }
    },
    {
      id: 'test_flac',
      user_id: 123,
      original_filename: 'Test FLAC (43MB).flac',
      file_path: 'test_user_123_16c3b747-1752-466c-8d49-6441d215dee8.flac',
      file_size: 45088768,
      file_type: 'flac',
      duration: '4:12',
      upload_date: new Date().toISOString(),
      cover_thumbnail_path: 'test_user_123_5445d37c-156e-4e65-aef5-dcf299633386_cover.jpg',
      updated_at: new Date().toISOString(),
      metadata: {
        title: 'Test Audio FLAC',
        artist: 'Sinuzoid Test',
        album: 'Demo Album',
        genre: 'Test',
        year: 2024,
        track_number: 2,
        duration: 252
      }
    }
  ];

  if (!isAuthenticated) {
    return (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
        <div className="text-center">
          <FiMusic className="w-12 h-12 mx-auto text-gray-400 dark:text-gray-500 mb-4" />
          <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-white">
            Test du Lecteur Audio
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Connectez-vous pour tester le lecteur audio
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
      <div className="text-center mb-6">
        <FiMusic className="w-12 h-12 mx-auto text-blue-600 dark:text-blue-400 mb-4" />
        <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-white">
          Test du Lecteur Audio
        </h3>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          Testez le lecteur avec des fichiers de démonstration
        </p>
      </div>

      <div className="space-y-3">
        {testTracks.map((track) => (
          <div
            key={track.id}
            className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
              currentTrack?.id === track.id
                ? 'border-blue-300 bg-blue-50 dark:border-blue-600 dark:bg-blue-900/20'
                : 'border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded flex items-center justify-center">
                <FiMusic className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  {track.metadata?.title}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {track.metadata?.artist} • {track.file_type.toUpperCase()}
                </p>
              </div>
            </div>
            
            <button
              onClick={() => playTrack(track)}
              className={`p-2 rounded-full transition-colors ${
                currentTrack?.id === track.id && isPlaying
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-blue-100 dark:hover:bg-blue-900'
              }`}
            >
              <FiPlay className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
      
      {currentTrack && (
        <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
            🎵 En cours : <span className="font-medium">{currentTrack.metadata?.title}</span>
          </p>
        </div>
      )}
    </div>
  );
};
