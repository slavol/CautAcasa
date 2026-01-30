import time
import json
import os
from concurrent.futures import ThreadPoolExecutor, as_completed
from db import get_db
from local_ai import ollama_generate

# --- CONFIGURARE FINALĂ ---
# IP-ul din testul tău reușit:
TAILSCALE_IP = "http://100.107.244.9:11434" 

# Alegem Hermes 3 (cel mai bun pentru instrucțiuni din lista ta)
MODEL = "hermes3:latest"

# 3 workeri este un echilibru bun pentru acest model
MAX_WORKERS = 3 
# -------------------------------

SYSTEM_PROMPT = """
Ești un asistent imobiliar expert.
Sarcina ta: Extrage date structurate din textul anunțului.
Reguli CRITICE:
1. Răspunde DOAR cu un obiect JSON valid.
2. NU adăuga text înainte sau după JSON.
3. Dacă o informație lipsește, pune null.

FORMAT JSON:
{
  "titlu": string,
  "pret_eur": number,
  "pret_ron": number,
  "camere": number,
  "tip_locuinta": "apartament" | "garsoniera" | "casa" | "vila" | "teren" | "spatiu" | "altele",
  "tranzactie": "RENT" | "SALE",
  "zona": string,
  "proprietar_sau_agentie": "PROPRIETAR" | "AGENTIE",
  "descriere_scurta": string
}
"""

def safe_int(val):
    try:
        if isinstance(val, (int, float)): return int(val)
        if isinstance(val, str) and val.isdigit(): return int(val)
        return None
    except: return None

def normalize_ai_result(ai, original_city):
    return {
        "clean_title": ai.get("titlu"),
        "price_eur": safe_int(ai.get("pret_eur")),
        "price_ron": safe_int(ai.get("pret_ron")),
        "rooms": safe_int(ai.get("camere")),
        "property_type": ai.get("tip_locuinta"),
        "transaction": ai.get("tranzactie"),
        "zone": ai.get("zona"),
        "summary": ai.get("descriere_scurta"),
        "city": original_city,
        "is_owner": str(ai.get("proprietar_sau_agentie")).upper() == "PROPRIETAR"
    }

def process_single_listing(listing):
    prompt = f"""
    {SYSTEM_PROMPT}
    ---
    TITLU: {listing['title']}
    DESCRIERE: {listing['description']}
    PRET: {listing['price']} {listing['currency']}
    ORAS: {listing['city']}
    ---
    """
    
    # Setăm temporar variabila de mediu pentru ca local_ai.py să știe unde să bată
    os.environ["OLLAMA_HOST"] = TAILSCALE_IP

    try:
        ai_raw = ollama_generate(MODEL, prompt)
    except Exception as e:
        return {"success": False, "title": listing['title'], "error": str(e)}
    
    if not ai_raw:
        return {"success": False, "title": listing['title'], "error": "Empty AI response"}

    try:
        final_data = normalize_ai_result(ai_raw, listing['city'])
        
        conn = get_db()
        cur = conn.cursor()
        
        cur.execute("""
            INSERT INTO "ListingAI"
            ("listingId", "cleanTitle", "propertyType", transaction,
            rooms, summary, "priceRON", "priceEUR", city, zone, image, link,
            "isOwner", "qualityScore", "aiVersion", "updatedAt")
            VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,80,1,NOW())
            ON CONFLICT ("listingId") DO UPDATE SET
                "cleanTitle" = EXCLUDED."cleanTitle",
                summary = EXCLUDED.summary,
                "updatedAt" = NOW();
        """, (
            listing["id"],
            final_data["clean_title"],
            final_data["property_type"],
            final_data["transaction"],
            final_data["rooms"],
            final_data["summary"],
            final_data["price_ron"],
            final_data["price_eur"],
            final_data["city"],
            final_data["zone"],
            listing["image"],
            listing["link"],
            final_data["is_owner"],
        ))
        
        conn.commit()
        cur.close()
        conn.close()
        
        return {"success": True, "title": listing['title']}
        
    except Exception as e:
        return {"success": False, "title": listing['title'], "error": str(e)}

def process_all_listings(progress_callback=None):
    os.environ["OLLAMA_HOST"] = TAILSCALE_IP
    
    conn = get_db()
    cur = conn.cursor()

    cur.execute("""
        SELECT id, title, description, city, image, link, price, currency
        FROM "Listing"
        WHERE id NOT IN (SELECT "listingId" FROM "ListingAI")
        LIMIT 500
    """)
    
    rows = cur.fetchall()
    cur.close()
    conn.close()

    total_items = len(rows)
    if not rows: return

    listings = []
    for r in rows:
        listings.append({
            "id": r[0], "title": r[1], "description": r[2], "city": r[3],
            "image": r[4], "link": r[5], "price": r[6], "currency": r[7]
        })

    processed_count = 0

    with ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
        futures = [executor.submit(process_single_listing, lst) for lst in listings]
        
        for future in as_completed(futures):
            processed_count += 1
            result = future.result()
            
            if progress_callback:
                progress_callback(processed_count, total_items, result["title"], result["success"])