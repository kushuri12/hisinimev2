import { navigateTo } from "../../router/router.js";
import { fetchFromSource } from '../../api.js';
import { getBookmarkTime, saveBookmarkTime, getPreferredResolution, savePreferredResolution, saveHistory } from '../../storage/storage.js';

const API = "https://www.sankavollerei.com/anime/";

async function loadStreaming(animeId, episodeId, container, rekomen) {
  try {
    const result = await fetchFromSource("Samehadaku", `episode/${episodeId}`);
    if (!result.data.data) {
      container.innerHTML = `
        <div class="flex flex-col items-center justify-center h-64 text-center">
          <i class="fas fa-exclamation-triangle text-4xl text-red-400 mb-4"></i>
          <p class="text-gray-300">Streaming anime tidak tersedia.</p>
        </div>
      `;
      return;
    }
    const data = result.data.data;

    container.innerHTML = `
      <!-- Header Section -->
      <div class="flex items-center justify-between mb-6">
        <button class="btn-secondary flex items-center gap-2" id="backto">
          <i class="fas fa-arrow-left"></i>
          <span class="hidden sm:inline">Kembali</span>
        </button>
        <div class="text-center flex-1">
          <h1 class="text-gradient font-bold text-xl md:text-2xl leading-tight">${data.animeTitle || 'Anime'} - ${data.title}</h1>
          <p class="text-sm text-purple-400 font-semibold mt-1">Streaming dari Samehadaku</p>
        </div>
        <div class="w-20"></div> <!-- Spacer for centering -->
      </div>

      <!-- Video Player Section -->
      <div class="card p-4 mb-6">
        <iframe id="player" class="w-full aspect-video rounded-lg shadow-lg" src="" frameborder="0" allowfullscreen></iframe>
      </div>

      <!-- Controls Section -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <!-- Quality Selection -->
        <div class="card p-4">
          <h3 class="font-semibold text-purple-300 mb-3 flex items-center gap-2">
            <i class="fas fa-cog"></i>
            Kualitas Video
          </h3>
          <div id="qualities" class="flex flex-wrap gap-2"></div>
        </div>

        <!-- Server Selection -->
        <div class="card p-4">
          <h3 class="font-semibold text-purple-300 mb-3 flex items-center gap-2">
            <i class="fas fa-server"></i>
            Server Streaming
          </h3>
          <div id="servers" class="flex flex-wrap gap-2"></div>
        </div>
      </div>

      <!-- Episode Navigation -->
      <div class="card p-4 mb-6">
        <h3 class="font-semibold text-purple-300 mb-3 flex items-center gap-2">
          <i class="fas fa-list"></i>
          Navigasi Episode
        </h3>
        <div class="flex items-center justify-center gap-4">
          <button class="btn-secondary flex items-center gap-2 px-4 py-2 ${!data.prevEpisode ? 'opacity-50 cursor-not-allowed' : ''}" id="backeps" ${!data.prevEpisode ? 'disabled' : ''}>
            <i class="fas fa-chevron-left"></i>
            <span class="hidden sm:inline">Episode Sebelumnya</span>
          </button>
          <div class="text-center px-4">
            <p class="text-white font-medium">Episode ${data.title}</p>
            <p class="text-sm text-gray-400">dari ${data.animeTitle || 'Anime'}</p>
          </div>
          <button class="btn-secondary flex items-center gap-2 px-4 py-2 ${!data.nextEpisode ? 'opacity-50 cursor-not-allowed' : ''}" id="nexteps" ${!data.nextEpisode ? 'disabled' : ''}>
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
      if (data.nextEpisode) {
        navigateTo(`/anime/samehadaku/watch?id=${animeId}&episode=${data.nextEpisode.episodeId}`);
      }
    });
    document.getElementById("backeps").addEventListener("click", (e) => {
      e.preventDefault();
      if (data.prevEpisode) {
        navigateTo(`/anime/samehadaku/watch?id=${animeId}&episode=${data.prevEpisode.episodeId}`);
      }
    });

    renderQualities(data.server.qualities);

    // Save to history
    await saveHistory(animeId, episodeId, data.title || 'Anime', data.animeId, 'Samehadaku', data.poster || '');

    // Load rekomendasi anime
    rekomenAnime(rekomen);

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
    const result = await fetchFromSource("Samehadaku", `completed?page=${randInt}`);

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

    result.data.data.animeList.forEach((anime) => {
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
          <span class="text-purple-200 font-medium truncate">${
            anime.title
          }</span>
          <span class="text-xs text-gray-300 block mt-1">Status: ${
            anime.status
          }</span>
          <span class="text-xs text-gray-300 block mt-1">From Samehadaku</span>
      `;
      card.addEventListener("click", (e) => {
        e.preventDefault();
        navigateTo(`/anime/samehadaku/detail?id=${anime.animeId}`);
      });
      listContainer.appendChild(card);
    });
  } catch (err) {
    console.error(err);
    container.innerHTML = `<p class="text-gray-500 p-2">Gagal memuat rekomendasi anime.</p>`;
  }
}

async function renderQualities(qualities) {
  const qEl = document.getElementById("qualities");
  qEl.innerHTML = "";

  let targetButton = null;
  const savedResolution = await getPreferredResolution();

  qualities.forEach(q => {
    if (!q.serverList?.length) return;

    const btn = createButton(q.title, async () => {
      // simpan resolusi yang dipilih user
      await savePreferredResolution(q.title);
      renderServers(q.serverList);
    });

    qEl.appendChild(btn);

    // kalau resolusi sama dengan yang tersimpan
    if (savedResolution && q.title === savedResolution) {
      targetButton = btn;
    }

    // fallback ke 720p jika belum ada tersimpan
    if (!savedResolution && q.title.includes("720")) {
      targetButton = btn;
    }
  });

  // klik target button (resolusi tersimpan atau 720p), kalau tidak ada klik pertama
  if (targetButton) {
    targetButton.click();
  } else {
    qEl.querySelector("button")?.click();
  }
}

function renderServers(servers) {
  const sEl = document.getElementById("servers");
  const player = document.getElementById("player");
  sEl.innerHTML = "";
  servers.forEach(s => {
    const btn = createButton(s.title, async () => {
      console.log("ðŸŸ¡ Server ID terpilih:", s.serverId);

      // kalau serverId sudah URL, pakai langsung
      if (s.serverId.startsWith("http")) {
        player.src = s.serverId;
      } else {
        // ambil URL asli dari server ID via API
        try {
          const res = await fetch(`${API}samehadaku/server/${s.serverId}`);
          const json = await res.json();
          if (json?.data?.url) {
            player.src = json.data.url;
          } else {
            player.src = "";
            alert("URL streaming tidak ditemukan.");
          }
        } catch (e) {
          console.error(e);
          alert("Gagal memuat server.");
        }
      }
    });
    sEl.appendChild(btn);
  });
  sEl.querySelector("button")?.click(); // auto pilih server pertama
}

function createButton(text, onClick) {
  const btn = document.createElement("button");
  btn.textContent = text;
  btn.className = "px-2 py-1 bg-gray-600 rounded hover:bg-purple-600 text-white";
  btn.addEventListener("click", () => {
    btn.parentElement.querySelectorAll("button").forEach(b => b.classList.replace("bg-purple-600", "bg-gray-600"));
    btn.classList.replace("bg-gray-600", "bg-purple-600");
    onClick();
  });
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
