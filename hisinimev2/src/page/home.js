import { fetchFromSource } from '../api.js';
import { getFavorites } from '../storage/storage.js';
import { initAuth, loginWithGoogle, logout, getCurrentUser } from '../auth.js';

async function home_anime(sourceName, targetId) {
  try {
    const result = await fetchFromSource(sourceName, "complete-anime/1");
    const dataKey = sourceName === "OtakuDesu" ? "completeAnimeData" : "animeList";
    if (result?.data?.data?.[dataKey]) {
      displayAnime(result.data.data[dataKey], targetId, sourceName);
    } else {
      document.getElementById(targetId).innerText = "Data anime tidak ditemukan.";
    }
  } catch (err) {
    console.error("Gagal mengambil data completed:", err);
    document.getElementById(targetId).innerText = "Gagal mengambil data anime.";
  }
}

async function home_anime2(sourceName, targetId) {
  try {
    const result = await fetchFromSource(sourceName, "ongoing-anime");
    const dataKey = sourceName === "OtakuDesu" ? "ongoingAnimeData" : "animeList";
    if (result?.data?.data?.[dataKey]) {
      displayAnime(result.data.data[dataKey], targetId, sourceName);
    } else {
      document.getElementById(targetId).innerText = "Data anime tidak ditemukan.";
    }
  } catch (err) {
    console.error("Gagal mengambil data ongoing:", err);
    document.getElementById(targetId).innerText = "Gagal mengambil data anime.";
  }
}

function displayAnime(animeList, targetId, source) {
  const grid = document.getElementById(targetId);
  grid.innerHTML = "";

  // Use smaller responsive grid for home page cards
  grid.className = "grid-responsive-small";

  animeList.forEach((anime) => {
    const card = document.createElement("div");
    card.className = "card flex flex-col relative cursor-pointer";
    const episodeBadge = source === "OtakuDesu" ? `<span class="absolute top-2 right-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white text-[12px] px-3 py-1 font-semibold shadow-lg">Episode ${anime.episode_count !== undefined ? anime.episode_count : "?"}</span>` : "";
    const idKey = source === "OtakuDesu" ? "slug" : "animeId";
    const navPath = source === "OtakuDesu" ? `/anime/otakudesu/detail?id=${anime[idKey]}` : `/anime/samehadaku/detail?id=${anime[idKey]}`;
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

function createHomePage(sourceName) {
  const title = sourceName === "OtakuDesu" ? "HisiNime v2 - OtakuDesu Mode" : "HisiNime v2 - Samehadaku Mode";
  const completedLabel = sourceName === "OtakuDesu" ? "Sudah Tamat (OtakuDesu)" : "Sudah Tamat (Samehadaku)";
  const ongoingLabel = sourceName === "OtakuDesu" ? "Sedang Tayang (OtakuDesu)" : "Sedang Tayang (Samehadaku)";
  const searchPath = sourceName === "OtakuDesu" ? "/anime/otakudesu/search?q=" : "/anime/samehadaku/search?q=";
  const favPath = sourceName === "OtakuDesu" ? "/anime/otakudesu/favorite" : "/anime/samehadaku/favorite";
  const otherSourcePath = sourceName === "OtakuDesu" ? "/anime/samehadaku" : "/anime/otakudesu";
  const otherSourceBtn = sourceName === "OtakuDesu" ? "Samehadaku Mode" : "OtakuDesu Mode";

  return function() {
    setTimeout(() => {
      // Load anime
      home_anime(sourceName, "card-completed");
      home_anime2(sourceName, "card-ongoing");

      document.title = title;

      // Ambil elemen search & navbar setelah HTML ada di DOM
      const searchInput = document.getElementById("input-btn");
      const searchBtn = document.getElementById("search-btn");
      const goToFav = document.getElementById("goToFavorite");

      // Listener search
      const doSearch = () => {
        const query = searchInput.value.trim();
        if (!query) return;
        navigateTo(`${searchPath}${encodeURIComponent(query)}`);
      };

      searchBtn.addEventListener("click", e => {
        e.preventDefault();
        doSearch();
      });

      searchInput.addEventListener("keypress", e => {
        if (e.key === "Enter") {
          e.preventDefault();
          doSearch();
        }
      });

      // Listener navbar
      goToFav.addEventListener("click", e => {
        e.preventDefault();
        navigateTo(favPath);
      });

      const goToOther = document.getElementById("goToOther");
      if (goToOther) {
        goToOther.addEventListener("click", e => {
          e.preventDefault();
          navigateTo(otherSourcePath);
        });
      }

    }, 0);

    return `
      <div class="nav-bar w-screen p-4">
        <div class="flex flex-col items-center gap-4 max-w-4xl mx-auto">
          <h1 class="text-gradient font-bold text-xl md:text-2xl text-center">${title}</h1>

          <div class="flex items-center gap-2 w-full max-w-md">
            <input
              id="input-btn"
              class="input-modern flex-1"
              type="text"
              placeholder="Cari anime..."
            />
            <button id="search-btn" class="btn-primary">Cari</button>
          </div>

          <div class="flex flex-wrap gap-2 justify-center">
            <button class="btn-secondary text-sm px-3 py-2" id="goToFavorite">Favorite</button>
            <button class="btn-secondary text-sm px-3 py-2" id="goToOther">${otherSourceBtn}</button>
          </div>
        </div>
      </div>

      <div class="content-section w-full max-w-6xl mx-auto">
        <div class="mb-6">
          <h2 class="text-gradient font-bold text-xl mb-4">${completedLabel}</h2>
          <div id="card-completed" class="flex overflow-x-auto gap-4 pb-4">Sedang memuat konten...</div>
        </div>

        <div>
          <h2 class="text-gradient font-bold text-xl mb-4">${ongoingLabel}</h2>
          <div id="card-ongoing" class="flex overflow-x-auto gap-4 pb-4">Sedang memuat konten...</div>
        </div>
      </div>
    `;
  };
}

async function home_combined(type, targetId) {
  try {
    const results = [];

    // Fetch from OtakuDesu
    const resultOtaku = await fetchFromSource("OtakuDesu", type === "completed" ? "complete-anime/1" : "ongoing-anime");
    const dataKeyOtaku = type === "completed" ? "completeAnimeData" : "ongoingAnimeData";
    if (resultOtaku?.data?.data?.[dataKeyOtaku]) {
      results.push(...resultOtaku.data.data[dataKeyOtaku].map(anime => ({ ...anime, source: "OtakuDesu" })));
    }

    // Fetch from Samehadaku
    const resultSame = await fetchFromSource("Samehadaku", type === "completed" ? "complete-anime/1" : "ongoing-anime");
    const dataKeySame = "animeList";
    if (resultSame?.data?.data?.[dataKeySame]) {
      results.push(...resultSame.data.data[dataKeySame].map(anime => ({ ...anime, source: "Samehadaku" })));
    }

    // Shuffle or sort the combined results
    const shuffled = results.sort(() => Math.random() - 0.5);

    displayAnimeCombined(shuffled, targetId);
  } catch (err) {
    console.error(`Gagal mengambil data ${type}:`, err);
    document.getElementById(targetId).innerText = `Gagal mengambil data ${type}.`;
  }
}

function displayAnimeCombined(animeList, targetId) {
  const grid = document.getElementById(targetId);
  grid.innerHTML = "";

  // Use smaller responsive grid for home page cards
  grid.className = "grid-responsive-small";

  animeList.forEach((anime) => {
    const source = anime.source;
    const card = document.createElement("div");
    card.className = "card flex flex-col relative cursor-pointer";
    const episodeBadge = source === "OtakuDesu" ? `<span class="absolute top-2 right-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white text-[12px] px-3 py-1 font-semibold shadow-lg">Episode ${anime.episode_count !== undefined ? anime.episode_count : "?"}</span>` : `<span class="absolute top-2 right-2 rounded-full bg-gradient-to-r from-blue-500 to-green-500 text-white text-[12px] px-3 py-1 font-semibold shadow-lg">${anime.type || "N/A"}</span>`;
    const idKey = source === "OtakuDesu" ? "slug" : "animeId";
    const navPath = source === "OtakuDesu" ? `/anime/otakudesu/detail?id=${anime[idKey]}` : `/anime/samehadaku/detail?id=${anime[idKey]}`;
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

function createHomeBoth() {
  return function() {
    setTimeout(() => {
      // Load combined anime
      home_combined("completed", "card-completed");
      home_combined("ongoing", "card-ongoing");

      document.title = "HisiNime v2";

      // Ambil elemen search & navbar setelah HTML ada di DOM
      const searchInput = document.getElementById("input-btn");
      const searchBtn = document.getElementById("search-btn");

      // Listener search - use combined search
      const doSearch = () => {
        const query = searchInput.value.trim();
        if (!query) return;
        navigateTo(`/search?q=${encodeURIComponent(query)}`);
      };

      searchBtn.addEventListener("click", e => {
        e.preventDefault();
        doSearch();
      });

      searchInput.addEventListener("keypress", e => {
        if (e.key === "Enter") {
          e.preventDefault();
          doSearch();
        }
      });

    }, 0);

    return `
      <div class="nav-bar w-screen p-4">
        <div class="flex flex-col items-center gap-4 max-w-4xl mx-auto">
          <h1 class="text-gradient font-bold text-xl md:text-2xl text-center">HisiNime v2</h1>

          <div id="auth-section" class="flex items-center gap-2 mb-4">
            <!-- Auth buttons will be inserted here -->
          </div>

          <div class="flex items-center gap-2 w-full max-w-md">
            <input
              id="input-btn"
              class="input-modern flex-1"
              type="text"
              placeholder="Cari anime..."
            />
            <button id="search-btn" class="btn-primary"><i class="fa-solid fa-magnifying-glass"></i></button>
          </div>

        </div>
      </div>

      <div class="content-section w-full max-w-6xl mx-auto">
        <div class="mb-6">
          <h2 class="text-gradient font-bold text-xl mb-4">Sudah Tamat</h2>
          <div id="card-completed" class="grid-responsive flex items-center justify-center h-64"><div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div></div>
        </div>

        <div>
          <h2 class="text-gradient font-bold text-xl mb-4">Sedang Tayang</h2>
          <div id="card-ongoing" class="grid-responsive flex items-center justify-center h-64"><div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div></div>
        </div>
      </div>
    `;
  };
}

export const homeOtakuDesu = createHomePage("OtakuDesu");
export const homeSamehadaku = createHomePage("Samehadaku");
export const homeBoth = createHomeBoth();
