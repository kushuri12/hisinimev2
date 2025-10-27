import { useState, useEffect } from 'react';
import { fetchFromSource } from '../utils/api.js';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';

const Home = () => {
  const navigate = useNavigate();
  const { user, loginWithGoogle } = useAuth();
  const [completedAnime, setCompletedAnime] = useState([]);
  const [ongoingAnime, setOngoingAnime] = useState([]);
  const [loadingCompleted, setLoadingCompleted] = useState(true);
  const [loadingOngoing, setLoadingOngoing] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    document.title = "HisiNime v2";
    loadCompletedAnime();
    loadOngoingAnime();
  }, []);

  const loadCompletedAnime = async () => {
    setLoadingCompleted(true);
    try {
      const results = [];

      // Fetch from OtakuDesu
      const resultOtaku = await fetchFromSource("OtakuDesu", "complete-anime/1");
      const dataKeyOtaku = "completeAnimeData";
      if (resultOtaku?.data?.data?.[dataKeyOtaku]) {
        results.push(...resultOtaku.data.data[dataKeyOtaku].map(anime => ({ ...anime, source: "OtakuDesu" })));
      }

      // Fetch from Samehadaku
      const resultSame = await fetchFromSource("Samehadaku", "complete-anime/1");
      const dataKeySame = "animeList";
      if (resultSame?.data?.data?.[dataKeySame]) {
        results.push(...resultSame.data.data[dataKeySame].map(anime => ({ ...anime, source: "Samehadaku" })));
      }

      // Shuffle the combined results
      const shuffled = results.sort(() => Math.random() - 0.5);
      setCompletedAnime(shuffled);
    } catch (error) {
      console.error("Failed to load completed anime:", error);
    } finally {
      setLoadingCompleted(false);
    }
  };

  const loadOngoingAnime = async () => {
    setLoadingOngoing(true);
    try {
      const results = [];

      // Fetch from OtakuDesu
      const resultOtaku = await fetchFromSource("OtakuDesu", "ongoing-anime");
      const dataKeyOtaku = "ongoingAnimeData";
      if (resultOtaku?.data?.data?.[dataKeyOtaku]) {
        results.push(...resultOtaku.data.data[dataKeyOtaku].map(anime => ({ ...anime, source: "OtakuDesu" })));
      }

      // Fetch from Samehadaku
      const resultSame = await fetchFromSource("Samehadaku", "ongoing-anime");
      const dataKeySame = "animeList";
      if (resultSame?.data?.data?.[dataKeySame]) {
        results.push(...resultSame.data.data[dataKeySame].map(anime => ({ ...anime, source: "Samehadaku" })));
      }

      // Shuffle the combined results
      const shuffled = results.sort(() => Math.random() - 0.5);
      setOngoingAnime(shuffled);
    } catch (error) {
      console.error("Failed to load ongoing anime:", error);
    } finally {
      setLoadingOngoing(false);
    }
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleAnimeClick = (anime) => {
    const source = anime.source;
    const idKey = source === "OtakuDesu" ? "slug" : "animeId";
    const navPath = source === "OtakuDesu" ? `/anime/otakudesu/detail?id=${anime[idKey]}` : `/anime/samehadaku/detail?id=${anime[idKey]}`;
    navigate(navPath);
  };

  const createAnimeCard = (anime, index) => {
    const source = anime.source;
    const episodeBadge = source === "OtakuDesu"
      ? `Episode ${anime.episode_count !== undefined ? anime.episode_count : "?"}`
      : (anime.type || "N/A");

    const badgeClass = source === "OtakuDesu"
      ? "bg-gradient-to-r from-purple-500 to-pink-500"
      : "bg-gradient-to-r from-blue-500 to-green-500";

    // Create unique key using title, source, and index as fallback
    const uniqueKey = `${anime.title}-${source}-${index}`;

    return (
      <div
        key={uniqueKey}
        className="card flex flex-col relative cursor-pointer"
        onClick={() => handleAnimeClick(anime)}
      >
        <img
          src={anime.poster}
          alt={anime.title}
          className="w-full h-48 object-cover rounded-t-lg"
        />
        <span className={`absolute top-2 right-2 rounded-full ${badgeClass} text-white text-[12px] px-3 py-1 font-semibold shadow-lg`}>
          {episodeBadge}
        </span>
        <div className="flex flex-col items-start p-4 flex-1">
          <h3 className="font-bold text-sm mb-2 line-clamp-2 text-white">{anime.title}</h3>
          <span className="text-xs text-gray-400">From {source}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="content-section w-full max-w-6xl mx-auto">
        <div className="flex flex-col items-center gap-4 mb-6">
          <h1 className="text-gradient font-bold text-xl md:text-2xl text-center">HisiNime v2</h1>

          <div className="flex items-center gap-2 w-full max-w-md">
            <input
              className="input-modern flex-1"
              type="text"
              placeholder="Cari anime..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
            />
            <button
              onClick={handleSearch}
              className="btn-primary"
            >
              <i className="fa-solid fa-magnifying-glass"></i>
            </button>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-gradient font-bold text-xl mb-4">Sudah Tamat</h2>
          <div className="flex gap-3 justify-start overflow-x-auto pb-2">
            {loadingCompleted ? (
              <div className="flex items-center justify-center h-64 w-full">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              completedAnime.map((anime, index) => (
                <div key={`${anime.title}-${anime.source}-${index}`} className="flex-shrink-0 w-40 md:w-56">
                  {createAnimeCard(anime, index)}
                </div>
              ))
            )}
          </div>
        </div>

        <div>
          <h2 className="text-gradient font-bold text-xl mb-4">Sedang Tayang</h2>
          <div className="grid-responsive-small">
            {loadingOngoing ? (
              <div className="flex items-center justify-center h-64 col-span-full">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              ongoingAnime.map(createAnimeCard)
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
