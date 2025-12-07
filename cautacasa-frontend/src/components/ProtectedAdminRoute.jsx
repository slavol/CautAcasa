import { useAuth } from "../context/AuthContext";
import { Navigate } from "react-router-dom";

export default function ProtectedAdminRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;

  // dacă nu e logat → redirect la login
  if (!user) return <Navigate to="/login" />;

  // dacă nu e admin → redirect la home
  if (!user.isAdmin) return <Navigate to="/" />;

  return children;
}