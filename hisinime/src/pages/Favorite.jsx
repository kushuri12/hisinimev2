import { useState, useEffect } from 'react';
import { useFavorites } from '../hooks/useStorage.js';
import { fetchFromSource } from '../utils/api.js';
import { useNavigate } from 'react-router-dom';

const Favorite = () => {
  const navigate = useNavigate();
  const { favorites } = useFavorites();
  const [favoriteAnime, setFavoriteAnime] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = "Favorite - HisiNime v2";
    loadFavoriteAnime();
  }, [favorites]);

  const loadFavoriteAnime = async () => {
    if (!favorites || favorites.length === 0) {
      setLoading(false);
      return;
    }

    setLoading(true);

    const fetchPromises = favorites.map(async (fav) => {
      try {
        // Handle migration: old favorites are strings or objects without source
        let id, source;
        if (typeof fav === 'string') {
          // Old format: just id, assume Samehadaku for migration
          id = fav;
          source = 'Samehadaku';
        } else if (fav && typeof fav === 'object' && fav.id && fav.source) {
          // New format: {id, source}
          id = fav.id;
          source = fav.source;
        } else if (fav && typeof fav === 'object' && fav.id && !fav.source) {
          // Migration case: object with id but no source, assume Samehadaku
          id = fav.id;
          source = 'Samehadaku';
        } else {
          console.warn('Invalid favorite format:', fav);
          return null;
        }

        // Fetch anime data by ID and source
        const result = await fetchFromSource(source, `anime/${encodeURIComponent(id)}`);

        if (!result.data) {
          console.warn('Anime data not found:', id);
          return null;
        }

        const data = result.data.data;
        return { id, source, data };
      } catch (err) {
        console.error('Failed to load favorite anime:', fav.id || fav, err);
        return null;
      }
    });

    const results = await Promise.all(fetchPromises);
    const validResults = results.filter(result => result !== null);
    setFavoriteAnime(validResults);
    setLoading(false);
  };

  const handleAnimeClick = (id, source) => {
    navigate(`/anime/${source.toLowerCase()}/detail?id=${id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center p-5">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center p-5">
      <div className="w-full md:w-[100vh] bg-gray-900 mt-3 rounded shadow p-5">
        <h1 className="text-gradient font-bold text-xl md:text-2xl text-center mb-5">Favorite</h1>

        {!favorites || favorites.length === 0 ? (
          <p className="text-gray-300">Belum ada anime favorit nih...</p>
        ) : (
          <ul className="flex flex-col gap-2 w-full">
            {favoriteAnime.map(({ id, source, data }) => (
              <li
                key={id}
                className="flex items-center justify-between bg-gray-800 px-3 py-2 rounded hover:bg-gray-700 transition cursor-pointer"
                onClick={() => handleAnimeClick(id, source)}
              >
                <div className="flex items-center gap-3">
                  <img
                    src={data.poster}
                    alt={data.title}
                    width={50}
                    className="rounded-md"
                  />
                  <div className="flex flex-col">
                    <span className="text-white">{data.title || data.english}</span>
                    <span className="text-sm text-gray-300">
                      Episode: {source === "OtakuDesu" ? data.episode_count : data.episodes}
                    </span>
                    <span className="text-xs text-gray-400">From {source}</span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Favorite;
