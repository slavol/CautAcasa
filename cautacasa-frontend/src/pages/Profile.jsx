import { useNavigate } from "react-router-dom";
import UserNavbar from "../components_user/NavbarUser";
import { useAuth } from "../context/AuthContext";
import { FiUser, FiMail, FiPhone, FiLogOut, FiShield } from "react-icons/fi";

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <UserNavbar />
        <div className="flex justify-center items-center h-96">
          <div className="text-xl text-gray-600">Trebuie să fii autentificat</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <UserNavbar />

      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Profilul meu</h1>

        <div className="bg-white rounded-lg shadow-md p-8 mb-6">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center text-white text-3xl font-bold">
              {user.name?.charAt(0).toUpperCase() || "U"}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{user.name}</h2>
              <p className="text-gray-500">Membru CautAcasa</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <FiUser className="text-2xl text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Nume</p>
                <p className="text-lg font-medium text-gray-900">{user.name}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <FiMail className="text-2xl text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="text-lg font-medium text-gray-900">{user.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <FiPhone className="text-2xl text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Telefon</p>
                <p className="text-lg font-medium text-gray-900">
                  {user.phone || "Neintrodus"}
                </p>
                {user.phoneVerified && (
                  <span className="inline-block px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full mt-1">
                    Verificat ✓
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <FiShield className="text-2xl text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Rol</p>
                <p className="text-lg font-medium text-gray-900">
                  {user.role === "ADMIN" ? "Administrator" : "Utilizator"}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Acțiuni</h3>

          <div className="space-y-3">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 p-4 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition"
            >
              <FiLogOut className="text-xl" />
              <span className="font-medium">Deconectare</span>
            </button>

            {user.role === "ADMIN" && (
              <button
                onClick={() => navigate("/admin")}
                className="w-full flex items-center gap-3 p-4 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition"
              >
                <FiShield className="text-xl" />
                <span className="font-medium">Panou Admin</span>
              </button>
            )}
          </div>
        </div>

        <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-semibold text-blue-900 mb-2">Istoric conversatii AI</h4>
          <p className="text-blue-700 text-sm">
            Poți accesa istoricul conversatiilor cu inteligenta artificiala
          </p>
          <button
            onClick={() => navigate("/chat")}
            className="w-full flex items-center gap-3 p-4 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition"
          >
            💬
            <span className="font-medium">Istoric conversații AI</span>
          </button>
        </div>
      </div>
    </div>
  );
}
