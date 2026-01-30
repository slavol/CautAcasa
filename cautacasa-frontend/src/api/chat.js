import axios from "axios";
import API_BASE_URL from "../config/api";

const CHAT_API = axios.create({
  baseURL: `${API_BASE_URL}/api/chat`,
  headers: { "Content-Type": "application/json" },
});

CHAT_API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const getChatSessions = () => CHAT_API.get("/list");

export const getChatMessages = (chatId) =>
  CHAT_API.get(`/${chatId}/messages`);

export const sendChatMessage = (data) =>
  CHAT_API.post("/send", data);

export const deleteChatSession = (chatId) => 
  CHAT_API.delete(`/${chatId}`);