/// <reference types="vite-plugin-svgr/client" />

import { BrowserRouter as Router, Routes, Route } from 'react-router';
import './App.css'

import Layout from './components/layout/Layout';
import Home from './pages/Home';
import Discover from './pages/Discover';
import Library from './pages/Library';
import Radio from './pages/Radio';
import Playlists from './pages/Playlists';

function App() {

  return (
    <Router>
      

      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="discover" element={<Discover />} />
          <Route path="library" element={<Library />} />
          <Route path="radio" element={<Radio />} />
          <Route path="playlists" element={<Playlists />} />
          {/* Route 404 - à créer plus tard */}
          <Route path="*" element={<div className="container mx-auto px-4 py-8"><h1>Page non trouvée</h1></div>} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App
