import axios from "axios";

const FAV = axios.create({
  baseURL: "http://localhost:5050/api/favorites",
  headers: {
    "Content-Type": "application/json",
  },
});

// ia favoritele userului
export const getFavorites = (userId) => FAV.get(`/${userId}`);

// adauga un listing la favorite
export const addFavorite = (userId, listingId) =>
  FAV.post("/add", { userId, listingId });

// sterge un favorite
export const removeFavorite = (userId, listingId) =>
  FAV.post("/remove", { userId, listingId });