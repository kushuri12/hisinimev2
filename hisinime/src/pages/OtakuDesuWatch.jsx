import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { fetchFromSource } from '../utils/api.js';
import { useStorage } from '../hooks/useStorage.js';

const OtakuDesuWatch = () => {
  const [searchParams] = useSearchParams();
  const id = searchParams.get('id');
  const episodeSlug = searchParams.get('episode');
  const navigate = useNavigate();
  const { getBookmarkTime, saveBookmarkTime, getLastResolution, saveLastResolution, saveHistory } = useStorage();
  const [episode, setEpisode] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedServer, setSelectedServer] = useState('main');
  const [servers, setServers] = useState([]);
  const [bookmarkTime, setBookmarkTime] = useState({ minutes: 0, seconds: 0 });

  useEffect(() => {
    loadEpisodeData();
  }, [episodeSlug]);

  const loadEpisodeData = async () => {
    try {
      setLoading(true);
      const result = await fetchFromSource("OtakuDesu", `episode/${episodeSlug}`);

      if (result?.data?.data) {
        const episodeData = result.data.data;
        setEpisode(episodeData);

        // Set up servers
        const serverList = [{ id: 'main', name: 'Server Utama', url: episodeData.stream_url }];
        episodeData.download_urls?.mp4?.forEach(s => {
          s.urls?.forEach(u => {
            if (u.provider === "Pdrain" || u.provider === "PDrain" || u.provider === "Acefile") {
              serverList.push({
                id: `${s.resolution}-${u.provider}`,
                name: `${s.resolution} - ${u.provider}`,
                url: u.url
              });
            }
          });
        });
        setServers(serverList);

        // Load last resolution
        const lastRes = await getLastResolution(id);
        if (lastRes && serverList.some(s => s.id === lastRes)) {
          setSelectedServer(lastRes);
        }

        // Load bookmark time
        const savedTime = await getBookmarkTime(episodeSlug);
        if (savedTime) {
          setBookmarkTime(savedTime);
        }

        // Save to history
        await saveHistory(
          id,
          episodeSlug,
          episodeData.episode || 'Anime',
          episodeData.episode,
          'OtakuDesu',
          episodeData.poster || ''
        );

        document.title = `${episodeData.anime_title || 'Anime'} - ${episodeData.episode} - HisiNime v2`;
      }
    } catch (error) {
      console.error("Failed to load episode:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleServerChange = async (serverId) => {
    setSelectedServer(serverId);
    await saveLastResolution(id, serverId);
  };

  const handleSaveBookmark = async () => {
    await saveBookmarkTime(episodeSlug, bookmarkTime);
    alert("Waktu berhasil disimpan!");
  };

  const handleNavigation = (direction) => {
    if (direction === 'prev' && episode.previous_episode) {
      navigate(`/anime/otakudesu/watch?id=${id}&episode=${episode.previous_episode.slug}`);
    } else if (direction === 'next' && episode.next_episode) {
      navigate(`/anime/otakudesu/watch?id=${id}&episode=${episode.next_episode.slug}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
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

  const currentServer = servers.find(s => s.id === selectedServer);

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
            {episode.anime_title || 'Anime'} - {episode.episode}
          </h1>
          <p className="text-sm text-blue-400 font-semibold mt-1">Streaming dari OtakuDesu</p>
        </div>
        <div className="w-20"></div>
      </div>

      {/* Video Player Section */}
      <div className="card p-4 mb-6">
        <iframe
          className="w-full aspect-video rounded-lg shadow-lg"
          src={currentServer?.url || ''}
          frameBorder="0"
          allowFullScreen
        ></iframe>
      </div>

      {/* Server Selection */}
      <div className="card p-4 mb-6">
        <h3 className="font-semibold text-purple-300 mb-3 flex items-center gap-2">
          <i className="fas fa-server"></i>
          Server Streaming
        </h3>
        <div className="flex flex-wrap gap-2">
          {servers.map(server => (
            <button
              key={server.id}
              onClick={() => handleServerChange(server.id)}
              className={`px-3 py-2 rounded transition-colors ${
                selectedServer === server.id
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-purple-600'
              }`}
            >
              {server.name}
            </button>
          ))}
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
              !episode.previous_episode ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            onClick={() => handleNavigation('prev')}
            disabled={!episode.previous_episode}
          >
            <i className="fas fa-chevron-left"></i>
            <span className="hidden sm:inline">Episode Sebelumnya</span>
          </button>
          <div className="text-center px-4">
            <p className="text-white font-medium">{episode.episode}</p>
            <p className="text-sm text-gray-400">dari {episode.anime_title || 'Anime'}</p>
          </div>
          <button
            className={`btn-secondary flex items-center gap-2 px-4 py-2 ${
              !episode.next_episode ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            onClick={() => handleNavigation('next')}
            disabled={!episode.next_episode}
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

export default OtakuDesuWatch;
