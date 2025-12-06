import axios from "axios";
import API_BASE_URL from "../config/api";

const LISTINGS_API = axios.create({
  baseURL: `${API_BASE_URL}/api/listings`,
  headers: {
    "Content-Type": "application/json",
  },
});

// GET all
export const getListings = () => LISTINGS_API.get("/");

// FILTER
export const filterListings = (filters) =>
  LISTINGS_API.post("/filter", filters);

// SINGLE LISTING
export const getListingById = (id) => LISTINGS_API.get(`/${id}`);