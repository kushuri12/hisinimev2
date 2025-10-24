import { navigateTo } from "../../router/router.js";
import { fetchFromSource } from '../../api.js';
import { getBookmarkTime, saveBookmarkTime, getLastResolution, saveLastResolution } from '../../storage/storage.js';

const API = "https://www.sankavollerei.com/anime/";

async function loadStreaming(animeId, episodeId, container, rekomen) {
  try {
    const result = await fetchFromSource("Samehadaku", `episode/${episodeId}`);
    if (!result.data.data) {
      container.innerText = "Streaming anime tidak tersedia.";
      return;
    }
    const data = result.data.data;

    container.innerHTML = `
      <a class="bg-transparent backdrop-blur-sm text-center px-3 py-2 mr-2 rounded text-purple-400 hover:bg-purple-600 transition" href="#" id="backto"><i class="fas fa-arrow-left"></i></a>
      <h1 class="mt-5 font-bold text-xl text-center mb-4 text-white">${data.title}</h1>

      <div class="flex justify-between mt-3 w-full">
        <a class="bg-gray-700 text-center p-2 mr-2 rounded text-purple-400 hover:bg-purple-600 transition" href="#" id="backeps"><< Sebelumnya</a>
        <a class="bg-gray-700 text-center p-2 ml-2 rounded text-purple-400 hover:bg-purple-600 transition" href="#" id="nexteps">Selanjutnya >></a>
      </div>

      <iframe id="player" class="w-full aspect-video mt-4 rounded shadow" src="" frameborder="0" allowfullscreen></iframe>

      <!-- Quality & Server -->
      <div id="qualities" class="mt-4 flex flex-wrap gap-2"></div>
      <div id="servers" class="mt-3 flex flex-wrap gap-2"></div>

      <!-- Fitur Bookmark Waktu -->
      <div class="mt-4 p-2 bg-gray-800 rounded">
        <h3 class="font-semibold text-purple-300 mb-2">Bookmark Waktu (per Episode)</h3>
        <div class="flex gap-2 items-center">
          <label class="text-white">Menit: <input type="number" id="minutes" min="0" class="w-16 px-2 py-1 border rounded bg-gray-700 text-white" /></label>
          <label class="text-white">Detik: <input type="number" id="seconds" min="0" max="59" class="w-16 px-2 py-1 border rounded bg-gray-700 text-white" /></label>
          <button id="saveTime" class="px-4 py-1 bg-purple-600 text-white rounded hover:bg-purple-700">Simpan</button>
        </div>
        <p id="savedTime" class="text-sm text-gray-300 mt-1"></p>
      </div>
    `;

    // Tombol navigasi
    document.getElementById("backto").addEventListener("click", (e) => {
      e.preventDefault();
      navigateTo(`/`);
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

    renderQualities(data.server.qualities, animeId);

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

async function renderQualities(qualities, animeId) {
  const qEl = document.getElementById("qualities");
  qEl.innerHTML = "";

  let targetButton = null;
  const savedResolution = await getLastResolution(animeId);

  qualities.forEach(q => {
    if (!q.serverList?.length) return;

    const btn = createButton(q.title, async () => {
      // simpan resolusi yang dipilih user
      await saveLastResolution(animeId, q.title);
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
    btn.parentElement.querySelectorAll("button").forEach(b => b.classList.remove("bg-purple-600","text-white"));
    btn.classList.add("bg-purple-600","text-white");
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
  <div class="flex flex-col md:flex-row md:m-2 gap-2  ">
    <div id="container" class="bg-gray-900 w-screen md:w-[100vh] rounded p-3">Sedang memuat konten...</div>
    <div id="rekomen" class="bg-gray-900 w-screen md:w-[100vh] rounded p-3">Sedang memuat konten...</div>
  </div>
  `;
}
