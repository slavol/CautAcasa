import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard.jsx";
import Register from "./pages/Register.jsx";
import Login from "./pages/Login.jsx";
import VerifyPhone from "./pages/VerifyPhone.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

import Listings from "./pages/Listings.jsx";                // 👈 corect
import ListingsDetails from "./pages/ListingsDetails.jsx";  // 👈 corect
import Profile from "./pages/Profile";

import ChatList from "./pages/ChatList.jsx";
import ChatRoom from "./pages/ChatRoom.jsx";

import { AuthProvider } from "./context/AuthContext";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-phone" element={<VerifyPhone />} />
          <Route path="/login" element={<Login />} />

          {/* 👇 NOILE RUTE CORRECTE */}
          <Route path="/listings" element={<Listings />} />
          <Route path="/listings/:id" element={<ListingsDetails />} />

          <Route path="/chat" element={<ChatList />} />
          <Route path="/chat/:chatId" element={<ChatRoom />} />

          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}