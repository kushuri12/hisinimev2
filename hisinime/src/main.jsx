import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './index.css'
import Home from './pages/Home.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Explore from './pages/Explore.jsx'
import Favorite from './pages/Favorite.jsx'
import Search from './pages/Search.jsx'
import History from './pages/History.jsx'
import OtakuDesuDetail from './pages/OtakuDesuDetail.jsx'
import OtakuDesuWatch from './pages/OtakuDesuWatch.jsx'
import SamehadakuDetail from './pages/SamehadakuDetail.jsx'
import SamehadakuWatch from './pages/SamehadakuWatch.jsx'
import Navbar from './components/Navbar.jsx'
import { useAuth } from './hooks/useAuth.js'

// App component to handle routing and navbar
function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-900 has-top-nav">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/favorite" element={<Favorite />} />
          <Route path="/search" element={<Search />} />
          <Route path="/history" element={<History />} />
          {/* Anime detail and watch routes */}
          <Route path="/anime/otakudesu/detail" element={<OtakuDesuDetail />} />
          <Route path="/anime/otakudesu/watch" element={<OtakuDesuWatch />} />
          <Route path="/anime/samehadaku/detail" element={<SamehadakuDetail />} />
          <Route path="/anime/samehadaku/watch" element={<SamehadakuWatch />} />
          {/* Add more routes as needed */}
        </Routes>
      </div>
    </Router>
  );
}

createRoot(document.getElementById('root')).render(<App />);
