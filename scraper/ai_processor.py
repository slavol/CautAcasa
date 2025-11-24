import os
import time
import psycopg2
import json
from db import get_db
from local_ai import ollama_generate  # ← AICI SE LEAGĂ

MODEL = "llama3.2:3b"   # modelul pe care îl ai pe AWS

SYSTEM_PROMPT = """
Ești un algoritm STRICT de analiză imobiliară. NU AI VOIE să inventezi nimic.
Dacă o informație NU apare în anunț, setezi valoarea la null.

Returnezi un JSON VALID cu următoarele câmpuri:

{
  "titlu": string,
  "pret_eur": number | null,
  "pret_ron": number | null,
  "camere": number | null,
  "tip_locuinta": "apartament" | "garsoniera" | "casa" | "vila" | "teren" | "spatiu" | "hala" | "altele",
  "tranzactie": "RENT" | "SALE",
  "zona": string | null,
  "proprietar_sau_agentie": "PROPRIETAR" | "AGENTIE",
  "descriere_scurta": string,
  "city": string | null
}

REGULI STRICTE:

1. ZONA:
   - Zona nu este orașul.
   - Zona = cartier, punct de reper, bulevard.
   - Dacă nu apare explicit → "zona": null.

2. TRANZACȚIE:
   RENT: inchiriere, închiriere, inchiriez, de închiriat, chirie, pe luna.
   SALE: vand, vând, vanzare, de vanzare, pret, ocazie.
   Dacă prețul este pe m2 → SALE.

3. PREȚURI:
   - EUR → pret_ron = round(price * 5)
   - RON → pret_eur = round(price / 5)
   - Dacă lipsesc → null

4. CAMERE:
   - garsoniera = 1
   - dacă nu apare → null

5. TIP LOCUINȚĂ:
   - teren → teren
   - hala → hala
   - spatiu → spatiu
   - garsoniera → garsoniera
   - casa/vila/duplex → casa sau vila
   - altfel → apartament

6. PROPRIETAR SAU AGENTIE:
   PROPRIETAR: proprietar, direct, fara comision
   AGENTIE: agentie, comision, agent imobiliar
   default = AGENTIE

7. CITY:
   - dacă vine deja → păstrezi
   - dacă e gol → extragi
   - dacă nu apare → null

Returnezi DOAR JSON VALID.
"""

def build_prompt(listing):
    return f"""
{SYSTEM_PROMPT}

TITLE: {listing['title']}
DESCRIPTION: {listing['description']}
CITY: {listing['city']}
PRICE: {listing['price']} {listing['currency']}
PRICE_RON: {listing['converted_price']}
"""


def normalize(ai):
    clean = {}

    clean["clean_title"] = ai.get("titlu") or None

    # Prices
    eur = ai.get("pret_eur")
    clean["price_eur"] = int(eur) if isinstance(eur, (int, float)) else None

    ron = ai.get("pret_ron")
    clean["price_ron"] = int(ron) if isinstance(ron, (int, float)) else None

    # Rooms
    camere = ai.get("camere")
    clean["rooms"] = int(camere) if isinstance(camere, (int, float)) else None

    clean["property_type"] = ai.get("tip_locuinta") or None
    clean["transaction"] = ai.get("tranzactie") or None
    clean["zone"] = ai.get("zona") or None
    clean["is_owner"] = ai.get("proprietar_sau_agentie") == "PROPRIETAR"
    clean["summary"] = ai.get("descriere_scurta") or None
    clean["city"] = ai.get("city") or None

    return clean


def process_listing(listing, retries=3):
    prompt = build_prompt(listing)

    for attempt in range(retries):
        ai = ollama_generate(MODEL, prompt)
        if ai:
            return normalize(ai)

        print(f"❌ Failed, retrying {attempt+1}/{retries}")
        time.sleep(1)

    return None


def process_all_listings():
    conn = get_db()
    cur = conn.cursor()

    cur.execute("""
        SELECT id, title, description, city, price, currency, "convertedPrice"
        FROM "Listing"
        WHERE id NOT IN (SELECT "listingId" FROM "ListingAI")
    """)

    rows = cur.fetchall()
    print(f"[AI] Found {len(rows)} listings to process")

    for row in rows:
        listing = {
            "id": row[0],
            "title": row[1],
            "description": row[2],
            "city": row[3],
            "price": row[4],
            "currency": row[5],
            "converted_price": row[6],
        }

        print(f"[AI] Processing #{listing['id']} - {listing['title'][:40]}...")

        ai = process_listing(listing)
        if ai is None:
            print("[SKIP] AI failed.\n")
            continue

        cur.execute("""
            INSERT INTO "ListingAI"
            ("listingId", "cleanTitle", "propertyType", transaction,
             rooms, summary, "priceRON", "priceEUR", city, zone,
             "isOwner", "qualityScore", "aiVersion", "updatedAt")
            VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,NOW())
        """, (
            listing["id"],
            ai["clean_title"],
            ai["property_type"],
            ai["transaction"],
            ai["rooms"],
            ai["summary"],
            ai["price_ron"],
            ai["price_eur"],
            ai["city"] or listing["city"],
            ai["zone"],
            ai["is_owner"],
            80,
            1
        ))

        conn.commit()

    cur.close()
    conn.close()
    print("[AI] DONE")