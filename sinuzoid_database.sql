--
-- PostgreSQL database dump
--

-- Dumped from database version 15.12 (Debian 15.12-1.pgdg120+1)
-- Dumped by pg_dump version 15.12 (Debian 15.12-1.pgdg120+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_updated_at_column() OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: doctrine_migration_versions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.doctrine_migration_versions (
    version character varying(191) NOT NULL,
    executed_at timestamp(0) without time zone DEFAULT NULL::timestamp without time zone,
    execution_time integer
);


ALTER TABLE public.doctrine_migration_versions OWNER TO postgres;

--
-- Name: metadata; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.metadata (
    id integer NOT NULL,
    track_id uuid NOT NULL,
    metadata_json jsonb NOT NULL,
    created_at timestamp(0) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(0) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.metadata OWNER TO postgres;

--
-- Name: COLUMN metadata.track_id; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.metadata.track_id IS '(DC2Type:uuid)';


--
-- Name: COLUMN metadata.created_at; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.metadata.created_at IS '(DC2Type:datetime_immutable)';


--
-- Name: COLUMN metadata.updated_at; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.metadata.updated_at IS '(DC2Type:datetime_immutable)';


--
-- Name: metadata_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.metadata_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.metadata_id_seq OWNER TO postgres;

--
-- Name: metadata_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.metadata_id_seq OWNED BY public.metadata.id;


--
-- Name: password_reset_tokens; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.password_reset_tokens (
    id integer NOT NULL,
    user_id integer NOT NULL,
    token character varying(255) NOT NULL,
    expires_at timestamp(0) without time zone NOT NULL,
    created_at timestamp(0) without time zone NOT NULL,
    used_at timestamp(0) without time zone DEFAULT NULL::timestamp without time zone,
    is_used boolean NOT NULL
);


ALTER TABLE public.password_reset_tokens OWNER TO postgres;

--
-- Name: password_reset_tokens_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.password_reset_tokens_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.password_reset_tokens_id_seq OWNER TO postgres;

--
-- Name: password_reset_tokens_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.password_reset_tokens_id_seq OWNED BY public.password_reset_tokens.id;


--
-- Name: playlist_tracks; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.playlist_tracks (
    playlist_id uuid NOT NULL,
    track_id uuid NOT NULL,
    "position" integer,
    added_at timestamp(0) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.playlist_tracks OWNER TO postgres;

--
-- Name: COLUMN playlist_tracks.playlist_id; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.playlist_tracks.playlist_id IS '(DC2Type:uuid)';


--
-- Name: COLUMN playlist_tracks.track_id; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.playlist_tracks.track_id IS '(DC2Type:uuid)';


--
-- Name: COLUMN playlist_tracks.added_at; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.playlist_tracks.added_at IS '(DC2Type:datetime_immutable)';


--
-- Name: playlists; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.playlists (
    id uuid NOT NULL,
    user_id integer NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    created_at timestamp(0) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(0) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.playlists OWNER TO postgres;

--
-- Name: COLUMN playlists.id; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.playlists.id IS '(DC2Type:uuid)';


--
-- Name: COLUMN playlists.created_at; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.playlists.created_at IS '(DC2Type:datetime_immutable)';


--
-- Name: COLUMN playlists.updated_at; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.playlists.updated_at IS '(DC2Type:datetime_immutable)';


--
-- Name: refresh_tokens; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.refresh_tokens (
    id integer NOT NULL,
    user_id integer NOT NULL,
    token character varying(255) NOT NULL,
    expires_at timestamp(0) without time zone NOT NULL,
    created_at timestamp(0) without time zone NOT NULL,
    used_at timestamp(0) without time zone DEFAULT NULL::timestamp without time zone,
    is_revoked boolean NOT NULL
);


ALTER TABLE public.refresh_tokens OWNER TO postgres;

--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.refresh_tokens_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.refresh_tokens_id_seq OWNER TO postgres;

--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.refresh_tokens_id_seq OWNED BY public.refresh_tokens.id;


--
-- Name: statistics; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.statistics (
    user_id integer NOT NULL,
    track_id uuid NOT NULL,
    play_count integer DEFAULT 0 NOT NULL,
    last_played timestamp(0) without time zone,
    user_rating smallint,
    total_listen_time character varying(255) DEFAULT '0 seconds'::character varying NOT NULL,
    skip_count integer DEFAULT 0 NOT NULL,
    complete_plays integer DEFAULT 0 NOT NULL,
    created_at timestamp(0) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(0) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT statistics_user_rating_check CHECK (((user_rating >= 1) AND (user_rating <= 5)))
);


ALTER TABLE public.statistics OWNER TO postgres;

--
-- Name: COLUMN statistics.track_id; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.statistics.track_id IS '(DC2Type:uuid)';


--
-- Name: COLUMN statistics.last_played; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.statistics.last_played IS '(DC2Type:datetime_immutable)';


--
-- Name: COLUMN statistics.total_listen_time; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.statistics.total_listen_time IS '(DC2Type:dateinterval)';


--
-- Name: COLUMN statistics.created_at; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.statistics.created_at IS '(DC2Type:datetime_immutable)';


--
-- Name: COLUMN statistics.updated_at; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.statistics.updated_at IS '(DC2Type:datetime_immutable)';


--
-- Name: tracks; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tracks (
    id uuid NOT NULL,
    user_id integer NOT NULL,
    original_filename character varying(255) NOT NULL,
    file_path character varying(512) NOT NULL,
    file_size bigint NOT NULL,
    file_type character varying(10) NOT NULL,
    duration character varying(255) NOT NULL,
    upload_date timestamp(0) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    last_accessed timestamp(0) without time zone,
    cover_path character varying(512),
    cover_thumbnail_path character varying(512),
    updated_at timestamp(0) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT tracks_file_type_check CHECK (((file_type)::text = ANY ((ARRAY['mp3'::character varying, 'wav'::character varying, 'flac'::character varying, 'ogg'::character varying, 'aac'::character varying])::text[])))
);


ALTER TABLE public.tracks OWNER TO postgres;

--
-- Name: COLUMN tracks.id; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.tracks.id IS '(DC2Type:uuid)';


--
-- Name: COLUMN tracks.duration; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.tracks.duration IS '(DC2Type:dateinterval)';


--
-- Name: COLUMN tracks.upload_date; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.tracks.upload_date IS '(DC2Type:datetime_immutable)';


--
-- Name: COLUMN tracks.last_accessed; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.tracks.last_accessed IS '(DC2Type:datetime_immutable)';


--
-- Name: COLUMN tracks.updated_at; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.tracks.updated_at IS '(DC2Type:datetime_immutable)';


--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    username character varying(50) NOT NULL,
    email character varying(100) NOT NULL,
    password_hash character varying(255) NOT NULL,
    created_at timestamp(0) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    last_login timestamp(0) without time zone,
    storage_quota bigint DEFAULT 1073741824 NOT NULL,
    role character varying(20) DEFAULT 'user'::character varying NOT NULL,
    updated_at timestamp(0) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT users_role_check CHECK (((role)::text = ANY ((ARRAY['user'::character varying, 'admin'::character varying])::text[])))
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: COLUMN users.created_at; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.users.created_at IS '(DC2Type:datetime_immutable)';


--
-- Name: COLUMN users.last_login; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.users.last_login IS '(DC2Type:datetime_immutable)';


--
-- Name: COLUMN users.updated_at; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.users.updated_at IS '(DC2Type:datetime_immutable)';


--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.users_id_seq OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: metadata id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.metadata ALTER COLUMN id SET DEFAULT nextval('public.metadata_id_seq'::regclass);


--
-- Name: password_reset_tokens id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.password_reset_tokens ALTER COLUMN id SET DEFAULT nextval('public.password_reset_tokens_id_seq'::regclass);


--
-- Name: refresh_tokens id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.refresh_tokens ALTER COLUMN id SET DEFAULT nextval('public.refresh_tokens_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Name: doctrine_migration_versions doctrine_migration_versions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.doctrine_migration_versions
    ADD CONSTRAINT doctrine_migration_versions_pkey PRIMARY KEY (version);


--
-- Name: metadata extended_metadata_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.metadata
    ADD CONSTRAINT extended_metadata_pkey PRIMARY KEY (id);


--
-- Name: password_reset_tokens password_reset_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.password_reset_tokens
    ADD CONSTRAINT password_reset_tokens_pkey PRIMARY KEY (id);


--
-- Name: playlist_tracks playlist_tracks_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.playlist_tracks
    ADD CONSTRAINT playlist_tracks_pkey PRIMARY KEY (playlist_id, track_id);


--
-- Name: playlists playlists_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.playlists
    ADD CONSTRAINT playlists_pkey PRIMARY KEY (id);


--
-- Name: refresh_tokens refresh_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_pkey PRIMARY KEY (id);


--
-- Name: statistics statistics_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.statistics
    ADD CONSTRAINT statistics_pkey PRIMARY KEY (user_id, track_id);


--
-- Name: tracks tracks_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tracks
    ADD CONSTRAINT tracks_pkey PRIMARY KEY (id);


--
-- Name: tracks uniq_246d2a2e82a8e361; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tracks
    ADD CONSTRAINT uniq_246d2a2e82a8e361 UNIQUE (file_path);


--
-- Name: users uniq_email; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT uniq_email UNIQUE (email);


--
-- Name: users uniq_username; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT uniq_username UNIQUE (username);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: idx_246d2a2ea76ed395; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_246d2a2ea76ed395 ON public.tracks USING btree (user_id);


--
-- Name: idx_3967a216a76ed395; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_3967a216a76ed395 ON public.password_reset_tokens USING btree (user_id);


--
-- Name: idx_5e06116fa76ed395; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_5e06116fa76ed395 ON public.playlists USING btree (user_id);


--
-- Name: idx_9bace7e1a76ed395; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_9bace7e1a76ed395 ON public.refresh_tokens USING btree (user_id);


--
-- Name: idx_metadata_gin; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_metadata_gin ON public.metadata USING gin (metadata_json jsonb_path_ops);


--
-- Name: idx_statistics_track_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_statistics_track_id ON public.statistics USING btree (track_id);


--
-- Name: idx_statistics_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_statistics_user_id ON public.statistics USING btree (user_id);


--
-- Name: idx_tracks_cover_path; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_tracks_cover_path ON public.tracks USING btree (cover_path) WHERE (cover_path IS NOT NULL);


--
-- Name: uniq_3967a2165f37a13b; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX uniq_3967a2165f37a13b ON public.password_reset_tokens USING btree (token);


--
-- Name: uniq_9bace7e15f37a13b; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX uniq_9bace7e15f37a13b ON public.refresh_tokens USING btree (token);


--
-- Name: metadata update_metadata_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_metadata_updated_at BEFORE UPDATE ON public.metadata FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: tracks update_tracks_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_tracks_updated_at BEFORE UPDATE ON public.tracks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: users update_users_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: metadata extended_metadata_track_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.metadata
    ADD CONSTRAINT extended_metadata_track_id_fkey FOREIGN KEY (track_id) REFERENCES public.tracks(id) ON DELETE CASCADE;


--
-- Name: password_reset_tokens fk_3967a216a76ed395; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.password_reset_tokens
    ADD CONSTRAINT fk_3967a216a76ed395 FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: refresh_tokens fk_9bace7e1a76ed395; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT fk_9bace7e1a76ed395 FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: playlist_tracks playlist_tracks_playlist_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.playlist_tracks
    ADD CONSTRAINT playlist_tracks_playlist_id_fkey FOREIGN KEY (playlist_id) REFERENCES public.playlists(id) ON DELETE CASCADE;


--
-- Name: playlist_tracks playlist_tracks_track_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.playlist_tracks
    ADD CONSTRAINT playlist_tracks_track_id_fkey FOREIGN KEY (track_id) REFERENCES public.tracks(id) ON DELETE CASCADE;


--
-- Name: playlists playlists_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.playlists
    ADD CONSTRAINT playlists_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: statistics statistics_track_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.statistics
    ADD CONSTRAINT statistics_track_id_fkey FOREIGN KEY (track_id) REFERENCES public.tracks(id) ON DELETE CASCADE;


--
-- Name: statistics statistics_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.statistics
    ADD CONSTRAINT statistics_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: tracks tracks_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tracks
    ADD CONSTRAINT tracks_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--
