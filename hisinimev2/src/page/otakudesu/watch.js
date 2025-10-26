import { navigateTo } from "../../router/router.js";
import { fetchFromSource } from '../../api.js';
import { getBookmarkTime, saveBookmarkTime, getLastResolution, saveLastResolution, saveHistory } from '../../storage/storage.js';

async function loadStreaming(animeId, episodeId, container, rekomen) {
  try {
    const result = await fetchFromSource("OtakuDesu", `episode/${episodeId}`);
    if (!result.data) {
      container.innerHTML = `
        <div class="flex flex-col items-center justify-center h-64 text-center">
          <i class="fas fa-exclamation-triangle text-4xl text-red-400 mb-4"></i>
          <p class="text-gray-300">Streaming anime tidak tersedia.</p>
        </div>
      `;
      return;
    }
    const data = result.data;

    container.innerHTML = `
      <!-- Header Section -->
      <div class="flex items-center justify-between mb-6">
        <button class="btn-secondary flex items-center gap-2" id="backto">
          <i class="fas fa-arrow-left"></i>
          <span class="hidden sm:inline">Kembali</span>
        </button>
        <div class="text-center flex-1">
          <h1 class="text-gradient font-bold text-xl md:text-2xl leading-tight">${data.data.anime_title || 'Anime'} - ${data.data.episode}</h1>
          <p class="text-sm text-blue-400 font-semibold mt-1">Streaming dari OtakuDesu</p>
        </div>
        <div class="w-20"></div> <!-- Spacer for centering -->
      </div>

      <!-- Video Player Section -->
      <div class="card p-4 mb-6">
        <iframe id="player" class="w-full aspect-video rounded-lg shadow-lg" src="" frameborder="0" allowfullscreen></iframe>
      </div>

      <!-- Server Selection -->
      <div class="card p-4 mb-6">
        <h3 class="font-semibold text-purple-300 mb-3 flex items-center gap-2">
          <i class="fas fa-server"></i>
          Server Streaming
        </h3>
        <div id="servers" class="flex flex-wrap gap-2"></div>
      </div>

      <!-- Episode Navigation -->
      <div class="card p-4 mb-6">
        <h3 class="font-semibold text-purple-300 mb-3 flex items-center gap-2">
          <i class="fas fa-list"></i>
          Navigasi Episode
        </h3>
        <div class="flex items-center justify-center gap-4">
          <button class="btn-secondary flex items-center gap-2 px-4 py-2 ${!data.data.previous_episode ? 'opacity-50 cursor-not-allowed' : ''}" id="backeps" ${!data.data.previous_episode ? 'disabled' : ''}>
            <i class="fas fa-chevron-left"></i>
            <span class="hidden sm:inline">Episode Sebelumnya</span>
          </button>
          <div class="text-center px-4">
            <p class="text-white font-medium">${data.data.episode}</p>
            <p class="text-sm text-gray-400">dari ${data.data.anime_title || 'Anime'}</p>
          </div>
          <button class="btn-secondary flex items-center gap-2 px-4 py-2 ${!data.data.next_episode ? 'opacity-50 cursor-not-allowed' : ''}" id="nexteps" ${!data.data.next_episode ? 'disabled' : ''}>
            <span class="hidden sm:inline">Episode Selanjutnya</span>
            <i class="fas fa-chevron-right"></i>
          </button>
        </div>
      </div>

      <!-- Bookmark Time Feature -->
      <div class="card p-4">
        <h3 class="font-semibold text-purple-300 mb-3 flex items-center gap-2">
          <i class="fas fa-bookmark"></i>
          Bookmark Waktu
        </h3>
        <p class="text-sm text-gray-400 mb-3">Simpan waktu tonton untuk melanjutkan nanti</p>
        <div class="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <div class="flex gap-2">
            <div class="flex flex-col">
              <label class="text-xs text-gray-400 mb-1">Menit</label>
              <input type="number" id="minutes" min="0" class="input-modern w-16 text-center" />
            </div>
            <div class="flex flex-col">
              <label class="text-xs text-gray-400 mb-1">Detik</label>
              <input type="number" id="seconds" min="0" max="59" class="input-modern w-16 text-center" />
            </div>
          </div>
          <button id="saveTime" class="btn-primary flex items-center gap-2 px-4 py-2">
            <i class="fas fa-save"></i>
            Simpan
          </button>
        </div>
        <p id="savedTime" class="text-sm text-gray-400 mt-2"></p>
      </div>
    `;

    // Tombol navigasi
    document.getElementById("backto").addEventListener("click", (e) => {
      e.preventDefault();
      window.history.back();
    });

    document.getElementById("nexteps").addEventListener("click", (e) => {
      e.preventDefault();
      if (data.data.next_episode) {
        navigateTo(`/anime/otakudesu/watch?id=${animeId}&episode=${data.data.next_episode.slug}`);
      }
    });
    document.getElementById("backeps").addEventListener("click", (e) => {
      e.preventDefault();
      if (data.data.previous_episode) {
        navigateTo(
          `/anime/otakudesu/watch?id=${animeId}&episode=${data.data.previous_episode.slug}`
        );
      }
    });

    const player = document.getElementById("player");
    const buttonS = document.getElementById("servers");
    let lastResolution = await getLastResolution(animeId); // Default ke "main" jika tidak ada

    // Fungsi untuk mengatur player dan menyimpan resolusi
    const setPlayerSource = async (url, identifier) => {
      player.src = url;
      await saveLastResolution(animeId, identifier);
      // Highlight tombol aktif
      buttonS.querySelectorAll("button").forEach((b) => b.classList.remove("bg-purple-500", "text-white"));
      const activeBtn = buttonS.querySelector(`[data-identifier="${identifier}"]`);
      if (activeBtn) {
        activeBtn.classList.add("bg-purple-500", "text-white");
      }
    };

    // Tambahkan tombol untuk server utama (stream_url)
    const mainBtn = createButton("Server Utama", () => {
      setPlayerSource(data.data.stream_url, "main");
    });
    mainBtn.setAttribute("data-identifier", "main");
    buttonS.appendChild(mainBtn);

    // Loop untuk server tambahan, hanya sertakan provider "Pdrain", "PDrain", atau "Acefile"
    data.data.download_urls.mp4.forEach((s) => {
      s.urls.forEach((u) => {
        if (u.provider === "Pdrain" || u.provider === "PDrain" || u.provider === "Acefile") {
          const identifier = `${s.resolution}-${u.provider}`;
          const btn = createButton(`${s.resolution} - ${u.provider}`, () => {
            setPlayerSource(u.url, identifier);
          });
          btn.setAttribute("data-identifier", identifier);
          buttonS.appendChild(btn);
        }
      });
    });

    // Atur player ke resolusi terakhir yang dipilih
    if (lastResolution === "main") {
      setPlayerSource(data.data.stream_url, "main");
    } else {
      // Cari URL yang sesuai dengan identifier
      let found = false;
      data.data.download_urls.mp4.forEach((s) => {
        s.urls.forEach((u) => {
          if (u.provider === "Pdrain" || u.provider === "PDrain" || u.provider === "Acefile") {
            const identifier = `${s.resolution}-${u.provider}`;
            if (identifier === lastResolution) {
              setPlayerSource(u.url, identifier);
              found = true;
            }
          }
        });
      });
      // Jika tidak ditemukan (misal provider berubah), fallback ke main
      if (!found) {
        setPlayerSource(data.data.stream_url, "main");
      }
    }

    // Fitur Bookmark Waktu
    const minutesInput = document.getElementById("minutes");
    const secondsInput = document.getElementById("seconds");
    const saveButton = document.getElementById("saveTime");
    const savedTimeDisplay = document.getElementById("savedTime");

    // Load waktu tersimpan
    const savedTime = await getBookmarkTime(episodeId);
    if (savedTime) {
      minutesInput.value = savedTime.minutes || 0;
      secondsInput.value = savedTime.seconds || 0;
      savedTimeDisplay.textContent = `Waktu tersimpan: ${savedTime.minutes} menit ${savedTime.seconds} detik`;
    } else {
      savedTimeDisplay.textContent = "Belum ada waktu tersimpan.";
    }

    // Simpan waktu
    saveButton.addEventListener("click", async () => {
      const minutes = parseInt(minutesInput.value) || 0;
      const seconds = parseInt(secondsInput.value) || 0;
      const timeData = { minutes, seconds };
      await saveBookmarkTime(episodeId, timeData);
      savedTimeDisplay.textContent = `Waktu tersimpan: ${minutes} menit ${seconds} detik`;
      alert("Waktu berhasil disimpan!");
    });

    // Save to history
    await saveHistory(animeId, episodeId, data.data.episode || 'Anime', data.data.episode, 'OtakuDesu', data.data.poster || '');

    // Render rekomendasi anime acak
    rekomenAnime(rekomen);
  } catch (err) {
    console.error(err);
    container.innerText = "Gagal mengambil streaming anime.";
  }
}

// =======================
// Rekomendasi Anime Acak
// =======================
async function rekomenAnime(container) {
  const max = 10;
  const randInt = Math.floor(Math.random() * max);

  try {
    const result = await fetchFromSource("OtakuDesu", `complete-anime/${randInt}`);

    if (!result?.data?.data || result.data.data.length === 0) {
      container.innerHTML = `<p class="text-gray-500 p-2">Tidak ada rekomendasi anime.</p>`;
      return;
    }

    container.innerHTML = `
      <h2 class="font-semibold mb-2 text-purple-300 text-lg px-2">Rekomendasi Anime</h2>
      <div class="flex flex-col gap-2 overflow-y-auto max-h-[500px] p-2">
      </div>
    `;

    const listContainer = container.querySelector("div");

    result.data.data.completeAnimeData.forEach((anime) => {
      const card = document.createElement("a");
      card.href = "#";
      card.className = `
        flex items-center gap-3 bg-gray-800 p-2 rounded shadow hover:shadow-lg transition
      `;
      card.innerHTML = `
        <img src="${anime.poster}" alt="${
        anime.title
      }" class="w-[100px] h-[50px] object-cover rounded-md"/>
        <div class="flex flex-col">
          <span class="text-purple-300 font-medium truncate">${
            anime.title
          }</span>
          <span class="text-xs text-gray-300 block mt-1">Episode: ${
            anime.episode_count
          }</span>
          <span class="text-xs text-gray-400">From ${result.source}</span>
        </div>
      `;
      card.addEventListener("click", (e) => {
        e.preventDefault();
        navigateTo(`/anime/otakudesu/detail?id=${anime.slug}`);
      });
      listContainer.appendChild(card);
    });
  } catch (err) {
    console.error(err);
    container.innerHTML = `<p class="text-gray-500 p-2">Gagal memuat rekomendasi anime.</p>`;
  }
}

function createButton(text, onClick) {
  const btn = document.createElement("button");
  btn.textContent = text;
  btn.className = "px-2 py-1 bg-gray-700 text-gray-300 rounded hover:bg-purple-600";
  btn.addEventListener("click", onClick);
  return btn;
}

export function watch() {
  setTimeout(() => {
    const container = document.getElementById("container");
    const rekomen = document.getElementById("rekomen");

    const urlParams = new URLSearchParams(location.search);
    const animeId = urlParams.get("id");
    const episodeId = urlParams.get("episode") || urlParams.get("id"); // fallback

    document.title = animeId || "Streaming";

    if (!animeId) container.innerText = "Maaf, streaming tidak ditemukan";
    else loadStreaming(animeId, episodeId, container, rekomen);
  }, 0);

  return `
  <div class="flex flex-col md:flex-row gap-2">
    <div id="container" class="bg-gray-900 w-screen md:w-[100vh] rounded p-3">
      <div class="flex items-center justify-center h-64">
        <div class="text-center">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto mb-4"></div>
          <p class="text-purple-300 font-medium">Memuat konten streaming...</p>
        </div>
      </div>
    </div>
    <div id="rekomen" class="bg-gray-900 w-screen md:w-[100vh] rounded p-3">
      <div class="flex items-center justify-center h-64">
        <div class="text-center">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto mb-4"></div>
          <p class="text-purple-300 font-medium">Memuat rekomendasi...</p>
        </div>
      </div>
    </div>
  </div>
  `;
}
