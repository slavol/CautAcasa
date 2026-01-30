import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const AI_BASE_URL = process.env.LOCAL_AI_URL || "http://100.107.244.9:11434";
const MODEL_NAME = "llama3.1"; 

const aiClient = axios.create({
  baseURL: AI_BASE_URL,
  timeout: 300000, 
  headers: { "Content-Type": "application/json" },
});

const cleanJsonString = (str) => {
  if (!str) return "{}";
  let cleaned = str.replace(/```json/g, "").replace(/```/g, "").trim();
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1) {
      cleaned = cleaned.substring(firstBrace, lastBrace + 1);
  }
  return cleaned;
};

// EXTRAGERE FILTRE (Modul STATE UPDATE)
export const extractFiltersWithLocalAI = async (userMessage, previousFilters = {}) => {
  
  const prevJson = JSON.stringify(previousFilters);

  const systemPrompt = `Esti un manager de stare (State Manager) pentru un imobiliar.
  
  STAREA CURENTA (Filtre active): ${prevJson}
  
  INPUT UTILIZATOR: "${userMessage}"

  Sarcina ta:
  1. Analizeaza inputul utilizatorului.
  2. Actualizeaza STAREA CURENTA bazat pe ce a cerut utilizatorul.
  3. Daca utilizatorul NU mentioneaza un camp (de ex. nu zice nimic de oras), PASTREAZA valoarea din STAREA CURENTA.
  4. Daca utilizatorul schimba ceva (ex: "dar de vanzare"), actualizeaza doar acel camp si reseteaza campurile care intra in conflict (ex: pretul pentru chirie nu se aplica la vanzare).

  JSON Schema Output:
  {
    "city": string | null,
    "priceMax": number | null,
    "roomsMin": number | null,
    "propertyType": "garsoniera" | "apartament" | "casa" | null,
    "transaction": "RENT" | "SALE" | null
  }

  Reguli Speciale:
  - "Garsoniera" inseamna propertyType: "garsoniera", roomsMin: 1.
  - Ignora RON/LEI. Totul e EURO.
  - Pret < 2000 => RENT, Pret > 2000 => SALE (doar daca transaction e null).

  Raspunde DOAR cu JSON-ul actualizat.`;

  try {
    const response = await aiClient.post("/api/generate", {
      model: MODEL_NAME,
      prompt: systemPrompt,
      stream: false,
      format: "json",
      temperature: 0.1, 
    });

    if (response.data?.response) {
      return JSON.parse(cleanJsonString(response.data.response));
    }
  } catch (error) {
    console.error("❌ Eroare AI Filtre:", error.message);
  }
  return null;
};

// GENERARE RĂSPUNS
export const generateChatResponse = async (userMessage, foundListings) => {
  if (!foundListings || foundListings.length === 0) {
    return "Nu am găsit oferte pe aceste criterii. Încercăm să schimbăm zona sau prețul?";
  }

  const context = foundListings.map(l => 
    `- ${l.cleanTitle} (${l.city}): ${l.priceEUR} EUR`
  ).join("\n");

  const systemPrompt = `Esti asistent imobiliar.
  Ai gasit ofertele:
  ${context}
  
  User: "${userMessage}"
  
  Sarcina: Spune scurt (max 2 fraze) ca ai gasit aceste oferte.`;

  try {
    const response = await aiClient.post("/api/generate", {
      model: MODEL_NAME,
      prompt: userMessage, 
      system: systemPrompt,
      stream: false,
      temperature: 0.3,
    });
    return response.data.response;
  } catch (error) {
    return "Am găsit ofertele de mai jos.";
  }
};