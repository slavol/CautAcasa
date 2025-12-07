import axios from "axios";
import API_BASE_URL from "../config/api";

const CHAT_API = axios.create({
  baseURL: `${API_BASE_URL}/api/chat`,
  headers: { "Content-Type": "application/json" },
});

// ATAȘEAZĂ TOKEN LA FIECARE CERERE
CHAT_API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// LISTA SESIUNI
export const getChatSessions = () => CHAT_API.get("/list");

// MESAJE DINTR-O SESIUNE
export const getChatMessages = (chatId) =>
  CHAT_API.get(`/${chatId}/messages`);

// TRIMITE MESAJ LA AI
export const sendChatMessage = (data) =>
  CHAT_API.post("/send", data);