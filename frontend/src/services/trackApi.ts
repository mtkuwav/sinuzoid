import { Track } from '../hooks/useTracks';

const API_BASE_URL = 'http://localhost:8000';

class TrackApiService {
  private getAuthHeaders() {
    const token = sessionStorage.getItem('access_token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }
    return response.json();
  }

  /**
   * Delete a single track by filename
   */
  async deleteTrack(filename: string): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/files/audio/${encodeURIComponent(filename)}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });
    return this.handleResponse<{ message: string }>(response);
  }

  /**
   * Delete all tracks for the current user
   */
  async deleteAllTracks(): Promise<{ message: string; deleted_count: number }> {
    const response = await fetch(`${API_BASE_URL}/files/audio/all`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });
    return this.handleResponse<{ message: string; deleted_count: number }>(response);
  }

  /**
   * Get track filename from a track object
   */
  getTrackFilename(track: Track): string {
    // Extract filename from file_path
    return track.file_path.split('/').pop() || track.original_filename;
  }
}

export const trackApi = new TrackApiService();
