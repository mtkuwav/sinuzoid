/// <reference types="vite-plugin-svgr/client" />

import { BrowserRouter as Router, Routes, Route } from 'react-router';
import './App.css'

import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Home from './pages/Home';
import Discover from './pages/Discover';
import Library from './pages/Library';
import Radio from './pages/Radio';
import Playlists from './pages/Playlists';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';

function App() {

  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Routes publiques */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Routes protégées */}
          <Route path="/" element={<Layout />}>
            <Route index element={<ProtectedRoute><Home /></ProtectedRoute>} />
            <Route path="discover" element={<ProtectedRoute><Discover /></ProtectedRoute>} />
            <Route path="library" element={<ProtectedRoute><Library /></ProtectedRoute>} />
            <Route path="radio" element={<ProtectedRoute><Radio /></ProtectedRoute>} />
            <Route path="playlists" element={<ProtectedRoute><Playlists /></ProtectedRoute>} />
            <Route path="profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            {/* Route 404 - à créer plus tard */}
            <Route path="*" element={<div className="container mx-auto px-4 py-8"><h1>Page non trouvée</h1></div>} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App
