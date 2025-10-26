import { navigateTo } from "../../router/router.js";
import { getHistory, removeHistory } from '../../storage/storage.js';

async function loadHistory(container) {
  try {
    const history = await getHistory();

    if (!history || history.length === 0) {
      container.innerHTML = `
        <div class="flex flex-col items-center justify-center h-64 text-center">
          <i class="fas fa-history text-4xl text-gray-400 mb-4"></i>
          <p class="text-gray-300">Belum ada riwayat tontonan.</p>
          <p class="text-sm text-gray-500 mt-2">Mulai tonton anime untuk melihat riwayat di sini.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = `
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <h1 class="text-gradient font-bold text-xl md:text-2xl">Riwayat Tontonan</h1>
        <button class="btn-secondary flex items-center gap-2 self-start sm:self-auto" id="clearHistory">
          <i class="fas fa-trash"></i>
          Hapus Semua
        </button>
      </div>

      <div id="historyList" class="space-y-4">
        <!-- History items will be inserted here -->
      </div>
    `;

    const historyList = document.getElementById("historyList");

    history.forEach((item, index) => {
      const historyItem = document.createElement("div");
      historyItem.className = "card p-4 hover:bg-gray-700 transition-colors";

      historyItem.innerHTML = `
        <div class="flex flex-col items-center gap-4">
          <img src="${item.poster || '/placeholder.jpg'}" alt="${item.animeTitle}" class="w-full h-48 object-cover rounded-md"/>
          <div class="flex-1 w-full text-start">
            <h3 class="font-semibold text-purple-300 text-lg truncate">${item.animeTitle}</h3>
            <p class="text-sm text-gray-400 mt-1">${item.episodeTitle} • ${item.source}</p>
            <p class="text-xs text-gray-500 mt-1">${new Date(item.timestamp).toLocaleString()}</p>
            <div class="flex flex-col gap-2 mt-3">
              <button class="btn-primary text-sm px-4 py-2 w-full" onclick="navigateTo('/anime/${item.source.toLowerCase()}/watch?id=${item.animeId}&episode=${item.episodeId}')">
                <i class="fas fa-play mr-1"></i> Lanjutkan
              </button>
              <button class="btn-secondary text-sm px-4 py-2 w-full remove-item" data-index="${index}">
                <i class="fas fa-times mr-1"></i> Hapus
              </button>
            </div>
          </div>
        </div>
      `;

      historyList.appendChild(historyItem);
    });

    // Event listener for clear all history
    document.getElementById("clearHistory").addEventListener("click", async () => {
      if (confirm("Apakah Anda yakin ingin menghapus semua riwayat tontonan?")) {
        // Clear all history from storage
        localStorage.removeItem("watchHistory");
        loadHistory(container);
      }
    });

    // Event listeners for remove individual items
    document.querySelectorAll(".remove-item").forEach(btn => {
      btn.addEventListener("click", async (e) => {
        const index = parseInt(e.currentTarget.dataset.index);
        await removeHistory(index);
        loadHistory(container);
      });
    });

  } catch (err) {
    console.error(err);
    container.innerHTML = `
      <div class="flex flex-col items-center justify-center h-64 text-center">
        <i class="fas fa-exclamation-triangle text-4xl text-red-400 mb-4"></i>
        <p class="text-gray-300">Gagal memuat riwayat tontonan.</p>
      </div>
    `;
  }
}

export function history() {
  setTimeout(() => {
    const container = document.getElementById("container");
    document.title = "Riwayat Tontonan - HisiNime";
    loadHistory(container);
  }, 0);

  return `
  <div class="pt-20 md:pt-24 p-4">
    <div id="container" class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-center h-64">
        <div class="text-center">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto mb-4"></div>
          <p class="text-purple-300 font-medium">Memuat riwayat...</p>
        </div>
      </div>
    </div>
  </div>
  `;
}
