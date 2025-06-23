import { useAudioPlayerStore } from '../store/audioPlayerStore';
import { Track } from '../hooks/useTracks';

/**
 * Hook to easily control audio player
 */
export const useAudioPlayer = () => {
  const store = useAudioPlayerStore();

  /**
   * Play one track
   */
  const playTrack = (track: Track) => {
    store.setPlaylist([track], 0);
  };

  /**
   * Play a list of tracks
   */
  const playTracks = (tracks: Track[], startIndex = 0) => {
    if (tracks.length === 0) return;
    
    store.setPlaylist(tracks, startIndex);
  };

  /**
   * Play an album
   */
  const playAlbum = (album: { tracks: Track[] }, startIndex = 0) => {
    playTracks(album.tracks, startIndex);
  };

  /**
   * Play a playlist
   */
  const playPlaylist = (playlist: { tracks: Track[] }, startIndex = 0) => {
    playTracks(playlist.tracks, startIndex);
  };

  /**
   * Add a track to the queue
   */
  const addToQueue = (track: Track) => {
    store.addToQueue(track);
  };

  /**
   * Add multiple tracks to the queue
   */
  const addTracksToQueue = (tracks: Track[]) => {
    tracks.forEach(track => store.addToQueue(track));
  };

  /**
   * Verify if a track is playing
   */
  const isTrackPlaying = (trackId: string): boolean => {
    return store.currentTrack?.id === trackId && store.isPlaying;
  };

  /**
   * Verify if the track playing is the current track (even while paused)
   */
  const isCurrentTrack = (trackId: string): boolean => {
    return store.currentTrack?.id === trackId;
  };

  /**
   * Toggle track play
   */
  const toggleTrack = (track: Track) => {
    if (isCurrentTrack(track.id)) {
      store.toggle();
    } else {
      playTrack(track);
    }
  };

  return {
    // Store state
    ...store,
    
    // utils
    playTrack,
    playTracks,
    playAlbum,
    playPlaylist,
    addToQueue,
    addTracksToQueue,
    isTrackPlaying,
    isCurrentTrack,
    toggleTrack
  };
};
