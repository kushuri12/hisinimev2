import {
  addFavorite,
  removeFavorite,
  getFavorites,
} from "../../storage/storage.js";
import { fetchFromSource } from '../../api.js';

// Ambil ID anime dari URL query
function getAnimeId() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get("id");
}

// Fungsi untuk menampilkan detail anime
async function getDetailAnime(id, container) {
  try {
    const data = await fetchFromSource("OtakuDesu", `anime/${id}`);

    if (!data.data) {
      container.innerHTML = `
        <div class="flex flex-col items-center justify-center h-64 text-center">
          <i class="fas fa-exclamation-triangle text-4xl text-red-400 mb-4"></i>
          <p class="text-gray-300">Detail anime tidak tersedia.</p>
        </div>
      `;
      return;
    }

    const anime = data.data.data;

    const favs = await getFavorites();
    const isFavorited = favs.some(fav => (typeof fav === 'string' ? fav == id : fav.id == id && fav.source == data.source));

    container.innerHTML = `
      <!-- Header Section -->
      <div class="flex items-center justify-between mb-6 pt-16 md:pt-6">
        <button class="btn-secondary flex items-center gap-2 z-10 relative" id="backto">
          <i class="fas fa-arrow-left"></i>
          <span class="hidden sm:inline">Kembali</span>
        </button>
        <div class="text-center flex-1">
          <h1 class="text-gradient font-bold text-xl md:text-2xl">${anime.title}</h1>
          <p class="text-sm text-blue-400 font-semibold">OtakuDesu</p>
        </div>
        <div class="w-20"></div> <!-- Spacer for centering -->
      </div>

      <!-- Main Content -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <!-- Poster Section -->
        <div class="md:col-span-1">
          <div class="card p-4">
            <img src="${anime.poster}" alt="${anime.title}" class="w-full rounded-lg shadow-lg mb-4"/>
            <button id="favoriteBtn" class="group relative w-full overflow-hidden rounded-xl bg-gradient-to-r ${isFavorited ? 'from-red-500 to-pink-500' : 'from-blue-500 to-blue-600'} p-4 text-white shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]">
              <div class="flex items-center justify-center gap-3">
                <div class="relative">
                  <i class="fas fa-heart text-2xl transition-all duration-300 ${isFavorited ? 'scale-110 text-red-200' : 'group-hover:scale-110'}"></i>
                  ${isFavorited ? '<div class="absolute inset-0 animate-ping rounded-full bg-red-300 opacity-20"></div>' : ''}
                </div>
                <div class="flex flex-col items-start">
                  <span class="font-semibold text-lg">${isFavorited ? "Favorit" : "Tambah ke"}</span>
                  <span class="text-sm opacity-90">${isFavorited ? "Hapus dari favorit" : "Daftar Favorit"}</span>
                </div>
              </div>
              <div class="absolute inset-0 bg-white opacity-0 transition-opacity duration-300 group-hover:opacity-10"></div>
            </button>
          </div>
        </div>

        <!-- Details Section -->
        <div class="md:col-span-2 space-y-4">
          <!-- Synopsis Card -->
          <div class="card p-4">
            <h3 class="font-semibold text-blue-300 mb-3 flex items-center gap-2">
              <i class="fas fa-book"></i>
              Sinopsis
            </h3>
            <div class="text-justify text-sm leading-relaxed text-gray-300">
              <p id="synopsis">${anime.synopsis || 'Tidak ada sinopsis'}</p>
              <button id="readMoreBtn" class="text-blue-400 hover:underline text-sm mt-2">Selengkapnya</button>
            </div>
          </div>

          <!-- Info Card -->
          <div class="card p-4">
            <h3 class="font-semibold text-blue-300 mb-3 flex items-center gap-2">
              <i class="fas fa-info-circle"></i>
              Informasi Anime
            </h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div class="flex justify-between">
                <span class="text-gray-400">Japanese:</span>
                <span class="text-white">${anime.japanese_title || 'N/A'}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-400">Status:</span>
                <span class="text-white">${anime.status || 'N/A'}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-400">Episode:</span>
                <span class="text-white">${anime.episode_count || 'N/A'}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-400">Skor:</span>
                <span class="text-white">${anime.rating || "N/A"}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-400">Studio:</span>
                <span class="text-white">${anime.studio || 'N/A'}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-400">Tipe:</span>
                <span class="text-white">${anime.type || 'N/A'}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-400">Durasi:</span>
                <span class="text-white">${anime.duration || 'N/A'}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-400">Rilis:</span>
                <span class="text-white">${anime.release_date || 'N/A'}</span>
              </div>
            </div>
          </div>

          <!-- Genres Card -->
          <div class="card p-4">
            <h3 class="font-semibold text-blue-300 mb-3 flex items-center gap-2">
              <i class="fas fa-tags"></i>
              Genre
            </h3>
            <div class="flex flex-wrap gap-2">
              ${anime.genres?.map(g => `<span class="badge">${g.name}</span>`).join("") || '<span class="text-gray-400">Tidak ada genre</span>'}
            </div>
          </div>
        </div>
      </div>
    `;

    const synopsis = document.getElementById("synopsis");
    const btn = document.getElementById("readMoreBtn");

    let expanded = false;

    btn.addEventListener("click", () => {
      expanded = !expanded;
      if (expanded) {
        synopsis.style.webkitLineClamp = "unset"; // tampilkan semua teks
        btn.innerText = "Sembunyikan";
      } else {
        synopsis.style.webkitLineClamp = 2; // potong lagi
        btn.innerText = "Selengkapnya";
      }
    });

    document.getElementById("backto").addEventListener("click", () => {
      window.history.back();
    });

    // Event listener untuk tombol favorite
    document.getElementById("favoriteBtn").addEventListener("click", async () => {
      const btn = document.getElementById("favoriteBtn");
      const favs = await getFavorites();
      const isFavorited = favs.some(fav => (typeof fav === 'string' ? fav === id : fav.id === id && fav.source === "OtakuDesu"));
      if (isFavorited) {
        await removeFavorite(id, "OtakuDesu");
        // Update button to "Add to Favorites" state
        btn.innerHTML = `
          <div class="flex items-center justify-center gap-3">
            <div class="relative">
              <i class="fas fa-heart text-2xl transition-all duration-300 group-hover:scale-110"></i>
            </div>
            <div class="flex flex-col items-start">
              <span class="font-semibold text-lg">Tambah ke</span>
              <span class="text-sm opacity-90">Daftar Favorit</span>
            </div>
          </div>
          <div class="absolute inset-0 bg-white opacity-0 transition-opacity duration-300 group-hover:opacity-10"></div>
        `;
        btn.className = "group relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 p-4 text-white shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]";
      } else {
        await addFavorite(id, "OtakuDesu", anime.title, anime.poster);
        // Update button to "Remove from Favorites" state
        btn.innerHTML = `
          <div class="flex items-center justify-center gap-3">
            <div class="relative">
              <i class="fas fa-heart text-2xl transition-all duration-300 scale-110 text-red-200"></i>
              <div class="absolute inset-0 animate-ping rounded-full bg-red-300 opacity-20"></div>
            </div>
            <div class="flex flex-col items-start">
              <span class="font-semibold text-lg">Favorit</span>
              <span class="text-sm opacity-90">Hapus dari favorit</span>
            </div>
          </div>
          <div class="absolute inset-0 bg-white opacity-0 transition-opacity duration-300 group-hover:opacity-10"></div>
        `;
        btn.className = "group relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-red-500 to-pink-500 p-4 text-white shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]";
      }
    });
  } catch (err) {
    console.error(err);
    container.innerText = "Gagal mengambil detail anime.";
  }
}

// Fungsi untuk menampilkan daftar episode
async function getEpisodes(animeId, container) {
  try {
    const data = await fetchFromSource("OtakuDesu", `anime/${animeId}`);

    if (!data?.data?.data?.episode_lists || data.data.data.episode_lists.length === 0) {
      container.innerText = "Episode tidak tersedia.";
      return;
    }

    const anime = data.data.data;
    // Buat innerHTML langsung, seperti versi pertama
    container.innerHTML = `
  <h2 class="font-semibold mb-2 text-blue-400 text-lg px-2">Daftar Episode:</h2>
  <div class="flex flex-col gap-2 overflow-y-auto max-h-[300px] md:max-h-[100vh] p-2">
    ${data.data.data.episode_lists
      .map(
        (ep) => `
      <a
  href="/anime/otakudesu/watch?id=${ep.slug}"
  class="flex items-center justify-between bg-gray-800 text-blue-300 text-sm md:text-base px-3 py-2 rounded hover:bg-blue-700 transition"
  data-episode="${ep.slug}"
>
  <div class="flex items-center">
    <img
      src="${anime.poster}"
      alt="${anime.title}"
      class="object-cover w-[100px] h-[50px] rounded-md mr-3"
    />
    <div class="flex flex-col">
    <span class="text-white">${ep.episode}</span>
  <span class="text-xs md:text-sm whitespace-nowrap text-gray-300">${anime.duration}</span>
  </div>
  </div>
</a>

    `
      )
      .join("")}
  </div>
`;

    // Tambahkan listener supaya tidak reload halaman saat klik
    container.querySelectorAll("a[data-episode]").forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        const id = link.getAttribute("data-episode");
        navigateTo(`/anime/otakudesu/watch?id=${id}`);
      });
    });
  } catch (err) {
    console.error(err);
    container.innerText = "Gagal mengambil episode.";
  }
}

// Fungsi utama export untuk router
export function detail() {
  // Render HTML placeholder dulu
  setTimeout(() => {
    const infoContainer = document.getElementById("information");
    const episodeContainer = document.getElementById("episode");
    const animeId = getAnimeId();
    document.title = animeId;

    if (!animeId) {
      infoContainer.innerText = "Maaf, anime tidak ditemukan.";
      episodeContainer.innerText = "";
    } else {
      getDetailAnime(animeId, infoContainer);
      getEpisodes(animeId, episodeContainer);
    }
  }, 0);

  // Kembalikan HTML placeholder
  return `
  <div class="flex flex-col mt-[-50px] md:mt-5 md:mt-5 md:flex-row w-screen">
  <div id="information" class="w-screen bg-gray-900 p-4">
    <div class="flex flex-col items-center justify-center min-h-[400px] space-y-4">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
      <p class="text-gray-300 text-lg font-medium">Memuat detail anime...</p>
      <p class="text-gray-400 text-sm">Mohon tunggu sebentar</p>
    </div>
  </div>
  <div id="episode" class="w-screen bg-gray-900 p-4">
    <div class="flex flex-col items-center justify-center min-h-[400px] space-y-4">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
      <p class="text-gray-300 text-lg font-medium">Memuat daftar episode...</p>
      <p class="text-gray-400 text-sm">Mohon tunggu sebentar</p>
    </div>
  </div>
</div>
  `;
}
