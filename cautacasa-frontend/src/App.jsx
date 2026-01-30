import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard.jsx";
import Register from "./pages/Register.jsx";
import Login from "./pages/Login.jsx";
import VerifyPhone from "./pages/VerifyPhone.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

import Listings from "./pages/Listings.jsx";
import ListingsDetails from "./pages/ListingsDetails.jsx";
import Profile from "./pages/Profile";

import ChatList from "./pages/ChatList.jsx";
import ChatRoom from "./pages/ChatRoom.jsx";

import { AuthProvider } from "./context/AuthContext";

import AdminDashboard from "./pages/AdminDashboard.jsx";
import AdminListings from "./pages/AdminListings.jsx";
import AdminListingsIncomplete from "./pages/AdminIncompleteListings.jsx";
import AdminListingsNew from "./pages/AdminNewListings.jsx";
import AdminScraper from "./pages/AdminScraper.jsx";

import ProtectedAdminRoute from "./components/ProtectedAdminRoute.jsx";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>

          <Route path="/" element={<Dashboard />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-phone" element={<VerifyPhone />} />
          <Route path="/login" element={<Login />} />

          <Route path="/listings" element={<Listings />} />
          <Route path="/listings/:id" element={<ListingsDetails />} />

          {/* RUTELE DE CHAT */}
          <Route path="/chat" element={<ChatList />} />
          
          {/* 1. RUTA NOUĂ: Aceasta deschide camera goală */}
          <Route path="/chat/new" element={<ChatRoom />} /> 
          
          {/* 2. RUTA EXISTENTĂ: Pentru chat cu istoric */}
          <Route path="/chat/:chatId" element={<ChatRoom />} />

          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />


          <Route
            path="/admin/dashboard"
            element={
              // <ProtectedAdminRoute>
                <AdminDashboard />
              // </ProtectedAdminRoute>
            }
          />

          <Route
            path="/admin/listings"
            element={
              // <ProtectedAdminRoute>
                <AdminListings />
              // </ProtectedAdminRoute>
            }
          />

          <Route
            path="/admin/listings/incomplete"
            element={
              // <ProtectedAdminRoute>
                <AdminListingsIncomplete />
              // </ProtectedAdminRoute>
            }
          />

          <Route
            path="/admin/listings/new"
            element={
              // <ProtectedAdminRoute>
                <AdminListingsNew />
              // </ProtectedAdminRoute>
            }
          />

          <Route
            path="/admin/scraper"
            element={
              // <ProtectedAdminRoute>
                <AdminScraper />
              // </ProtectedAdminRoute>
            }
          />

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}