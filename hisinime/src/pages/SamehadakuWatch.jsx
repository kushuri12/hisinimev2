import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { fetchFromSource } from '../utils/api.js';
import { useStorage } from '../hooks/useStorage.js';

const SamehadakuWatch = () => {
  const [searchParams] = useSearchParams();
  const id = searchParams.get('id');
  const episodeId = searchParams.get('episode');
  const navigate = useNavigate();
  const iframeRef = useRef(null);
  const { getBookmarkTime, saveBookmarkTime, getPreferredResolution, savePreferredResolution, saveHistory } = useStorage();
  const [episode, setEpisode] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qualities, setQualities] = useState([]);
  const [selectedQuality, setSelectedQuality] = useState(null);
  const [servers, setServers] = useState([]);
  const [selectedServer, setSelectedServer] = useState(null);
  const [bookmarkTime, setBookmarkTime] = useState({ minutes: 0, seconds: 0 });

  useEffect(() => {
    loadEpisodeData();
  }, [episodeId]);

  const loadEpisodeData = async () => {
    try {
      setLoading(true);
      const result = await fetchFromSource("Samehadaku", `episode/${episodeId}`);

      if (result?.data?.data) {
        const episodeData = result.data.data;
        setEpisode(episodeData);

        // Set qualities
        if (episodeData.server?.qualities) {
          setQualities(episodeData.server.qualities);
          // Load preferred resolution
          const savedRes = await getPreferredResolution();
          const defaultQuality = episodeData.server.qualities.find(q => q.title.includes("720")) ||
                                episodeData.server.qualities.find(q => q.title === savedRes) ||
                                episodeData.server.qualities[0];
          setSelectedQuality(defaultQuality);
          // Also set servers for the default quality
          setServers(defaultQuality.serverList || []);
          setSelectedServer(defaultQuality.serverList?.[0] || null);
        }

        // Load bookmark time
        const savedTime = await getBookmarkTime(episodeId);
        if (savedTime) {
          setBookmarkTime(savedTime);
        }

        // Save to history
        await saveHistory(
          id,
          episodeId,
          episodeData.title || 'Anime',
          episodeData.title,
          'Samehadaku',
          episodeData.poster || ''
        );

        document.title = `${episodeData.animeTitle || 'Anime'} - ${episodeData.title} - HisiNime v2`;
      }
    } catch (error) {
      console.error("Failed to load episode:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleQualityChange = async (quality) => {
    setSelectedQuality(quality);
    await savePreferredResolution(quality.title);
    setServers(quality.serverList || []);
    setSelectedServer(quality.serverList?.[0] || null);
  };

  const handleServerChange = async (server) => {
    setSelectedServer(server);
    // If serverId is already a URL, use it directly
    if (server.serverId.startsWith("http")) {
      if (iframeRef.current) {
        iframeRef.current.src = server.serverId;
      }
    } else {
      // Fetch the actual URL from server ID via API
      try {
        const response = await fetch(`https://www.sankavollerei.com/anime/samehadaku/server/${server.serverId}`);
        const json = await response.json();
        if (json?.data?.url) {
          if (iframeRef.current) {
            iframeRef.current.src = json.data.url;
          }
        } else {
          alert("URL streaming tidak ditemukan.");
        }
      } catch (error) {
        console.error("Failed to load server:", error);
        alert("Gagal memuat server.");
      }
    }
  };

  const handleSaveBookmark = async () => {
    await saveBookmarkTime(episodeId, bookmarkTime);
    alert("Waktu berhasil disimpan!");
  };

  const handleNavigation = (direction) => {
    if (direction === 'prev' && episode.prevEpisode) {
      navigate(`/anime/samehadaku/watch?id=${id}&episode=${episode.prevEpisode.episodeId}`);
    } else if (direction === 'next' && episode.nextEpisode) {
      navigate(`/anime/samehadaku/watch?id=${id}&episode=${episode.nextEpisode.episodeId}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-lg font-medium">Memuat streaming...</p>
        </div>
      </div>
    );
  }

  if (!episode) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <i className="fas fa-exclamation-triangle text-4xl text-red-400 mb-4"></i>
          <p className="text-lg">Episode tidak tersedia.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      {/* Header Section */}
      <div className="flex items-center justify-between mb-6">
        <button
          className="btn-secondary flex items-center gap-2"
          onClick={() => navigate(-1)}
        >
          <i className="fas fa-arrow-left"></i>
          <span className="hidden sm:inline">Kembali</span>
        </button>
        <div className="text-center flex-1">
          <h1 className="text-gradient font-bold text-xl md:text-2xl leading-tight">
            {episode.animeTitle || 'Anime'} - {episode.title}
          </h1>
          <p className="text-sm text-purple-400 font-semibold mt-1">Streaming dari Samehadaku</p>
        </div>
        <div className="w-20"></div>
      </div>

      {/* Video Player Section */}
      <div className="card p-4 mb-6">
        {selectedServer?.serverId ? (
          <iframe
            ref={iframeRef}
            className="w-full aspect-video rounded-lg shadow-lg"
            src={selectedServer.serverId.startsWith("http") ? selectedServer.serverId : ""}
            frameBorder="0"
            allowFullScreen
          ></iframe>
        ) : (
          <div className="w-full aspect-video rounded-lg shadow-lg bg-gray-800 flex items-center justify-center">
            <div className="text-center text-gray-400">
              <i className="fas fa-play-circle text-4xl mb-2"></i>
              <p>Pilih server untuk mulai menonton</p>
            </div>
          </div>
        )}
      </div>

      {/* Controls Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Quality Selection */}
        <div className="card p-4">
          <h3 className="font-semibold text-purple-300 mb-3 flex items-center gap-2">
            <i className="fas fa-cog"></i>
            Kualitas Video
          </h3>
          <div className="flex flex-wrap gap-2">
            {qualities.map(quality => (
              <button
                key={quality.title}
                onClick={() => handleQualityChange(quality)}
                className={`px-3 py-2 rounded transition-colors ${
                  selectedQuality?.title === quality.title
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-purple-600'
                }`}
              >
                {quality.title}
              </button>
            ))}
          </div>
        </div>

        {/* Server Selection */}
        <div className="card p-4">
          <h3 className="font-semibold text-purple-300 mb-3 flex items-center gap-2">
            <i className="fas fa-server"></i>
            Server Streaming
          </h3>
          <div className="flex flex-wrap gap-2">
            {servers.map(server => (
              <button
                key={server.serverId}
                onClick={() => handleServerChange(server)}
                className={`px-3 py-2 rounded transition-colors ${
                  selectedServer?.serverId === server.serverId
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-purple-600'
                }`}
              >
                {server.title}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Episode Navigation */}
      <div className="card p-4 mb-6">
        <h3 className="font-semibold text-purple-300 mb-3 flex items-center gap-2">
          <i className="fas fa-list"></i>
          Navigasi Episode
        </h3>
        <div className="flex items-center justify-center gap-4">
          <button
            className={`btn-secondary flex items-center gap-2 px-4 py-2 ${
              !episode.prevEpisode ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            onClick={() => handleNavigation('prev')}
            disabled={!episode.prevEpisode}
          >
            <i className="fas fa-chevron-left"></i>
            <span className="hidden sm:inline">Episode Sebelumnya</span>
          </button>
          <div className="text-center px-4">
            <p className="text-white font-medium">Episode {episode.title}</p>
            <p className="text-sm text-gray-400">dari {episode.animeTitle || 'Anime'}</p>
          </div>
          <button
            className={`btn-secondary flex items-center gap-2 px-4 py-2 ${
              !episode.nextEpisode ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            onClick={() => handleNavigation('next')}
            disabled={!episode.nextEpisode}
          >
            <span className="hidden sm:inline">Episode Selanjutnya</span>
            <i className="fas fa-chevron-right"></i>
          </button>
        </div>
      </div>

      {/* Bookmark Time Feature */}
      <div className="card p-4">
        <h3 className="font-semibold text-purple-300 mb-3 flex items-center gap-2">
          <i className="fas fa-bookmark"></i>
          Bookmark Waktu
        </h3>
        <p className="text-sm text-gray-400 mb-3">Simpan waktu tonton untuk melanjutkan nanti</p>
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <div className="flex gap-2">
            <div className="flex flex-col">
              <label className="text-xs text-gray-400 mb-1">Menit</label>
              <input
                type="number"
                min="0"
                className="input-modern w-16 text-center"
                value={bookmarkTime.minutes}
                onChange={(e) => setBookmarkTime(prev => ({ ...prev, minutes: parseInt(e.target.value) || 0 }))}
              />
            </div>
            <div className="flex flex-col">
              <label className="text-xs text-gray-400 mb-1">Detik</label>
              <input
                type="number"
                min="0"
                max="59"
                className="input-modern w-16 text-center"
                value={bookmarkTime.seconds}
                onChange={(e) => setBookmarkTime(prev => ({ ...prev, seconds: parseInt(e.target.value) || 0 }))}
              />
            </div>
          </div>
          <button
            onClick={handleSaveBookmark}
            className="btn-primary flex items-center gap-2 px-4 py-2"
          >
            <i className="fas fa-save"></i>
            Simpan
          </button>
        </div>
        <p className="text-sm text-gray-400 mt-2">
          Waktu tersimpan: {bookmarkTime.minutes} menit {bookmarkTime.seconds} detik
        </p>
      </div>
    </div>
  );
};

export default SamehadakuWatch;
