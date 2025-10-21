import { navigateTo } from "../../router/router.js";
import { fetchFromSource } from '../../api.js';

async function loadStreaming(animeId, episodeId, container, rekomen) {
  try {
    const result = await fetchFromSource("OtakuDesu", `episode/${episodeId}`);
    if (!result.data) {
      container.innerText = "Streaming anime tidak tersedia.";
      return;
    }
    const data = result.data;

    container.innerHTML = `
      <a class="bg-gray-700 text-center p-2 mr-2 rounded text-purple-300 hover:bg-purple-600 transition" href="#" id="backto">Kembali</a>
      <h1 class="mt-5 font-bold text-xl text-center mb-4 text-white">${data.data.episode}</h1>

      <div class="flex justify-between mt-3 w-full">
        <a class="bg-gray-700 text-center p-2 mr-2 rounded text-purple-300 hover:bg-purple-600 transition" href="#" id="backeps"><< Sebelumnya</a>
        <a class="bg-gray-700 text-center p-2 ml-2 rounded text-purple-300 hover:bg-purple-600 transition" href="#" id="nexteps">Selanjutnya >></a>
      </div>

      <iframe id="player" class="w-full aspect-video mt-4 rounded shadow" src="" frameborder="0" allowfullscreen></iframe>

      <div id="servers" class="mt-3 flex flex-wrap gap-2 text-purple-300 font-semibold">Server Tambahan: </div>

      <!-- Fitur Bookmark Waktu -->
      <div class="mt-4 p-2 bg-gray-800 rounded">
        <h3 class="font-semibold text-purple-300 mb-2">Bookmark Waktu (per Episode)</h3>
        <div class="flex gap-2 items-center">
          <label class="text-gray-300">Menit: <input type="number" id="minutes" min="0" class="w-16 px-2 py-1 border rounded bg-gray-700 text-white" /></label>
          <label class="text-gray-300">Detik: <input type="number" id="seconds" min="0" max="59" class="w-16 px-2 py-1 border rounded bg-gray-700 text-white" /></label>
          <button id="saveTime" class="px-4 py-1 bg-purple-500 text-white rounded hover:bg-purple-600">Simpan</button>
        </div>
        <p id="savedTime" class="text-sm text-gray-300 mt-1"></p>
      </div>
    `;

    // Tombol navigasi
    document.getElementById("backto").addEventListener("click", (e) => {
      e.preventDefault();
      navigateTo(`/anime/otakudesu`);
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
    const lastResolutionKey = `lastResolution-${animeId}`;
    let lastResolution = localStorage.getItem(lastResolutionKey) || "main"; // Default ke "main" jika tidak ada

    // Fungsi untuk mengatur player dan menyimpan resolusi
    const setPlayerSource = (url, identifier) => {
      player.src = url;
      localStorage.setItem(lastResolutionKey, identifier);
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
    const timeKey = `episodeTime-${episodeId}`;

    // Load waktu tersimpan
    const savedTime = JSON.parse(localStorage.getItem(timeKey));
    if (savedTime) {
      minutesInput.value = savedTime.minutes || 0;
      secondsInput.value = savedTime.seconds || 0;
      savedTimeDisplay.textContent = `Waktu tersimpan: ${savedTime.minutes} menit ${savedTime.seconds} detik`;
    } else {
      savedTimeDisplay.textContent = "Belum ada waktu tersimpan.";
    }

    // Simpan waktu
    saveButton.addEventListener("click", () => {
      const minutes = parseInt(minutesInput.value) || 0;
      const seconds = parseInt(secondsInput.value) || 0;
      const timeData = { minutes, seconds };
      localStorage.setItem(timeKey, JSON.stringify(timeData));
      savedTimeDisplay.textContent = `Waktu tersimpan: ${minutes} menit ${seconds} detik`;
      alert("Waktu berhasil disimpan!");
    });

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
  <div class="flex flex-col md:flex-row md:m-2 gap-2  ">
    <div id="container" class="bg-gray-900 w-screen md:w-[100vh] rounded p-3">Sedang memuat konten...</div>
    <div id="rekomen" class="bg-gray-900 w-screen md:w-[100vh] rounded p-3">Sedang memuat konten...</div>
  </div>
  `;
}
