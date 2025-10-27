import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";

const Navbar = () => {
  const navigate = useNavigate();
  const { user, loginWithGoogle } = useAuth();
  const [showLoginNotif, setShowLoginNotif] = useState(false);

  useEffect(() => {
    if (!user) {
      setShowLoginNotif(true);
    } else {
      setShowLoginNotif(false);
    }
  }, [user]);

  const handleLogin = async () => {
    try {
      await loginWithGoogle();
    } catch (error) {
      alert("Login gagal: " + error.message);
    }
  };

  const handleCloseNotif = () => {
    setShowLoginNotif(false);
  };

  const isDesktop = window.innerWidth >= 1024;

  if (user && isDesktop) {
    // Top navigation for desktop
    return (
      <nav className="nav-bar-top backdrop-blur-sm">
        <div className="flex justify-between items-center max-w-6xl mx-auto">
          <div className="flex items-center gap-6">
            <button
              className="hover:text-purple-500 transition-all duration-500 flex items-center gap-2"
              onClick={() => navigate("/")}
              aria-label="Home"
            >
              <i className="fa-solid fa-house"></i>
              <span className="hidden md:inline">Home</span>
            </button>
            <button
              className="hover:text-blue-500 transition-all duration-500 flex items-center gap-2"
              onClick={() => navigate("/dashboard")}
              aria-label="Dashboard"
            >
              <i className="fa-solid fa-user"></i>
              <span className="hidden md:inline">Dashboard</span>
            </button>
            <button
              className="hover:text-red-500 transition-all duration-500 flex items-center gap-2"
              onClick={() => navigate("/explore")}
              aria-label="Explore"
            >
              <i className="fa-solid fa-compass"></i>
              <span className="hidden md:inline">Explore</span>
            </button>
            <button
              className="hover:text-purple-500 transition-all duration-500 flex items-center gap-2"
              onClick={() => navigate("/favorite")}
              aria-label="Favorite"
            >
              <i className="fa-solid fa-heart"></i>
              <span className="hidden md:inline">Favorite</span>
            </button>
            <button
              className="hover:text-green-500 transition-all duration-500 flex items-center gap-2"
              onClick={() => navigate("/history")}
              aria-label="History"
            >
              <i className="fa-solid fa-history"></i>
              <span className="hidden md:inline">History</span>
            </button>
          </div>
          <p className="text-sm">Welcome, {user.displayName}</p>
        </div>
      </nav>
    );
  }

  if (!user && isDesktop) {
    // Top navigation for desktop (logged out)
    return (
      <nav className="nav-bar-top backdrop-blur-sm">
        <div className="flex justify-between items-center max-w-6xl mx-auto">
          <div className="flex items-center gap-6">
            <button
              className="hover:text-red-500 transition-all duration-500 flex items-center gap-2"
              onClick={() => navigate("/explore")}
              aria-label="Explore"
            >
              <i className="fa-solid fa-compass"></i>
              <span className="hidden md:inline">Explore</span>
            </button>
            <button
              className="hover:text-purple-500 transition-all duration-500 flex items-center gap-2"
              onClick={() => navigate("/")}
              aria-label="Home"
            >
              <i className="fa-solid fa-house"></i>
              <span className="hidden md:inline">Home</span>
            </button>
          </div>
          <div className="flex items-center gap-4">
            <button
              className="btn-secondary text-sm px-3 py-2"
              onClick={handleLogin}
            >
              Login
            </button>
          </div>
        </div>
      </nav>
    );
  }

  if (!user) {
    // Bottom navigation for mobile/tablet (logged out)
    return (
      <>
        {showLoginNotif && (
          <div class="fixed z-[9999] top-4 left-4 bg-gray-900 text-gray-100 w-[280px] shadow-lg rounded-lg border border-gray-700 p-4 flex items-start">
            <p>
              Hallo, kamu belum login nihh! coba login dulu biar bisa simpen
              anime favorite kamuu...{" "}
              <a
                class="text-green-500 hover:text-green-800 transition-all duration-500 rounded mt-2 text-[15px]"
                onClick={handleLogin}
              >
                Login <i class="fa-brands fa-google"></i>
              </a>
            </p>
            <div class="flex gap-2">
              <button
                class="text-red-500 hover:text-red-800 transition-all duration-500 rounded text-[15px]"
                onClick={handleCloseNotif}
              >
                <i class="fa-solid fa-x"></i>
              </button>
            </div>
          </div>
        )}
        <nav className="nav-bar-bottom backdrop-blur-sm">
          <div className="flex justify-around items-center py-2">
            <button
              className="hover:text-red-500 transition-all duration-500 flex flex-col items-center gap-1"
              onClick={() => navigate("/explore")}
              aria-label="Explore"
            >
              <i className="fa-solid fa-compass text-lg"></i>
              <span className="text-xs">Explore</span>
            </button>
            <button
              className="hover:text-purple-500 transition-all duration-500 flex flex-col items-center gap-1"
              onClick={() => navigate("/")}
              aria-label="Home"
            >
              <i className="fa-solid fa-house text-lg"></i>
              <span className="text-xs">Home</span>
            </button>
          </div>
        </nav>
      </>
    );
  }

  // Bottom navigation for mobile/tablet (logged in)
  return (
    <nav className="nav-bar-bottom backdrop-blur-sm">
      <div className="flex justify-around items-center py-2">
        <button
          className="hover:text-purple-500 transition-all duration-500 flex flex-col items-center gap-1"
          onClick={() => navigate("/")}
          aria-label="Home"
        >
          <i className="fa-solid fa-house text-lg"></i>
          <span className="text-xs">Home</span>
        </button>
        <button
          className="hover:text-blue-500 transition-all duration-500 flex flex-col items-center gap-1"
          onClick={() => navigate("/dashboard")}
          aria-label="Dashboard"
        >
          <i className="fa-solid fa-user text-lg"></i>
          <span className="text-xs">Dashboard</span>
        </button>
        <button
          className="hover:text-red-500 transition-all duration-500 flex flex-col items-center gap-1"
          onClick={() => navigate("/explore")}
          aria-label="Explore"
        >
          <i className="fa-solid fa-compass text-lg"></i>
          <span className="text-xs">Explore</span>
        </button>
        <button
          className="hover:text-purple-500 transition-all duration-500 flex flex-col items-center gap-1"
          onClick={() => navigate("/favorite")}
          aria-label="Favorite"
        >
          <i className="fa-solid fa-heart text-lg"></i>
          <span className="text-xs">Favorite</span>
        </button>
        <button
          className="hover:text-green-500 transition-all duration-500 flex flex-col items-center gap-1"
          onClick={() => navigate("/history")}
          aria-label="History"
        >
          <i className="fa-solid fa-history text-lg"></i>
          <span className="text-xs">History</span>
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
