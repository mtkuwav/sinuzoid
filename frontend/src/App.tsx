/// <reference types="vite-plugin-svgr/client" />

import { BrowserRouter as Router, Routes, Route } from 'react-router';
import './App.css'

import { AuthProvider } from './contexts/AuthContext';
import { useBackgroundSync, useNetworkSync } from './hooks/useBackgroundSync';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Home from './pages/Home';
import Discover from './pages/Discover';
import Library from './pages/Library';
import Album from './pages/Album';
import Radio from './pages/Radio';
import Playlists from './pages/Playlists';
import PlaylistDetail from './pages/PlaylistDetail';
import Upload from './pages/Upload';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';

// Composant interne pour la synchronisation
const AppWithSync = () => {
  // Activer la synchronisation automatique et la détection réseau
  useBackgroundSync();
  useNetworkSync();

  return (
    <Routes>
      {/* Routes publiques */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      {/* Routes protégées */}
      <Route path="/" element={<Layout />}>
        <Route index element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="discover" element={<ProtectedRoute><Discover /></ProtectedRoute>} />
        <Route path="library" element={<ProtectedRoute><Library /></ProtectedRoute>} />
        <Route path="album/:albumName" element={<ProtectedRoute><Album /></ProtectedRoute>} />
        <Route path="upload" element={<ProtectedRoute><Upload /></ProtectedRoute>} />
        <Route path="radio" element={<ProtectedRoute><Radio /></ProtectedRoute>} />
        <Route path="playlists" element={<ProtectedRoute><Playlists /></ProtectedRoute>} />
        <Route path="playlists/:playlistId" element={<ProtectedRoute><PlaylistDetail /></ProtectedRoute>} />
        <Route path="profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        {/* Route 404 - à créer plus tard */}
        <Route path="*" element={<div className="container mx-auto px-4 py-8"><h1>Page non trouvée</h1></div>} />
      </Route>
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppWithSync />
      </Router>
    </AuthProvider>
  );
}

export default App
