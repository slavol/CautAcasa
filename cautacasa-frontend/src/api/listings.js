import axios from "axios";
import API_BASE_URL from "../config/api";

const LISTINGS_API = axios.create({
  baseURL: `${API_BASE_URL}/api/listings`,
  headers: {
    "Content-Type": "application/json",
  },
});

export const getListings = () => LISTINGS_API.get("/");

export const filterListings = (filters) =>
  LISTINGS_API.post("/filter", filters);

export const getListingById = (id) => LISTINGS_API.get(`/${id}`);