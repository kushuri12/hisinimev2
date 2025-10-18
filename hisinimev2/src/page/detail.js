const base_api = "https://www.sankavollerei.com/anime/";

// Ambil ID anime dari URL query
function getAnimeId() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get("id");
}

// Fungsi untuk menampilkan detail anime
async function getDetailAnime(id, container) {
  try {
    const res = await fetch(`${base_api}samehadaku/anime/${id}`);
    const data = await res.json();

    if (!data.data) {
      container.innerText = "Detail anime tidak tersedia.";
      return;
    }

    const anime = data.data;

    container.innerHTML = `
    <a class="absolute left-1 top-1 bg-gray-100 text-center p-2 rounded text-purple-500 hover:bg-purple-100 transition" href="#" id="backto">Kembali</a>
      <img src="${anime.poster}" alt="${anime.japanese}" class="object-cover w-[30vh] md:w-[50vh] rounded-md mb-5 md:mb-0 md:mr-5"/>
      <div class="flex flex-col flex-grow">
        <h1 class="font-bold text-md">${anime?.synonyms || anime.japanese}</h1>
        <h1 class="text-sm mt-1">${anime.english}</h1>
        <p class="mt-4 text-justify text-sm leading-relaxed max-w-full md:max-w-[600px]">
          <span class="font-semibold">Sinopsis:</span> ${anime.synopsis.paragraphs.join("<br><br>")}
        </p>
        <div class="bg-gray-100 p-2 mt-2 mb-2">
          <p class="text-xs text-black mb-1">Japanese: ${anime.japanese}</p>
          <p class="text-xs text-black mb-1">Status: ${anime.status}</p>
          <p class="text-xs text-black mb-1">Skor: ${anime.score?.value || "N/A"}</p>
          <p class="text-xs text-black mb-1">Studio: ${anime.studios}</p>
          <p class="text-xs text-black mb-1">Tipe: ${anime.type}</p>
          <p class="text-xs text-black">Durasi: ${anime.duration}</p>
          <p class="text-xs text-black">Musim: ${anime.season}</p>
        </div>
        <div class="flex flex-wrap gap-2">
          Genre: ${anime.genreList.map(
            g => `<span class="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">${g.title}</span>`
          ).join("")}
        </div>
      </div>
    `;

    document.getElementById("backto").addEventListener("click", () => {
      window.history.back();
    });
  } catch (err) {
    console.error(err);
    container.innerText = "Gagal mengambil detail anime.";
  }
}

// Fungsi untuk menampilkan daftar episode
async function getEpisodes(animeId, container) {
  try {
    const res = await fetch(`${base_api}samehadaku/anime/${animeId}`);
    const data = await res.json();

    if (!data?.data?.episodeList || data.data.episodeList.length === 0) {
      container.innerText = "Episode tidak tersedia.";
      return;
    }

    container.innerHTML = "";
data.data.episodeList.forEach(ep => {
  const epLink = document.createElement("a");
  epLink.href = `/anime/watch?id=${ep.episodeId}`; // tetap sebagai href
  epLink.className = "text-start bg-white inline-block text-purple-800 text-sm md:text-lg px-3 py-1 rounded mr-2 mb-1 hover:bg-purple-100 transition";
  epLink.innerText = `Episode: ${ep.title || ep.episodeNumber}`;

  // Tangani klik supaya SPA tidak reload
  epLink.addEventListener("click", (e) => {
    e.preventDefault();           // cegah reload
    navigateTo(`/anime/watch?id=${ep.episodeId}`);
  });

  container.appendChild(epLink);
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
    <div id="information" class="relative w-full md:w-[100vh] flex flex-col md:flex-row items-center md:items-stretch bg-white rounded shadow md:mt-5 p-2">
      Sedang memuat konten...
    </div>
    <div id="episode" class="w-full md:w-[100vh] flex flex-col justify-center bg-white rounded shadow mt-5 pt-3 gap-3">
    </div>
  `;
}

