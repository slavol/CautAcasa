import axios from "axios";
import API_BASE_URL from "../config/api";

const LISTINGS_API = axios.create({
  baseURL: `${API_BASE_URL}/api/listings`,
  headers: {
    "Content-Type": "application/json",
  },
});

// --- MODIFICAREA IMPORTANTĂ ---
// Schimbăm din .post("/filter") în .get("/")
// Parametrii (filters) sunt trimiși automat în URL (ex: ?isOwner=true&priceMin=100)
export const filterListings = (filters) =>
  LISTINGS_API.get("/", { params: filters });

// Aceasta rămâne la fel (practic face același lucru ca filterListings fără parametri)
export const getListings = () => LISTINGS_API.get("/");

export const getListingById = (id) => LISTINGS_API.get(`/${id}`);