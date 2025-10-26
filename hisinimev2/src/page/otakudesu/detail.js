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
      container.innerText = "Detail anime tidak tersedia.";
      return;
    }

    const anime = data.data.data;

    const favs = await getFavorites();
    const isFavorited = favs.some(fav => (typeof fav === 'string' ? fav == id : fav.id == id && fav.source == data.source));

    container.innerHTML = `
    <a class="bg-transparent backdrop-blur-sm text-purple-300 px-4 py-2 rounded font-semibold hover:bg-purple-600 transition fas fa-arrow-left" href="#" id="backto"></a>
      <img src="${anime.poster}" alt="${
      anime.title
    }" class="object-cover w-[30vh] md:w-[50vh] rounded-md mb-5 md:mb-0 mx-auto md:mx-0 md:mr-5"/>
      <div class="flex flex-col flex-grow">
        <h1 class="font-bold text-md text-white">${anime.title}</h1>
        <span class="text-xs text-gray-300">From ${data.source}</span>
         <button id="favoriteBtn" class="mt-2 px-3 py-1 w-[130px] rounded text-sm ${
           isFavorited ? "bg-red-500 text-white" : "bg-purple-500 text-white"
         } hover:opacity-80 transition">
          ${isFavorited ? "Hapus Favorit" : "Tambah Favorit"}
        </button>
        <div class="mt-4 text-justify text-sm leading-relaxed max-w-full md:max-w-[600px] font-semibold text-white">
  <p id="synopsis">Sinopsis:
    <span class="font-normal">${anime.synopsis}</span>
  </p>
  <button id="readMoreBtn" class="text-purple-300 hover:underline">Selengkapnya</button>
</div>

        <div class="bg-gray-800 p-2 mt-2 mb-2">
          <p class="text-xs text-gray-300 mb-1">Japanese: ${
            anime.japanese_title
          }</p>
          <p class="text-xs text-gray-300 mb-1">Status: ${anime.status}</p>
          <p class="text-xs text-gray-300 mb-1">Episode: ${anime.episode_count}</p>
          <p class="text-xs text-gray-300 mb-1">Skor: ${anime.rating || "N/A"}</p>
          <p class="text-xs text-gray-300 mb-1">Studio: ${anime.studio}</p>
          <p class="text-xs text-gray-300 mb-1">Tipe: ${anime.type}</p>
          <p class="text-xs text-gray-300">Durasi: ${anime.duration}</p>
          <p class="text-xs text-gray-300">Rilis: ${anime.release_date}</p>
        </div>
        <div class="flex flex-wrap gap-2">
          Genre: ${anime.genres
            .map(
              (g) =>
                `<span class="bg-gray-700 text-purple-300 text-xs px-2 py-1 rounded">${g.name}</span>`
            )
            .join("")}
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
        btn.textContent = "Tambah Favorit";
        btn.className =
          "mt-2 px-3 py-1 w-[130px] rounded text-sm bg-purple-500 text-white hover:opacity-80 transition";
      } else {
        await addFavorite(id, "OtakuDesu", anime.title, anime.poster);
        btn.textContent = "Hapus Favorit";
        btn.className =
          "mt-2 px-3 py-1 w-[130px] rounded text-sm bg-red-500 text-white hover:opacity-80 transition";
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
  <h2 class="font-semibold mb-2 text-purple-300 text-lg px-2">Daftar Episode:</h2>
  <div class="flex flex-col gap-2 overflow-y-auto max-h-[300px] md:max-h-[100vh] p-2">
    ${data.data.data.episode_lists
      .map(
        (ep) => `
      <a
  href="/anime/otakudesu/watch?id=${ep.slug}"
  class="flex items-center justify-between bg-gray-800 text-purple-300 text-sm md:text-base px-3 py-2 rounded hover:bg-gray-700 transition"
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
  <div class="flex flex-col md:flex-row w-screen">
  <div id="information" class="w-screen bg-gray-900 p-4">Sedang memuat konten...</div>
  <div id="episode" class="w-screen bg-gray-900 p-4">Sedang memuat konten...</div>
</div>
  `;
}
