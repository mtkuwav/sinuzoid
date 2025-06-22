import { Track } from '../hooks/useTracks';

export interface Playlist {
  id: string;
  user_id: number;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
  tracks: Track[];
}

export interface PlaylistCreate {
  name: string;
  description?: string;
}

export interface PlaylistUpdate {
  name?: string;
  description?: string;
}

export interface PlaylistSearchResult {
  playlists: Playlist[];
  total_results: number;
  search_query: string;
  search_in_tracks: boolean;
  search_in_description: boolean;
}

export interface PlaylistSearchParams {
  query: string;
  search_in_tracks?: boolean;
  search_in_description?: boolean;
  limit?: number;
  offset?: number;
}

export interface PlaylistTrackOperation {
  playlist_id: string;
  track_id: string;
  position?: number;
}

export interface PlaylistStats {
  totalTracks: number;
  totalDuration: string;
  lastUpdated: string;
}
