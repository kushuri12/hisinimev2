import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { fetchFromSource } from '../utils/api.js';
import { useStorage } from '../hooks/useStorage.js';

const OtakuDesuDetail = () => {
  const [searchParams] = useSearchParams();
  const id = searchParams.get('id');
  const navigate = useNavigate();
  const { addFavorite, removeFavorite, getFavorites } = useStorage();
  const [anime, setAnime] = useState(null);
  const [episodes, setEpisodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFavorited, setIsFavorited] = useState(false);
  const [expandedSynopsis, setExpandedSynopsis] = useState(false);

  useEffect(() => {
    loadAnimeDetail();
  }, [id]);

  useEffect(() => {
    if (anime) {
      checkFavoriteStatus();
    }
  }, [anime]);

  const loadAnimeDetail = async () => {
    try {
      setLoading(true);
      const data = await fetchFromSource("OtakuDesu", `anime/${id}`);

      if (data?.data?.data) {
        const animeData = data.data.data;
        setAnime(animeData);
        setEpisodes(animeData.episode_lists || []);
        document.title = `${animeData.title} - HisiNime v2`;
      }
    } catch (error) {
      console.error("Failed to load anime detail:", error);
    } finally {
      setLoading(false);
    }
  };

  const checkFavoriteStatus = async () => {
    const favs = await getFavorites();
    const isFav = favs.some(fav => fav.id === id && fav.source === "OtakuDesu");
    setIsFavorited(isFav);
  };

  const handleFavoriteToggle = async () => {
    if (isFavorited) {
      await removeFavorite(id, "OtakuDesu");
      setIsFavorited(false);
    } else {
      await addFavorite(id, "OtakuDesu", anime.title, anime.poster);
      setIsFavorited(true);
    }
  };

  const handleEpisodeClick = (episode) => {
    navigate(`/anime/otakudesu/watch?id=${id}&episode=${episode.slug}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-lg font-medium">Memuat detail anime...</p>
        </div>
      </div>
    );
  }

  if (!anime) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <i className="fas fa-exclamation-triangle text-4xl text-red-400 mb-4"></i>
          <p className="text-lg">Detail anime tidak tersedia.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header Section */}
      <div className="flex items-center justify-between mb-6 p-4">
        <button
          className="btn-secondary flex items-center gap-2 z-10 relative"
          onClick={() => navigate(-1)}
        >
          <i className="fas fa-arrow-left"></i>
          <span className="hidden sm:inline">Kembali</span>
        </button>
        <div className="text-center flex-1">
          <h1 className="text-gradient font-bold text-xl md:text-2xl">{anime.title}</h1>
          <p className="text-sm text-blue-400 font-semibold">OtakuDesu</p>
        </div>
        <div className="w-20"></div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 px-4 mb-6">
        {/* Poster Section */}
        <div className="lg:col-span-1">
          <div className="card p-4">
            <img
              src={anime.poster}
              alt={anime.title}
              className="w-full rounded-lg shadow-lg mb-4"
            />
            <button
              onClick={handleFavoriteToggle}
              className={`group relative w-full overflow-hidden rounded-xl bg-gradient-to-r ${
                isFavorited ? 'from-red-500 to-pink-500' : 'from-blue-500 to-blue-600'
              } p-4 text-white shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]`}
            >
              <div className="flex items-center justify-center gap-3">
                <div className="relative">
                  <i className={`fas fa-heart text-2xl transition-all duration-300 ${
                    isFavorited ? 'scale-110 text-red-200' : 'group-hover:scale-110'
                  }`}></i>
                  {isFavorited && (
                    <div className="absolute inset-0 animate-ping rounded-full bg-red-300 opacity-20"></div>
                  )}
                </div>
                <div className="flex flex-col items-start">
                  <span className="font-semibold text-lg">
                    {isFavorited ? "Favorit" : "Tambah ke"}
                  </span>
                  <span className="text-sm opacity-90">
                    {isFavorited ? "Hapus dari favorit" : "Daftar Favorit"}
                  </span>
                </div>
              </div>
              <div className="absolute inset-0 bg-white opacity-0 transition-opacity duration-300 group-hover:opacity-10"></div>
            </button>
          </div>
        </div>

        {/* Details Section */}
        <div className="lg:col-span-2 space-y-4">
          {/* Synopsis Card */}
          <div className="card p-4">
            <h3 className="font-semibold text-blue-300 mb-3 flex items-center gap-2">
              <i className="fas fa-book"></i>
              Sinopsis
            </h3>
            <div className="text-justify text-sm leading-relaxed text-gray-300">
              <p
                className={`${expandedSynopsis ? '' : 'line-clamp-3'}`}
              >
                {anime.synopsis || 'Tidak ada sinopsis'}
              </p>
              <button
                onClick={() => setExpandedSynopsis(!expandedSynopsis)}
                className="text-blue-400 hover:underline text-sm mt-2"
              >
                {expandedSynopsis ? 'Sembunyikan' : 'Selengkapnya'}
              </button>
            </div>
          </div>

          {/* Info Card */}
          <div className="card p-4">
            <h3 className="font-semibold text-blue-300 mb-3 flex items-center gap-2">
              <i className="fas fa-info-circle"></i>
              Informasi Anime
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Japanese:</span>
                <span className="text-white">{anime.japanese_title || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Status:</span>
                <span className="text-white">{anime.status || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Episode:</span>
                <span className="text-white">{anime.episode_count || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Skor:</span>
                <span className="text-white">{anime.rating || "N/A"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Studio:</span>
                <span className="text-white">{anime.studio || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Tipe:</span>
                <span className="text-white">{anime.type || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Durasi:</span>
                <span className="text-white">{anime.duration || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Rilis:</span>
                <span className="text-white">{anime.release_date || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Genres Card */}
          <div className="card p-4">
            <h3 className="font-semibold text-blue-300 mb-3 flex items-center gap-2">
              <i className="fas fa-tags"></i>
              Genre
            </h3>
            <div className="flex flex-wrap gap-2">
              {anime.genres?.map(g => (
                <span key={g.name} className="badge">{g.name}</span>
              )) || <span className="text-gray-400">Tidak ada genre</span>}
            </div>
          </div>
        </div>
      </div>

      {/* Episodes Section */}
      <div className="px-4">
        <h2 className="text-gradient font-bold text-xl mb-4">Daftar Episode</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
          {episodes.map((ep, index) => (
            <div
              key={`${ep.slug}-${index}`}
              className="h-auto p-3 cursor-pointer hover:bg-gray-800 transition-colors"
              onClick={() => handleEpisodeClick(ep)}
            >
              <div className="flex items-center gap-3">
                <img
                  src={anime.poster}
                  alt={anime.title}
                  className="w-16 h-12 object-cover rounded"
                />
                <div className="flex-1">
                  <p className="text-white font-medium text-sm">{ep.episode}</p>
                  <p className="text-xs text-gray-400">{anime.duration}</p>
                </div>
                <i className="fas fa-play text-blue-400"></i>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OtakuDesuDetail;
