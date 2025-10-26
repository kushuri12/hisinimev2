import { navigateTo } from "../../router/router.js";
import { loginWithGoogle, getCurrentUser } from "../../auth.js";

const navBlock = document.getElementById("nav");
const loginNotif = document.getElementById("notifJikaBlmLogin");

function updateNavbar() {
  const user = getCurrentUser();
  const isDesktop = window.innerWidth >= 1024; // lg breakpoint

  if (user) {
    loginNotif.innerHTML = ``;
  } else {
    loginNotif.innerHTML = `
        <div class="bg-gray-900 text-gray-100 w-[280px] shadow-lg rounded-lg border border-gray-700 p-4 flex items-start">
        <p>Hallo, kamu belum login nihh! coba login dulu biar bisa simpen anime favorite kamuu... <a class="text-green-500 hover:text-green-800 transition-all duration-500 rounded mt-2 text-[15px]" id="loginDuluYgy">Login <i class="fa-brands fa-google"></i></a></p>
            <div class="flex gap-2">
                <button class="text-red-500 hover:text-red-800 transition-all duration-500 rounded text-[15px]" id="loginDuluYgy"><i class="fa-solid fa-x"></i></button>
            </div>
        </div>
            `;
  }

  if (document.getElementById("loginDuluYgy")) {
    document
      .getElementById("loginDuluYgy")
      .addEventListener("click", async () => {
        try {
          await loginWithGoogle();
        } catch (error) {
          alert("Login gagal: " + error.message);
        }
      });

    const notif = document.getElementById("notifJikaBlmLogin");
    notif.classList.remove("hidden");

    notif.addEventListener("click", async () => {
        notif.remove()
    })
  }

  if (user) {
    if (isDesktop) {
      // Top navigation for desktop
      navBlock.className = "nav-bar-top";
      navBlock.innerHTML = `
        <div class="flex justify-between items-center max-w-6xl mx-auto">
          <div class="flex items-center gap-6">
            <button class="hover:text-blue-500 transition-all duration-500 flex items-center gap-2" onclick='navigateTo("/dashboard")' aria-label="Dashboard">
                <i class="fa-solid fa-user"></i>
                <span class="hidden md:inline">Dashboard</span>
            </button>
            <button class="hover:text-red-500 transition-all duration-500 flex items-center gap-2" onclick='navigateTo("/explore")' aria-label="Explore">
                <i class="fa-solid fa-compass"></i>
                <span class="hidden md:inline">Explore</span>
            </button>
            <button class="hover:text-purple-500 transition-all duration-500 flex items-center gap-2" onclick='navigateTo("/")' aria-label="Home">
                <i class="fa-solid fa-house"></i>
                <span class="hidden md:inline">Home</span>
            </button>
            <button class="hover:text-yellow-500 transition-all duration-500 flex items-center gap-2" onclick='navigateTo("/favorite")' aria-label="Favorite">
                <i class="fa-solid fa-bookmark"></i>
                <span class="hidden md:inline">Favorite</span>
            </button>
          </div>
          <div class="flex items-center gap-4">
            <span class="text-sm text-gray-300">Welcome, ${user.displayName || user.email}</span>
          </div>
        </div>
      `;
    } else {
      // Bottom navigation for mobile/tablet
      navBlock.className = "nav-bar-bottom";
      navBlock.innerHTML = `
        <div class="flex justify-around items-center py-2">
          <button class="hover:text-blue-500 transition-all duration-500 flex flex-col items-center gap-1" onclick='navigateTo("/dashboard")' aria-label="Dashboard">
              <i class="fa-solid fa-user text-lg"></i>
              <span class="text-xs">Profile</span>
          </button>
          <button class="hover:text-red-500 transition-all duration-500 flex flex-col items-center gap-1" onclick='navigateTo("/explore")' aria-label="Explore">
              <i class="fa-solid fa-compass text-lg"></i>
              <span class="text-xs">Explore</span>
          </button>
          <button class="hover:text-purple-500 transition-all duration-500 flex flex-col items-center gap-1" onclick='navigateTo("/")' aria-label="Home">
              <i class="fa-solid fa-house text-lg"></i>
              <span class="text-xs">Home</span>
          </button>
          <button class="hover:text-yellow-500 transition-all duration-500 flex flex-col items-center gap-1" onclick='navigateTo("/favorite")' aria-label="Favorite">
              <i class="fa-solid fa-bookmark text-lg"></i>
              <span class="text-xs">Favorite</span>
          </button>
        </div>
      `;
    }
  } else {
    if (isDesktop) {
      // Top navigation for desktop (logged out)
      navBlock.className = "nav-bar-top";
      navBlock.innerHTML = `
        <div class="flex justify-between items-center max-w-6xl mx-auto">
          <div class="flex items-center gap-6">
            <button class="hover:text-red-500 transition-all duration-500 flex items-center gap-2" onclick='navigateTo("/explore")' aria-label="Explore">
                <i class="fa-solid fa-compass"></i>
                <span class="hidden md:inline">Explore</span>
            </button>
            <button class="hover:text-purple-500 transition-all duration-500 flex items-center gap-2" onclick='navigateTo("/")' aria-label="Home">
                <i class="fa-solid fa-house"></i>
                <span class="hidden md:inline">Home</span>
            </button>
          </div>
          <div class="flex items-center gap-4">
            <button class="btn-secondary text-sm px-3 py-2" onclick="document.getElementById('loginDuluYgy').click()">Login</button>
          </div>
        </div>
      `;
    } else {
      // Bottom navigation for mobile/tablet (logged out)
      navBlock.className = "nav-bar-bottom";
      navBlock.innerHTML = `
        <div class="flex justify-around items-center py-2">
          <button class="hover:text-red-500 transition-all duration-500 flex flex-col items-center gap-1" onclick='navigateTo("/explore")' aria-label="Explore">
              <i class="fa-solid fa-compass text-lg"></i>
              <span class="text-xs">Explore</span>
          </button>
          <button class="hover:text-purple-500 transition-all duration-500 flex flex-col items-center gap-1" onclick='navigateTo("/")' aria-label="Home">
              <i class="fa-solid fa-house text-lg"></i>
              <span class="text-xs">Home</span>
          </button>
        </div>
      `;
    }
  }
}

// Initial update
updateNavbar();

// Listen for auth state changes and window resize
window.addEventListener("authStateChanged", updateNavbar);
window.addEventListener("resize", updateNavbar);
