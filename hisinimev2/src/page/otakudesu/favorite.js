// js/favorite.js
import { getFavorites } from '../../storage/storage.js';

export function favorite() {
  setTimeout(async () => {
    const container = document.getElementById("favorites");
    await renderFavorites(container, navigateTo);
    document.title = "Favorite - OtakuDesu Mode"

    // tombol kembali
    document.getElementById("backto").addEventListener("click", (e) => {
      e.preventDefault();
      window.history.back();
    });
  }, 0);

  return `
    <div class="w-full flex justify-start p-4 bg-gray-900 shadow-sm z-10">
      <a
        href=""
        id="backto"
        class="bg-gray-700 text-purple-300 px-4 py-2 rounded font-semibold hover:bg-purple-600 transition"
      >Kembali</a>
    </div>
    <div id="favorites" class="mt-3 rounded shadow flex flex-col items-center p-5 w-full md:w-[100vh] bg-gray-900">
      <p class="text-gray-300 text-center">Sedang memuat favorit...</p>
    </div>
  `;
}

async function renderFavorites(container, navigateTo) {
  // Bersihkan container
  container.innerHTML = '<h2 class="text-xl text-purple-300 font-bold mb-4">Daftar Favorit (OtakuDesu)</h2>';

  const favs = getFavorites();

  if (!favs || favs.length === 0) {
    container.innerHTML += '<p class="text-gray-300">Belum ada anime favorit.</p>';
    return;
  }

  const ul = document.createElement('ul');
  ul.className = 'flex flex-col gap-2 w-full';
  container.appendChild(ul);

  for (let id of favs) {
    try {
      // Fetch data anime sesuai ID
      const { fetchFromSource } = await import('../../api.js');
      const result = await fetchFromSource("OtakuDesu", `anime/${encodeURIComponent(id)}`);

      if (!result.data) {
        console.warn('Data anime tidak ditemukan:', id);
        continue;
      }

      const data = result.data;

      // Buat list item
      const li = document.createElement('li');
      li.className = 'flex items-center justify-between bg-gray-800 border border-purple-600 px-3 py-2 rounded hover:bg-gray-700 transition cursor-pointer';

      // Konten anime
      const infoDiv = document.createElement('div');
      infoDiv.className = 'flex items-center gap-3';
      const img = document.createElement('img');
      img.src = data.poster;
      img.width = 50;
      img.className = 'rounded-md';
      const textDiv = document.createElement('div');
      textDiv.className = 'flex flex-col';
      const titleSpan = document.createElement('span');
      titleSpan.textContent = data.title;
      titleSpan.className = 'text-white';
      const episodeSpan = document.createElement('span');
      episodeSpan.textContent = `Episode: ${data.episode_count}`;
      episodeSpan.className = 'text-sm text-gray-300';

      textDiv.appendChild(titleSpan);
      textDiv.appendChild(episodeSpan);
      infoDiv.appendChild(img);
      infoDiv.appendChild(textDiv);

      // Gabungkan semuanya
      li.appendChild(infoDiv);
      li.onclick = () => navigateTo(`/anime/otakudesu/detail?id=${id}`);
      ul.appendChild(li);

    } catch (err) {
      console.error('Gagal load anime favorit:', id, err);
    }
  }
}
