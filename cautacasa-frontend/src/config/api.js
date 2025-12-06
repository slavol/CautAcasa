// Centralizare configurație API
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5050";

export default API_BASE_URL;

// Helper function pentru apeluri autentificate
export const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};
