import { useState, useEffect } from 'react';
import { fetchFromSource } from '../utils/api.js';
import { useNavigate } from 'react-router-dom';

const Explore = () => {
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState('anime'); // 'anime' or 'genre'
  const [allAnimeList, setAllAnimeList] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [genres, setGenres] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState(null);
  const [genrePage, setGenrePage] = useState(1);
  const [totalGenrePages, setTotalGenrePages] = useState(1);

  const itemsPerPage = 20;

  useEffect(() => {
    document.title = "Explore - HisiNime v2";
    if (currentView === 'anime') {
      loadAnime();
    } else {
      loadGenres();
    }
  }, [currentView]);

  const processAnimeData = (result, source) => {
    let animeList = [];

    if (source === "OtakuDesu") {
      if (result?.data?.data?.list && Array.isArray(result.data.data.list)) {
        for (const group of result.data.data.list) {
          if (group.animeList && Array.isArray(group.animeList)) {
            for (const anime of group.animeList) {
              animeList.push({ ...anime, source });
            }
          }
        }
      }
    } else {
      if (result?.data?.data?.list && Array.isArray(result.data.data.list)) {
        for (const group of result.data.data.list) {
          if (group.animeList && Array.isArray(group.animeList)) {
            for (const anime of group.animeList) {
              animeList.push({ ...anime, source });
            }
          }
        }
      } else if (result?.data?.data?.list?.animeList && Array.isArray(result.data.data.list.animeList)) {
        for (const anime of result.data.data.list.animeList) {
          animeList.push({ ...anime, source });
        }
      } else if (result?.data?.data?.animeList && Array.isArray(result.data.data.animeList)) {
        for (const anime of result.data.data.animeList) {
          animeList.push({ ...anime, source });
        }
      }
    }

    return animeList;
  };

  const processGenreData = (result, source) => {
    let animeList = [];

    if (source === "OtakuDesu") {
      const rawAnimeList = result.data?.data?.anime || [];
      animeList = rawAnimeList.map(anime => ({ ...anime, animeId: anime.slug, source }));
    } else if (source === "Samehadaku") {
      const rawAnimeList = result.data?.data?.animeList || [];
      animeList = rawAnimeList.map(anime => ({ ...anime, animeId: anime.animeId, source }));
    }

    return animeList;
  };

  const loadAnime = async () => {
    setLoading(true);
    try {
      const otakuPromise = fetchFromSource("OtakuDesu", "allanime").then(result => ({ result, source: "OtakuDesu" })).catch(err => ({ failed: true, source: "OtakuDesu", error: err }));
      const samePromise = fetchFromSource("Samehadaku", "allanime").then(result => ({ result, source: "Samehadaku" })).catch(err => ({ failed: true, source: "Samehadaku", error: err }));

      const raceResult = await Promise.race([otakuPromise, samePromise]);

      let animeList = [];
      if (!raceResult.failed) {
        animeList = processAnimeData(raceResult.result, raceResult.source);
      }

      const remainingPromise = raceResult.source === "OtakuDesu" ? samePromise : otakuPromise;
      const remainingResult = await remainingPromise;

      if (!remainingResult.failed) {
        const secondAnimeList = processAnimeData(remainingResult.result, remainingResult.source);
        animeList = [...animeList, ...secondAnimeList];
      }

      setAllAnimeList(animeList);
      setCurrentPage(1);
    } catch (error) {
      console.error("Failed to load anime:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadGenres = async () => {
    try {
      const otakuGenres = await fetchFromSource("OtakuDesu", "genre");
      const genreList = otakuGenres?.data?.data || [];
      setGenres(genreList);
    } catch (error) {
      console.error("Failed to load genres:", error);
    }
  };

  const loadGenreAnime = async (slug, page = 1) => {
    setLoading(true);
    try {
      const [otakuResult, sameResult] = await Promise.all([
        loadGenreAnimePage(slug, "OtakuDesu", page),
        loadGenreAnimePage(slug, "Samehadaku", page)
      ]);

      const animeList = [...otakuResult.animeList, ...sameResult.animeList];
      setAllAnimeList(animeList);
      setGenrePage(page);

      const otakuPagination = otakuResult.pagination;
      const samePagination = sameResult.pagination;
      const otakuTotalPages = otakuPagination ? (otakuPagination.last_visible_page || otakuPagination.totalPages) : 1;
      const sameTotalPages = samePagination ? (samePagination.last_visible_page || samePagination.totalPages) : 1;
      setTotalGenrePages(Math.max(otakuTotalPages, sameTotalPages));
    } catch (error) {
      console.error("Failed to load genre anime:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadGenreAnimePage = async (slug, source, page) => {
    const endpointBase = source === "OtakuDesu" ? `genre/${slug}` : `genres/${slug}`;
    const endpoint = `${endpointBase}?page=${page}`;
    const result = await fetchFromSource(source, endpoint);
    const animeList = processGenreData(result, source);
    const pagination = result.data?.pagination;
    return { animeList, pagination };
  };

  const handleGenreClick = (genre) => {
    setSelectedGenre(genre.slug);
    loadGenreAnime(genre.slug, 1);
  };

  const handleViewChange = (view) => {
    setCurrentView(view);
    setSelectedGenre(null);
    setAllAnimeList([]);
    setCurrentPage(1);
    setGenrePage(1);
  };

  const handleAnimeClick = (anime) => {
    const idKey = "animeId";
    const idValue = anime[idKey];
    if (!idValue) return;
    const lastPart = idValue.replace(/\/+$/, "").split("/").pop();
    const navPath = anime.source === "OtakuDesu" ? `/anime/otakudesu/detail?id=${lastPart}` : `/anime/samehadaku/detail?id=${idValue}`;
    navigate(navPath);
  };

  const createAnimeCard = (anime) => {
    const idKey = "animeId";
    const idValue = anime[idKey];
    if (!idValue) return null;
    const episodeInfo = anime.episode_count ? `Episode ${anime.episode_count}` : (anime.type ? anime.type : '');
    const badgeClass = anime.source === "OtakuDesu" ? "bg-gradient-to-r from-purple-500 to-pink-500" : "bg-gradient-to-r from-blue-500 to-green-500";

    return (
      <div
        key={idValue}
        className="card cursor-pointer bg-gray-800 rounded-lg p-4 hover:bg-gray-700 transition-all duration-300 shadow-lg hover:shadow-xl flex flex-col"
        onClick={() => handleAnimeClick(anime)}
        role="button"
        tabIndex={0}
        aria-label={`View details for ${anime.title}`}
      >
        <div className="relative">
          {anime.poster ? (
            <img src={anime.poster} alt={anime.title} className="w-full h-32 object-cover rounded-lg mb-3" />
          ) : (
            <div className="w-full h-32 bg-gray-700 rounded-lg mb-3 flex items-center justify-center">
              <i className="fas fa-image text-gray-500 text-2xl"></i>
            </div>
          )}
          {episodeInfo && (
            <span className={`absolute top-2 right-2 rounded-full ${badgeClass} text-white text-xs px-2 py-1 font-semibold shadow-lg`}>
              {episodeInfo}
            </span>
          )}
        </div>
        <div className="flex flex-col flex-1">
          <h3 className="font-bold text-sm mb-2 line-clamp-2 text-white" title={anime.title}>
            {anime.title}
          </h3>
          <span className="text-xs text-gray-400">From {anime.source}</span>
        </div>
      </div>
    );
  };

  const displayPage = (page) => {
    const start = (page - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const pageAnime = allAnimeList.slice(start, end);
    const totalPages = Math.ceil(allAnimeList.length / itemsPerPage);

    return (
      <>
        <div className="grid-responsive-2x2">
          {pageAnime.map(createAnimeCard)}
        </div>
        {totalPages > 1 && (
          <div className="flex justify-center mt-4 gap-2">
            <button
              className={`btn-secondary text-sm px-3 py-2 ${page === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={page === 1}
              onClick={() => setCurrentPage(page - 1)}
            >
              Previous
            </button>
            <span className="text-white text-sm px-3 py-2">Page {page} of {totalPages}</span>
            <button
              className={`btn-secondary text-sm px-3 py-2 ${page === totalPages ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={page === totalPages}
              onClick={() => setCurrentPage(page + 1)}
            >
              Next
            </button>
          </div>
        )}
      </>
    );
  };

  const displayGenrePage = () => {
    return (
      <>
        <div className="grid-responsive-2x2">
          {allAnimeList.map(createAnimeCard)}
        </div>
        {totalGenrePages > 1 && (
          <div className="flex justify-center mt-4 gap-2">
            <button
              className={`btn-secondary text-sm px-3 py-2 ${genrePage === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={genrePage === 1}
              onClick={() => {
                const newPage = genrePage - 1;
                setGenrePage(newPage);
                loadGenreAnime(selectedGenre, newPage);
              }}
            >
              Previous
            </button>
            <span className="text-white text-sm px-3 py-2">Genre Page {genrePage} of {totalGenrePages}</span>
            <button
              className={`btn-secondary text-sm px-3 py-2 ${genrePage >= totalGenrePages ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={genrePage >= totalGenrePages}
              onClick={() => {
                const newPage = genrePage + 1;
                setGenrePage(newPage);
                loadGenreAnime(selectedGenre, newPage);
              }}
            >
              Next
            </button>
          </div>
        )}
      </>
    );
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="nav-bar w-screen p-4">
        <div className="flex flex-col items-center gap-4 max-w-4xl mx-auto">
          <h1 className="text-gradient font-bold text-xl md:text-2xl text-center">Explore Anime</h1>
          <div className="flex gap-2">
            <button
              className={`btn-primary ${currentView === 'anime' ? 'active' : ''}`}
              onClick={() => handleViewChange('anime')}
            >
              Anime
            </button>
            <button
              className={`btn-secondary ${currentView === 'genre' ? 'active' : ''}`}
              onClick={() => handleViewChange('genre')}
            >
              Genre
            </button>
          </div>
        </div>
      </div>
      <div className="content-section w-full max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {currentView === 'genre' && (
            <div className="md:col-span-1 bg-gray-800 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-4 text-gradient">Genres</h3>
              <div className="space-y-2">
                {genres.length === 0 ? (
                  <>
                    <div className="animate-pulse rounded bg-gray-700 h-8"></div>
                    <div className="animate-pulse rounded bg-gray-700 h-8"></div>
                  </>
                ) : (
                  genres.map(genre => (
                    <button
                      key={genre.slug}
                      className={`btn-secondary w-full text-left text-sm px-3 py-2 genre-btn hover:bg-gray-700 transition-colors ${selectedGenre === genre.slug ? 'active' : ''}`}
                      onClick={() => handleGenreClick(genre)}
                    >
                      {genre.name}
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
          <div className={`bg-gray-800 rounded-lg p-6 ${currentView === 'genre' ? 'md:col-span-3' : 'md:col-span-4'}`}>
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              </div>
            ) : allAnimeList.length === 0 ? (
              <div className="text-center text-gray-400 py-8">
                {currentView === 'genre' && !selectedGenre ? (
                  <>
                    <i className="fas fa-list text-4xl mb-4"></i>
                    <p>Select a genre to explore anime</p>
                  </>
                ) : (
                  <>
                    <i className="fas fa-exclamation-triangle text-4xl mb-4"></i>
                    <p>Failed to load anime.</p>
                  </>
                )}
              </div>
            ) : currentView === 'anime' ? (
              displayPage(currentPage)
            ) : (
              displayGenrePage()
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Explore;
