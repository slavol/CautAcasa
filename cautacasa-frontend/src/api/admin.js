// src/api/admin.js
import axios from "axios";
import API_BASE_URL from "../config/api";

const ADMIN_API = axios.create({
  baseURL: `${API_BASE_URL}/api/admin`,
  headers: { "Content-Type": "application/json" },
});

// 👉 ADĂUGĂ TOKEN-UL LA FIECARE REQUEST
ADMIN_API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token"); // token-ul de login
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/* ============================================
   1) AI STATISTICS
============================================ */
export const getAdminAiStats = () => ADMIN_API.get("/stats/ai");

/* ============================================
   2) LISTINGS AI (CRUD + filters)
============================================ */

export const getAdminListingsAI = (options = {}) => {
  const params = new URLSearchParams();

  if (options.page) params.append("page", options.page);
  if (options.limit) params.append("limit", options.limit);
  if (options.onlyIncomplete) params.append("onlyIncomplete", "true");

  return ADMIN_API.get(`/listings-ai?${params.toString()}`);
};

export const createListingAI = (data) =>
  ADMIN_API.post("/listings-ai", data);

export const updateListingAI = (id, data) =>
  ADMIN_API.put(`/listings-ai/${id}`, data);

export const deleteListingAI = (id) =>
  ADMIN_API.delete(`/listings-ai/${id}`);

/* ============================================
   3) SCRAPER CONTROL
============================================ */

export const startScraper = () => ADMIN_API.post("/scraper/start");

export const getScraperStatus = () => ADMIN_API.get("/scraper/status");

export default {
  getAdminAiStats,
  getAdminListingsAI,
  createListingAI,
  updateListingAI,
  deleteListingAI,
  startScraper,
  getScraperStatus,
};