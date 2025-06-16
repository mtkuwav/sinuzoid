-- Table Utilisateur
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP WITH TIME ZONE,
    storage_quota BIGINT DEFAULT 1073741824, -- 1 Go par défaut
    role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin'))
);

-- Table Fichier Audio (Track)
CREATE TABLE tracks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    original_filename VARCHAR(255) NOT NULL,
    file_path VARCHAR(512) UNIQUE NOT NULL,
    file_size BIGINT NOT NULL,
    file_type VARCHAR(10) CHECK (file_type IN ('mp3', 'wav', 'flac', 'ogg', 'aac')),
    duration INTERVAL NOT NULL,
    upload_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_accessed TIMESTAMP WITH TIME ZONE,
    is_public BOOLEAN DEFAULT false
);

-- Table Métadonnées Standard
CREATE TABLE standard_metadata (
    track_id UUID PRIMARY KEY REFERENCES tracks(id) ON DELETE CASCADE,
    title VARCHAR(255),
    artist VARCHAR(255),
    album VARCHAR(255),
    genre VARCHAR(100),
    year INT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table Métadonnées Étendues (Approche flexible)
CREATE TABLE extended_metadata (
    id SERIAL PRIMARY KEY,
    track_id UUID NOT NULL REFERENCES tracks(id) ON DELETE CASCADE,
    metadata JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index pour les recherches dans les métadonnées JSONB
CREATE INDEX idx_metadata_gin ON extended_metadata USING GIN (metadata jsonb_path_ops);

-- Table Playlists
CREATE TABLE playlists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table de liaison Playlist <-> Track
CREATE TABLE playlist_tracks (
    playlist_id UUID REFERENCES playlists(id) ON DELETE CASCADE,
    track_id UUID REFERENCES tracks(id) ON DELETE CASCADE,
    position INT,
    added_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (playlist_id, track_id)
);

-- Table Statistiques
CREATE TABLE statistics (
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    track_id UUID REFERENCES tracks(id) ON DELETE CASCADE,
    play_count INT DEFAULT 0,
    last_played TIMESTAMP WITH TIME ZONE,
    user_rating SMALLINT CHECK (user_rating BETWEEN 1 AND 5),
    total_listen_time INTERVAL DEFAULT '0 seconds',
    skip_count INT DEFAULT 0,
    complete_plays INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, track_id)
);

-- Index pour optimiser les requêtes par utilisateur
CREATE INDEX idx_statistics_user_id ON statistics(user_id);
CREATE INDEX idx_statistics_track_id ON statistics(track_id);

-- Index pour optimiser les requêtes par utilisateur sur les autres tables
CREATE INDEX idx_tracks_user_id ON tracks(user_id);
CREATE INDEX idx_playlists_user_id ON playlists(user_id);
