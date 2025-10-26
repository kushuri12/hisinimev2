import { fetchFromSource } from '../api.js';

async function search_combined(query, targetId) {
  try {
    const results = [];

    // Search OtakuDesu
    const resultOtaku = await fetchFromSource("OtakuDesu", `search/${encodeURIComponent(query)}`);
    const resultsOtaku = resultOtaku?.data?.data || [];
    results.push(...resultsOtaku.map(anime => ({ ...anime, source: "OtakuDesu" })));

    // Search Samehadaku
    const resultSame = await fetchFromSource("Samehadaku", `search?q=${encodeURIComponent(query)}`);
    const resultsSame = resultSame?.data?.data?.animeList || [];
    results.push(...resultsSame.map(anime => ({ ...anime, source: "Samehadaku" })));

    // Shuffle the combined results
    const shuffled = results.sort(() => Math.random() - 0.5);

    displaySearchCombined(shuffled, targetId);
  } catch (err) {
    console.error("Gagal mengambil hasil pencarian:", err);
    document.getElementById(targetId).innerText = "Gagal mengambil hasil pencarian.";
  }
}

function displaySearchCombined(animeList, targetId) {
  const grid = document.getElementById(targetId);
  grid.innerHTML = "";

  // Use responsive grid instead of horizontal scroll
  grid.className = "grid-responsive";

  animeList.forEach((anime) => {
    const source = anime.source;
    const card = document.createElement("div");
    card.className = "card flex flex-col relative cursor-pointer";
    const episodeBadge = source === "OtakuDesu" ? `<span class="absolute top-2 right-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white text-[12px] px-3 py-1 font-semibold shadow-lg">Episode ${anime.episode_count !== undefined ? anime.episode_count : "?"}</span>` : `<span class="absolute top-2 right-2 rounded-full bg-gradient-to-r from-blue-500 to-green-500 text-white text-[12px] px-3 py-1 font-semibold shadow-lg">${anime.type || "N/A"}</span>`;
    const idKey = source === "OtakuDesu" ? "slug" : "animeId";
    const lastPart = anime[idKey].replace(/\/+$/, "").split("/").pop();
    const navPath = source === "OtakuDesu" ? `/anime/otakudesu/detail?id=${lastPart}` : `/anime/samehadaku/detail?id=${anime[idKey]}`;
    card.innerHTML = `
      <img src="${anime.poster}" alt="${anime.title}" class="w-full h-48 object-cover rounded-t-lg" />
      ${episodeBadge}
      <div class="flex flex-col items-start p-4 flex-1">
        <h3 class="font-bold text-sm mb-2 line-clamp-2 text-white">${anime.title}</h3>
        <span class="text-xs text-gray-400">From ${source}</span>
      </div>
    `;

    card.addEventListener("click", () => {
      navigateTo(navPath);
    });

    grid.appendChild(card);
  });
}

function createSearchBoth() {
  return function() {
    const urlParams = new URLSearchParams(window.location.search);
    const query = urlParams.get("q") || "";

    setTimeout(async () => {
      const container = document.getElementById("srch");
      if (!query) {
        container.innerHTML = `
          <div class="w-full flex flex-col items-center mb-6">
            <h2 class="text-purple-300 font-bold text-2xl text-center mb-1">
              Pencarian
            </h2>
            <p class="text-gray-300 text-center text-sm">
              Tidak ada query pencarian yang diberikan.
            </p>
          </div>
        `;
        return;
      }
      container.innerHTML = `
        <div class="w-full flex flex-col items-center mb-6">
          <h2 class="text-purple-300 font-bold text-2xl text-center mb-1">
            Hasil Pencarian
          </h2>
          <p class="text-gray-300 text-center text-sm">
            "${query}"
          </p>
        </div>
        <div id="results-list" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 w-full max-w-7xl"></div>
      `;

      await search_combined(query, "results-list");
    }, 0);

    return `
      <div class="w-full flex justify-start p-4 bg-gray-900 shadow-sm z-10">
        <button onclick="window.history.back()" id="backto" class="bg-transparent backdrop-blur-sm text-purple-300 px-4 py-2 rounded font-semibold hover:bg-purple-600 transition"><i class="fas fa-arrow-left"></i></button>
      </div>
      <div id="srch" class="flex flex-col items-center p-5 bg-gray-900 rounded shadow">
        <div class="flex items-center justify-center h-64"><div class="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div></div>
      </div>
    `;
  };
}

export const searchBoth = createSearchBoth();
