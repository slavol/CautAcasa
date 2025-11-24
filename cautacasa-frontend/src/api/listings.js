import axios from "axios";

const LISTINGS = axios.create({
  baseURL: "http://localhost:5050/api/listings",
  headers: {
    "Content-Type": "application/json",
  },
});

// cautare avansata
export const searchListings = (filters) => LISTINGS.post("/search", filters);

// toate anunturile (default)
export const getAllListings = () => LISTINGS.get("/all");