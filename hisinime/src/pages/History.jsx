import { useState, useEffect } from 'react';
import { useHistory } from '../hooks/useStorage.js';
import { useNavigate } from 'react-router-dom';

const History = () => {
  const navigate = useNavigate();
  const { history, removeFromHistory } = useHistory();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = "Riwayat Tontonan - HisiNime v2";
    setLoading(false);
  }, [history]);

  const handleAnimeClick = (item) => {
    navigate(`/anime/${item.source.toLowerCase()}/watch?id=${item.animeId}&episode=${item.episodeId}`);
  };

  const handleRemove = async (index) => {
    await removeFromHistory(index);
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
        <h1 className="text-gradient font-bold text-xl md:text-2xl text-center mb-5">Riwayat Tontonan</h1>

        {!history || history.length === 0 ? (
          <p className="text-gray-300">Belum ada riwayat tontonan nih...</p>
        ) : (
          <ul className="flex flex-col gap-2 w-full">
            {history.map((item, index) => (
              <li
                key={`${item.animeId}-${item.episodeId}-${item.timestamp}`}
                className="flex items-center justify-between bg-gray-800 px-3 py-2 rounded hover:bg-gray-700 transition cursor-pointer"
              >
                <div
                  className="flex items-center gap-3 flex-1"
                  onClick={() => handleAnimeClick(item)}
                >
                  {item.poster && <img
                    src={item.poster}
                    width={50}
                    className="rounded-md"
                  />}
                  {!item.poster && <i class="fa-solid fa-image w-[50px] text-center"></i>}
                  <div className="flex flex-col">
                    <span className="text-white">{item.animeTitle}</span>
                    <span className="text-sm text-gray-300">{item.episodeTitle}</span>
                    <span className="text-xs text-gray-400">
                      From {item.source} • {new Date(item.timestamp).toLocaleString()}
                    </span>
                  </div>
                </div>

                <button
                  className="text-red-400 hover:text-red-300 text-sm p-1 rounded transition"
                  onClick={() => handleRemove(index)}
                  aria-label="Remove from history"
                >
                  <i className="fas fa-times"></i>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default History;
