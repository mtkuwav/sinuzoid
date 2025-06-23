import { create } from 'zustand';
import { Track } from '../hooks/useTracks';

interface AudioPlayerState {
  // Track playing
  currentTrack: Track | null;
  playlist: Track[];
  currentIndex: number;
  
  // Play state
  isPlaying: boolean;
  isPaused: boolean;
  isLoading: boolean;
  
  // Time and progression
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  
  // Play mode
  isShuffleOn: boolean;
  repeatMode: 'none' | 'track' | 'playlist';
  
  // Controls
  play: () => void;
  pause: () => void;
  toggle: () => void;
  stop: () => void;
  
  // Navigation
  next: () => void;
  previous: () => void;
  skipToTrack: (index: number) => void;
  
  // Playlist
  setPlaylist: (tracks: Track[], startIndex?: number) => void;
  addToQueue: (track: Track) => void;
  removeFromQueue: (index: number) => void;
  clearPlaylist: () => void;
  
  // Time and volume (volume not implemented yet)
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  
  // Modes
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  
  // State
  setIsLoading: (loading: boolean) => void;
  
  // Reset
  reset: () => void;
}

export const useAudioPlayerStore = create<AudioPlayerState>((set, get) => ({
  // État initial
  currentTrack: null,
  playlist: [],
  currentIndex: -1,
  isPlaying: false,
  isPaused: false,
  isLoading: false,
  currentTime: 0,
  duration: 0,
  volume: 1,
  isMuted: false,
  isShuffleOn: false,
  repeatMode: 'none',
  
  // Contrôles de lecture
  play: () => {
    const state = get();
    if (state.currentTrack) {
      set({ isPlaying: true, isPaused: false });
    }
  },
  
  pause: () => {
    set({ isPlaying: false, isPaused: true });
  },
  
  toggle: () => {
    const { isPlaying, play, pause } = get();
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  },
  
  stop: () => {
    set({
      isPlaying: false,
      isPaused: false,
      currentTime: 0
    });
  },
  
  // Playlist nav
  next: () => {
    const { playlist, currentIndex, isShuffleOn, repeatMode } = get();
    
    if (playlist.length === 0) return;
    
    let nextIndex = currentIndex;
    
    if (isShuffleOn) {
      // Shuffle mode
      const availableIndices = playlist
        .map((_, index) => index)
        .filter(index => index !== currentIndex);
      
      if (availableIndices.length > 0) {
        nextIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)];
      }
    } else {
      // Normal mode
      nextIndex = currentIndex + 1;
      
      if (nextIndex >= playlist.length) {
        if (repeatMode === 'playlist') {
          nextIndex = 0;
        } else {
          return; // Playlist end
        }
      }
    }
    
    const nextTrack = playlist[nextIndex];
    if (nextTrack) {
      set({
        currentTrack: nextTrack,
        currentIndex: nextIndex,
        currentTime: 0,
        isLoading: true,
        isPlaying: true,
        isPaused: false
      });
    }
  },
  
  previous: () => {
    const { playlist, currentIndex, currentTime } = get();
    
    if (playlist.length === 0) return;
    
    // If at the begining of the track go to the previous one else restart current track
    if (currentTime < 3) {
      let prevIndex = currentIndex - 1;
      
      if (prevIndex < 0) {
        prevIndex = playlist.length - 1;
      }
      
      const prevTrack = playlist[prevIndex];
      if (prevTrack) {
        set({
          currentTrack: prevTrack,
          currentIndex: prevIndex,
          currentTime: 0,
          isLoading: true,
          isPlaying: true,
          isPaused: false
        });
      }
    } else {
      set({ currentTime: 0 });
    }
  },
  
  skipToTrack: (index: number) => {
    const { playlist } = get();
    
    if (index >= 0 && index < playlist.length) {
      const track = playlist[index];
      set({
        currentTrack: track,
        currentIndex: index,
        currentTime: 0,
        isLoading: true,
        isPlaying: true,
        isPaused: false
      });
    }
  },
  
  // Playlist gestion
  setPlaylist: (tracks: Track[], startIndex = 0) => {
    if (tracks.length === 0) {
      set({
        playlist: [],
        currentTrack: null,
        currentIndex: -1,
        isPlaying: false,
        isPaused: false,
        currentTime: 0
      });
      return;
    }
    
    const actualIndex = Math.max(0, Math.min(startIndex, tracks.length - 1));
    const currentTrack = tracks[actualIndex];
    
    set({
      playlist: tracks,
      currentTrack,
      currentIndex: actualIndex,
      currentTime: 0,
      isLoading: true,
      isPlaying: true,
      isPaused: false
    });
  },
  
  addToQueue: (track: Track) => {
    const { playlist } = get();
    set({ playlist: [...playlist, track] });
  },
  
  removeFromQueue: (index: number) => {
    const { playlist, currentIndex } = get();
    
    if (index < 0 || index >= playlist.length) return;
    
    const newPlaylist = playlist.filter((_, i) => i !== index);
    let newCurrentIndex = currentIndex;
    
    if (index === currentIndex) {
      // Current track deletion
      if (newPlaylist.length === 0) {
        set({
          playlist: [],
          currentTrack: null,
          currentIndex: -1,
          isPlaying: false,
          isPaused: false
        });
        return;
      } else if (currentIndex >= newPlaylist.length) {
        newCurrentIndex = 0;
      }
      
      const newCurrentTrack = newPlaylist[newCurrentIndex];
      set({
        playlist: newPlaylist,
        currentTrack: newCurrentTrack,
        currentIndex: newCurrentIndex,
        currentTime: 0,
        isLoading: true
      });
    } else {
      // Other track deletion
      if (index < currentIndex) {
        newCurrentIndex = currentIndex - 1;
      }
      
      set({
        playlist: newPlaylist,
        currentIndex: newCurrentIndex
      });
    }
  },
  
  clearPlaylist: () => {
    set({
      playlist: [],
      currentTrack: null,
      currentIndex: -1,
      isPlaying: false,
      isPaused: false,
      currentTime: 0
    });
  },
  
  // Time and volume
  setCurrentTime: (time: number) => {
    set({ currentTime: Math.max(0, time) });
  },
  
  setDuration: (duration: number) => {
    set({ duration: Math.max(0, duration) });
  },
  
  setVolume: (volume: number) => {
    const clampedVolume = Math.max(0, Math.min(1, volume));
    set({ 
      volume: clampedVolume,
      isMuted: clampedVolume === 0
    });
  },
  
  toggleMute: () => {
    const { isMuted, volume } = get();
    if (isMuted && volume === 0) {
      set({ volume: 1, isMuted: false });
    } else {
      set({ isMuted: !isMuted });
    }
  },
  
  // Play modes
  toggleShuffle: () => {
    set(state => ({ isShuffleOn: !state.isShuffleOn }));
  },
  
  toggleRepeat: () => {
    const { repeatMode } = get();
    const modes: ('none' | 'track' | 'playlist')[] = ['none', 'track', 'playlist'];
    const currentIndex = modes.indexOf(repeatMode);
    const nextIndex = (currentIndex + 1) % modes.length;
    
    set({ repeatMode: modes[nextIndex] });
  },
  
  // State
  setIsLoading: (loading: boolean) => {
    set({ isLoading: loading });
  },
  
  // Reset
  reset: () => {
    set({
      currentTrack: null,
      playlist: [],
      currentIndex: -1,
      isPlaying: false,
      isPaused: false,
      isLoading: false,
      currentTime: 0,
      duration: 0,
      volume: 1,
      isMuted: false,
      isShuffleOn: false,
      repeatMode: 'none'
    });
  }
}));
