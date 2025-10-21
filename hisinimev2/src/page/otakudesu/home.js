import { fetchFromSource } from '../../api.js';

async function home_anime() {
  try {
    const result = await fetchFromSource("OtakuDesu", "complete-anime/1");
    if (result?.data?.data?.completeAnimeData) {
      displayAnime(result.data.data.completeAnimeData, "card-completed", result.source);
    } else {
      document.getElementById("card-completed").innerText =
        "Data anime tidak ditemukan.";
    }
  } catch (err) {
    console.error("Gagal mengambil data completed:", err);
    document.getElementById("card-completed").innerText =
      "Gagal mengambil data anime.";
  }
}

async function home_anime2() {
  try {
    const result = await fetchFromSource("OtakuDesu", "ongoing-anime");
    if (result?.data?.data?.ongoingAnimeData) {
      displayAnime(result.data.data.ongoingAnimeData, "card-ongoing", result.source);
    } else {
      document.getElementById("card-ongoing").innerText =
        "Data anime tidak ditemukan.";
    }
  } catch (err) {
    console.error("Gagal mengambil data ongoing:", err);
    document.getElementById("card-ongoing").innerText =
      "Gagal mengambil data anime.";
  }
}

function displayAnime(animeList, targetId, source) {
  const grid = document.getElementById(targetId);
  grid.innerHTML = "";

  animeList.forEach((anime) => {
    const card = document.createElement("div");
    card.className = "card min-w-[200px] max-w-[200px] snap-start flex flex-col relative cursor-pointer";
    card.innerHTML = `
      <img src="${anime.poster}" alt="${anime.title}" class="w-full h-auto rounded-t-lg mb-3 object-cover" />
      <span class="absolute top-2 right-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white text-[12px] px-3 py-1 font-semibold shadow-lg">Episode ${anime.episode_count !== undefined ? anime.episode_count : "?"}</span>
      <div class="flex flex-col items-start p-4">
        <h3 class="font-bold text-sm mb-2 line-clamp-2 text-white">${anime.title}</h3>
        <span class="text-xs text-gray-400">From ${source}</span>
      </div>
    `;

    card.addEventListener("click", () => {
      navigateTo(`/anime/otakudesu/detail?id=${anime.slug}`);
    });

    grid.appendChild(card);
  });
}

export function home() {
  setTimeout(() => {
    // Load anime
    home_anime();
    home_anime2();

    document.title = "HisiNime v2 - OtakuDesu Mode";

    // Ambil elemen search & navbar setelah HTML ada di DOM
    const searchInput = document.getElementById("input-btn");
    const searchBtn = document.getElementById("search-btn");
    const goToFav = document.getElementById("goToFavorite");

    // Listener search
    const doSearch = () => {
      const query = searchInput.value.trim();
      if (!query) return;
      navigateTo(`/anime/otakudesu/search?q=${encodeURIComponent(query)}`);
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
      navigateTo(`/anime/otakudesu/favorite`);
    });

    const goToSamehadaku = document.getElementById("goToSamehadaku");
    goToSamehadaku.addEventListener("click", e => {
      e.preventDefault();
      navigateTo(`/anime/samehadaku`);
    });

    const goToOtakuDesu = document.getElementById("goToOtakuDesu");
    goToOtakuDesu.addEventListener("click", e => {
      e.preventDefault();
      navigateTo(`/anime/otakudesu`);
    });

  }, 0);

  return `
    <div class="nav-bar w-screen p-4">
      <div class="flex flex-col items-center gap-4 max-w-4xl mx-auto">
        <h1 class="text-gradient font-bold text-xl md:text-2xl text-center">HisiNime v2 - OtakuDesu Mode</h1>

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
          <button class="btn-secondary text-sm px-3 py-2" id="goToSamehadaku">Samehadaku Mode</button>
          <button class="btn-secondary text-sm px-3 py-2" id="goToOtakuDesu">OtakuDesu Mode</button>
        </div>
      </div>
    </div>

    <div class="content-section w-full max-w-6xl mx-auto">
      <div class="mb-6">
        <h2 class="text-gradient font-bold text-xl mb-4">Sudah Tamat (OtakuDesu)</h2>
        <div id="card-completed" class="flex overflow-x-auto gap-4 pb-4">Sedang memuat konten...</div>
      </div>

      <div>
        <h2 class="text-gradient font-bold text-xl mb-4">Sedang Tayang (OtakuDesu)</h2>
        <div id="card-ongoing" class="flex overflow-x-auto gap-4 pb-4">Sedang memuat konten...</div>
      </div>
    </div>
  `;
}
