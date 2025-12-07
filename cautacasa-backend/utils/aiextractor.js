
export function extractAiFilters(message) {
  const text = message.toLowerCase();


  let rooms = null;

  const roomPatterns = [
    { regex: /(\d+)\s*cam/, map: m => Number(m[1]) },
    { regex: /(\d+)\s* camere/, map: m => Number(m[1]) },
    { regex: /garsonier/, map: () => 1 },
    { regex: /studio/, map: () => 1 },
  ];

  for (const p of roomPatterns) {
    const match = text.match(p.regex);
    if (match) {
      rooms = p.map(match);
      break;
    }
  }

  let transaction = null;

  if (/inchiri/.test(text) || /închiri/.test(text)) {
    transaction = "RENT";
  } else if (/vânzare/.test(text) || /cumpar/.test(text) || /cumpăr/.test(text)) {
    transaction = "SALE";
  }

  let propertyType = null;

  if (/apart/.test(text)) propertyType = "APARTMENT";
  else if (/garsonier/.test(text)) propertyType = "STUDIO";
  else if (/studio/.test(text)) propertyType = "STUDIO";
  else if (/cas(a|ă)/.test(text)) propertyType = "HOUSE";
  else if (/vil(a|ă)/.test(text)) propertyType = "VILLA";

  const knownCities = [
    "bucuresti",
    "bucurești",
    "cluj",
    "timisoara",
    "timișoara",
    "iasi",
    "iași",
    "brasov",
    "brașov",
    "sibiu",
    "oradea",
    "arad",
    "ploiesti",
    "constanta",
    "alba",
  ];

  let city = null;
  for (const c of knownCities) {
    if (text.includes(c)) {
      city = c.charAt(0).toUpperCase() + c.slice(1);
      break;
    }
  }

  return {
    rooms,
    transaction,
    propertyType,
    city,
  };
}