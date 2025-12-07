// ai/rankListings.js
import { geminiModel } from './geminiClient.js';

// utilitar ca să fim siguri că prindem JSON-ul chiar dacă vine cu ```json ... ```
function extractJson(text) {
  try {
    return JSON.parse(text);
  } catch {
    // încearcă să scoți ce e între ```json ... ```
    const match = text.match(/```json([\s\S]*?)```/i) || text.match(/```([\s\S]*?)```/i);
    if (match && match[1]) {
      return JSON.parse(match[1].trim());
    }
    throw new Error('Nu am reușit să parsez JSON-ul din răspunsul modelului.');
  }
}

/**
 * @param {Object} params
 * @param {string} params.userQuery - mesajul utilizatorului
 * @param {Array} params.listings  - anunțuri candidate (id, title, description, etc.)
 */
export async function rankListingsWithGemini({ userQuery, listings }) {
  const prompt = `
Ești un asistent pentru recomandări imobiliare în România.

Primești:
- cererea utilizatorului (text liber)
- o listă de anunțuri candidate (max 100), fiecare cu:
  - id
  - title
  - description
  - city
  - zone
  - rooms
  - transaction (RENT/SALE/UNKNOWN)
  - priceRON
  - priceEUR

TASK:
1. Înțelege cererea utilizatorului (oraș, zonă, număr camere, chirie vs vânzare, buget etc.).
2. Alege cele mai relevante anunțuri (max 10).
3. Atribuie fiecărui anunț ales un "score" între 0 și 1 (1 = potrivire perfectă).
4. Construiește un text scurt de răspuns pentru utilizator în limba română.

FORMAT RĂSPUNS (STRICT JSON, fără text în afara lui):

{
  "replyText": "string - mesaj scurt pentru utilizator în română",
  "topListings": [
    {
      "id": number,   // id-ul anunțului din lista de input
      "score": number // între 0 și 1
    }
  ]
}

CERERE UTILIZATOR:
${JSON.stringify(userQuery)}

ANUNȚURI CANDIDATE (array de obiecte):
${JSON.stringify(listings, null, 2)}
`;

  const result = await geminiModel.generateContent(prompt);
  const text = result.response.text();

  const json = extractJson(text);

  // validare minimă
  if (!json.replyText || !Array.isArray(json.topListings)) {
    throw new Error('JSON invalid de la model: lipsesc replyText sau topListings');
  }

  return json; // { replyText, topListings }
}