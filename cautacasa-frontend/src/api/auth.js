import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5050/api/auth",
  headers: {
    "Content-Type": "application/json",
  },
});

export const registerUser = (data) => API.post("/register", data);

export const verifyPhone = (data) => API.post("/verify-phone", data);

export const loginUser = (data) => API.post("/login", data);