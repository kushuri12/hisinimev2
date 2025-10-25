import { getCurrentUser, logout } from "../auth.js";
import { navigateTo } from "../router/router.js";

function createDashboardPage() {
  return function () {
    const user = getCurrentUser();
    if (!user) {
      // Redirect to home if not logged in
      navigateTo("/");
      return;
    }

    setTimeout(async () => {
      document.title = "Dashboard - HisiNime v2";
      // Logout listener
      const logoutBtn = document.getElementById("logout-dashboard");
      if (logoutBtn) {
        logoutBtn.addEventListener("click", async () => {
          try {
            await logout();
            navigateTo("/");
          } catch (error) {
            alert("Logout gagal: " + error.message);
          }
        });
      }

    }, 0);

    return `
      <div class="nav-bar w-screen p-4">
        <div class="flex flex-col items-center gap-4 max-w-4xl mx-auto">
          <h1 class="text-gradient font-bold text-xl md:text-2xl text-center">Dashboard - HisiNime v2</h1>

          <div class="flex items-center gap-2 mb-4">
            <span class="text-white">Halo, ${
              user.displayName || user.email
            }</span>
            <button id="logout-dashboard" class="btn-secondary text-sm px-3 py-2">Logout <i class="fa-solid fa-right-from-bracket"></i></button>
          </div>
        </div>
      </div>

      <div class="content-section w-full max-w-6xl mx-auto p-4">
        <div class="mb-6">
          <h2 class="text-gradient font-bold text-xl mb-4">Informasi Akun</h2>
          <div class="bg-gray-800 p-4 rounded-lg">
          <img id="userPP" src=${user.photoURL} alt="Profile Picture" class="mb-2 w-[70px] h-[70px] rounded-full object-cover" />
            <p class="text-white"><strong>Nama:</strong> ${
              user.displayName || "N/A"
            }</p>
            <p class="text-white"><strong>Email:</strong> ${
              user.email || "N/A"
            }</p>
            <p class="text-white"><strong>UID:</strong> ${user.uid}</p>
            <p class="text-white"><strong>Provider:</strong> ${
              user.providerData[0]?.providerId || "N/A"
            }</p>
          </div>
        </div>
      </div>
    `;
  };
}

export const dashboard = createDashboardPage();
