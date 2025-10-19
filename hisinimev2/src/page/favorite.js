// js/favorite.js
import { getFavorites } from '../storage/storage.js';

export function favorite() {
  setTimeout(async () => {
    const container = document.getElementById("favorites");
    await renderFavorites(container, navigateTo);
    document.title = "Favorite"

    // tombol kembali
    document.getElementById("backto").addEventListener("click", (e) => {
      e.preventDefault();
      window.history.back();
    });
  }, 0);

  return `
    <div class="w-full flex justify-start p-4 bg-white shadow-sm z-10">
      <a
        href=""
        id="backto"
        class="bg-purple-100 text-purple-700 px-4 py-2 rounded font-semibold hover:bg-purple-200 transition"
      >Kembali</a>
    </div>
    <div id="favorites" class="mt-3 rounded shadow flex flex-col items-center p-5 w-full md:w-[100vh] bg-white">
      <p class="text-gray-400 text-center">Sedang memuat favorit...</p>
    </div>
  `;
}

async function renderFavorites(container, navigateTo) {
  // Bersihkan container
  container.innerHTML = '<h2 class="text-xl text-purple-500 font-bold mb-4">Daftar Favorit</h2>';

  const favs = getFavorites();

  if (!favs || favs.length === 0) {
    container.innerHTML += '<p>Belum ada anime favorit.</p>';
    return;
  }

  const ul = document.createElement('ul');
  ul.className = 'flex flex-col gap-2 w-full';
  container.appendChild(ul);

  for (let id of favs) {
    try {
      // Fetch data anime sesuai ID
      const res = await fetch(`https://www.sankavollerei.com/anime/anime/${encodeURIComponent(id)}`);
      const json = await res.json();

      if (!json.data) {
        console.warn('Data anime tidak ditemukan:', id);
        continue;
      }

      const data = json.data;

      // Buat list item
      const li = document.createElement('li');
      li.className = 'flex items-center justify-between bg-white border border-purple-300 px-3 py-2 rounded hover:bg-purple-100 transition cursor-pointer';

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
      const episodeSpan = document.createElement('span');
      episodeSpan.textContent = `Episode: ${data.episode_count}`;
      episodeSpan.className = 'text-sm text-gray-500';

      textDiv.appendChild(titleSpan);
      textDiv.appendChild(episodeSpan);
      infoDiv.appendChild(img);
      infoDiv.appendChild(textDiv);

      // Gabungkan semuanya
      li.appendChild(infoDiv);
      li.onclick = () => navigateTo(`/anime/detail?id=${id}`);
      ul.appendChild(li);

    } catch (err) {
      console.error('Gagal load anime favorit:', id, err);
    }
  }
}
