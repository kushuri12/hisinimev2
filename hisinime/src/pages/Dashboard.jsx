import { useAuth } from '../hooks/useAuth.js';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

const Dashboard = () => {
  const { user, logout, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Dashboard - HisiNime v2";
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      alert("Logout gagal: " + error.message);
    }
  };

  const handleLogin = async () => {
    try {
      await loginWithGoogle();
    } catch (error) {
      alert("Login gagal: " + error.message);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-gradient font-bold text-xl md:text-2xl mb-4">Dashboard</h1>
          <p className="mb-4">Kamu perlu login untuk mengakses dashboard.</p>
          <button
            onClick={handleLogin}
            className="btn-secondary text-sm px-4 py-2"
          >
            Login dengan Google <i className="fa-brands fa-google"></i>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="content-section w-full max-w-6xl mx-auto p-4">
        <div className="mb-6">
          <h1 className="text-gradient font-bold text-xl md:text-2xl text-center mb-4">Profil</h1>

          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="text-white">Halo, {user.displayName || user.email}</span>
            <button
              onClick={handleLogout}
              className="btn-secondary text-sm px-3 py-2"
            >
              Logout <i className="fa-solid fa-right-from-bracket"></i>
            </button>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-gradient font-bold text-xl mb-4">Informasi Akun</h2>
          <div className="bg-gray-800 p-4 rounded-lg">
            <img
              src={user.photoURL}
              alt="Profile Picture"
              className="mb-2 w-[70px] h-[70px] rounded-full object-cover"
            />
            <p className="text-white"><strong>Nama:</strong> {user.displayName || "N/A"}</p>
            <p className="text-white"><strong>Email:</strong> {user.email || "N/A"}</p>
            <p className="text-white"><strong>UID:</strong> {user.uid}</p>
            <p className="text-white"><strong>Provider:</strong> {user.providerData[0]?.providerId || "N/A"}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
