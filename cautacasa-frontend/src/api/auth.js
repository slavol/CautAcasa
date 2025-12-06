// src/api/auth.js
import axios from "axios";
import API_BASE_URL from "../config/api";

const API = axios.create({
  baseURL: `${API_BASE_URL}/api/auth`,
  headers: { "Content-Type": "application/json" }
});

// REGISTER — returnează token
export const registerUser = (data) => API.post("/register", data);

// VERIFY PHONE — necesită token
export const verifyPhone = (data) =>
  API.post("/verify-phone", data, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`
    }
  });

export const loginUser = (data) => API.post("/login", data);