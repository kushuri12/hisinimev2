import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { fetchFromSource } from '../utils/api.js';

const Search = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState(searchParams.get('q') || '');

  useEffect(() => {
    document.title = "Search - HisiNime v2";
    if (query) {
      performSearch(query);
    } else {
      setLoading(false);
    }
  }, [query]);

  const performSearch = async (searchQuery) => {
    setLoading(true);
    try {
      const searchResults = [];

      // Search OtakuDesu
      const resultOtaku = await fetchFromSource("OtakuDesu", `search/${encodeURIComponent(searchQuery)}`);
      const resultsOtaku = resultOtaku?.data?.search_results || [];
      searchResults.push(...resultsOtaku.map(anime => ({ ...anime, source: "OtakuDesu" })));

      // Search Samehadaku - Load all pages
      const resultsSame = [];
      let page = 1;
      while (true) {
        const resultSame = await fetchFromSource("Samehadaku", `search?q=${encodeURIComponent(searchQuery)}&page=${page}`);
        const pageResults = resultSame?.data?.data?.animeList || [];
        resultsSame.push(...pageResults);

        const pagination = resultSame?.data?.pagination;
        if (!pagination || !pagination.hasNextPage) break;
        page++;
      }
      searchResults.push(...resultsSame.map(anime => ({ ...anime, source: "Samehadaku" })));

      // Shuffle the combined results
      const shuffled = searchResults.sort(() => Math.random() - 0.5);
      setResults(shuffled);
    } catch (error) {
      console.error("Failed to fetch search results:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnimeClick = (anime) => {
    const source = anime.source;
    const idKey = source === "OtakuDesu" ? "slug" : "animeId";
    const lastPart = anime[idKey].replace(/\/+$/, "").split("/").pop();
    const navPath = source === "OtakuDesu" ? `/anime/otakudesu/detail?id=${lastPart}` : `/anime/samehadaku/detail?id=${anime[idKey]}`;
    navigate(navPath);
  };

  const createAnimeCard = (anime) => {
    const source = anime.source;
    const episodeBadge = source === "OtakuDesu"
      ? `Episode ${anime.episode_count !== undefined ? anime.episode_count : "?"}`
      : (anime.type || "N/A");

    const badgeClass = source === "OtakuDesu"
      ? "bg-gradient-to-r from-purple-500 to-pink-500"
      : "bg-gradient-to-r from-blue-500 to-green-500";

    return (
      <div
        key={`${anime.id || anime.slug}-${source}`}
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
      <div className="w-full flex justify-start p-4 bg-gray-900 shadow-sm z-10">
        <button
          onClick={() => window.history.back()}
          className="bg-transparent backdrop-blur-sm text-purple-300 px-4 py-2 rounded font-semibold hover:bg-purple-600 transition"
        >
          <i className="fas fa-arrow-left"></i>
        </button>
      </div>

      <div className="flex flex-col items-center p-5 bg-gray-900 rounded shadow">
        {!query ? (
          <div className="w-full flex flex-col items-center mb-6">
            <h2 className="text-purple-300 font-bold text-2xl text-center mb-1">
              Pencarian
            </h2>
            <p className="text-gray-300 text-center text-sm">
              Tidak ada query pencarian yang diberikan.
            </p>
          </div>
        ) : (
          <>
            <div className="w-full flex flex-col items-center mb-6">
              <h2 className="text-purple-300 font-bold text-2xl text-center mb-1">
                Hasil Pencarian
              </h2>
              <p className="text-gray-300 text-center text-sm">
                "{query}"
              </p>
            </div>

            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 w-full max-w-7xl">
                {results.map(createAnimeCard)}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Search;
