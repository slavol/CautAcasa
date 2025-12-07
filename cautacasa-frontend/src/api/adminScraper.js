import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5050/api",
  withCredentials: true,
});

export function startScraper() {
  return API.post("/admin/scraper/start");
}

export function getScraperStatus() {
  return API.get("/admin/scraper/status");
}