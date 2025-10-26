import { navigateTo } from "../../router/router.js";
import { getHistory, removeHistory } from '../../storage/storage.js';

async function loadHistory(container) {
  try {
    const history = await getHistory();

    if (!history || history.length === 0) {
      container.innerHTML = '<h1 class="text-gradient font-bold text-xl md:text-2xl text-center mb-5">Riwayat Tontonan</h1><p class="text-gray-300">Belum ada riwayat tontonan nih...</p>';
      return;
    }

    // Bersihkan container
    container.innerHTML = '<h1 class="text-gradient font-bold text-xl md:text-2xl text-center mb-5">Riwayat Tontonan</h1>';

    const ul = document.createElement('ul');
    ul.className = 'flex flex-col gap-2 w-full';
    container.appendChild(ul);

    history.forEach((item, index) => {
      // Buat list item
      const li = document.createElement('li');
      li.className = 'flex items-center justify-between bg-gray-800 px-3 py-2 rounded hover:bg-gray-700 transition cursor-pointer';

      // Konten anime
      const infoDiv = document.createElement('div');
      infoDiv.className = 'flex items-center gap-3 flex-1';
      const img = document.createElement('img');
      img.src = item.poster || '/placeholder.jpg';
      img.width = 50;
      img.className = 'rounded-md';
      const textDiv = document.createElement('div');
      textDiv.className = 'flex flex-col';
      const titleSpan = document.createElement('span');
      titleSpan.textContent = item.animeTitle;
      titleSpan.className = 'text-white';
      const episodeSpan = document.createElement('span');
      episodeSpan.textContent = item.episodeTitle;
      episodeSpan.className = 'text-sm text-gray-300';
      const sourceSpan = document.createElement('span');
      sourceSpan.textContent = `From ${item.source} • ${new Date(item.timestamp).toLocaleString()}`;
      sourceSpan.className = 'text-xs text-gray-400';

      textDiv.appendChild(titleSpan);
      textDiv.appendChild(episodeSpan);
      textDiv.appendChild(sourceSpan);
      infoDiv.appendChild(img);
      infoDiv.appendChild(textDiv);

      // Tombol hapus kecil
      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'text-red-400 hover:text-red-300 text-sm p-1 rounded transition';
      deleteBtn.innerHTML = '<i class="fas fa-times"></i>';
      deleteBtn.onclick = async (e) => {
        e.stopPropagation();
        await removeHistory(index);
        loadHistory(container);
      };

      // Gabungkan semuanya
      li.appendChild(infoDiv);
      li.appendChild(deleteBtn);
      li.onclick = () => navigateTo(`/anime/${item.source.toLowerCase()}/watch?id=${item.animeId}&episode=${item.episodeId}`);
      ul.appendChild(li);
    });

  } catch (err) {
    console.error(err);
    container.innerHTML = '<h1 class="text-gradient font-bold text-xl md:text-2xl text-center mb-5">Riwayat Tontonan</h1><p class="text-gray-300">Gagal memuat riwayat tontonan.</p>';
  }
}

export function history() {
  setTimeout(() => {
    const container = document.getElementById("container");
    document.title = "Riwayat Tontonan - HisiNime";
    loadHistory(container);
  }, 0);

  return `
  <div id="container" class="mt-3 rounded shadow flex flex-col items-center p-5 w-full md:w-[100vh] bg-gray-900">
    <div class="flex items-center justify-center h-64">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
    </div>
  </div>
  `;
}
