import { navigateTo } from "../../router/router.js";
import { loginWithGoogle, getCurrentUser } from "../../auth.js";

const navBlock = document.getElementById("nav");
const loginNotif = document.getElementById("notifJikaBlmLogin");

function updateNavbar() {
const user = getCurrentUser();

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
    navBlock.innerHTML = `
            <button class="hover:text-blue-500 transition-all duration-500" onclick='navigateTo("/dashboard")'>
                <i class="fa-solid fa-user"></i>
            </button>
            <button class="hover:text-red-500 transition-all duration-500" onclick='navigateTo("/explore")'>
                <i class="fa-solid fa-compass"></i>
            </button>
            <button class="hover:text-purple-500 transition-all duration-500" onclick='navigateTo("/")'>
                <i class="fa-solid fa-house"></i>
            </button>
            <button class="hover:text-yellow-500 transition-all duration-500" onclick='navigateTo("/favorite")'>
                <i class="fa-solid fa-bookmark"></i>
            </button>
        `;
  } else {
    navBlock.innerHTML = `
            <button class="hover:text-red-500 transition-all duration-500" onclick='navigateTo("/explore")'>
                <i class="fa-solid fa-compass"></i>
            </button>
            <button class="hover:text-purple-500 transition-all duration-500" onclick='navigateTo("/")'>
                <i class="fa-solid fa-house"></i>
            </button>
        `;
  }
}

// Initial update
updateNavbar();

// Listen for auth state changes
window.addEventListener("authStateChanged", updateNavbar);
