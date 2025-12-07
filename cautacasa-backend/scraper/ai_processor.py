import os
import time
import psycopg2
import json
from db import get_db
from local_ai import ollama_generate  

MODEL = "qwen2.5:7b-instruct"

SYSTEM_PROMPT = """
Ești un parser STRICT de anunțuri imobiliare. Răspunzi DOAR cu un singur obiect JSON VALID.
NU ai voie să adaugi explicații, Markdown, text extra, comentarii sau ```json.
NU inventezi informații — dacă NU apare în anunț, pui valoarea null.

ATENȚIE — REGULA PENTRU descriere_scurta:
- Dacă există descriere → O rezumi în MAXIM 2 fraze (max 250 caractere).
- Rezumatul este OBLIGATORIU când descrierea există.
- NU copiezi descrierea originală integral.
- Dacă nu există descriere → descriere_scurta = null.

FORMAT OBLIGATORIU:

{
  "titlu": string | null,
  "pret_eur": number | null,
  "pret_ron": number | null,
  "camere": number | null,
  "tip_locuinta": "apartament" | "garsoniera" | "casa" | "vila" | "teren" | "spatiu" | "hala" | "altele" | null,
  "tranzactie": "RENT" | "SALE" | null,
  "zona": string | null,
  "proprietar_sau_agentie": "PROPRIETAR" | "AGENTIE" | null,
  "descriere_scurta": string | null,
  "city": string | null
}

Respectă REGULILE STRICTE IMOBILIARE.
Returnezi STRICT un singur obiect JSON VALID.
"""


def fix_olx_image(url, width=800, height=600):
    if not url:
        return None
    return url.replace("{width}", str(width)).replace("{height}", str(height))


def fix_olx_link(link):
    if not link:
        return None

    if link.count("https://www.olx.ro") > 1:
        return "https://www.olx.ro" + link.split("https://www.olx.ro")[-1]

    if link.startswith("/"):
        return "https://www.olx.ro" + link

    return link


def build_prompt(listing):
    return f"""
{SYSTEM_PROMPT}

TITLE: {listing['title']}
DESCRIPTION: {listing['description']}
CITY: {listing['city']}
PRICE: {listing['price']} {listing['currency']}
PRICE_RON: {listing['converted_price']}
"""


def normalize_transaction(value):
    if not value:
        return None

    v = value.upper()

    has_rent = "RENT" in v
    has_sale = "SALE" in v

    if has_rent and has_sale:
        return None   

    if has_rent:
        return "RENT"

    if has_sale:
        return "SALE"

    return None



def normalize(ai):
    return {
        "clean_title": ai.get("titlu"),

        "price_eur": int(ai["pret_eur"]) if isinstance(ai.get("pret_eur"), (int, float)) else None,
        "price_ron": int(ai["pret_ron"]) if isinstance(ai.get("pret_ron"), (int, float)) else None,

        "rooms": int(ai["camere"]) if isinstance(ai.get("camere"), (int, float)) else None,

        "property_type": ai.get("tip_locuinta"),
        "transaction": normalize_transaction(ai.get("tranzactie")),
        "zone": ai.get("zona"),
        "summary": ai.get("descriere_scurta"),
        "city": ai.get("city"),

        "is_owner": ai.get("proprietar_sau_agentie") == "PROPRIETAR"
    }



def process_listing(listing, retries=3):
    prompt = build_prompt(listing)

    for attempt in range(retries):
        ai = ollama_generate(MODEL, prompt)

        print("\n🔍 AI RAW RESPONSE:")
        print(json.dumps(ai, ensure_ascii=False, indent=2))

        if ai:
            try:
                return normalize(ai)
            except Exception as e:
                print("❌ Normalize error:", e)
                return None

        print(f"❌ Failed attempt {attempt+1}/{retries}")
        time.sleep(1)

    return None



def process_all_listings():
    conn = get_db()
    cur = conn.cursor()

    cur.execute("""
        SELECT id, title, description, city, image, link, price, currency, "convertedPrice"
        FROM "Listing"
        WHERE id NOT IN (SELECT "listingId" FROM "ListingAI")
    """)

    rows = cur.fetchall()
    print(f"[AI] Found {len(rows)} listings to analyze")

    for row in rows:
        listing = {
            "id": row[0],
            "title": row[1],
            "description": row[2],
            "city": row[3],
            "image": fix_olx_image(row[4]),
            "link": fix_olx_link(row[5]),
            "price": row[6],
            "currency": row[7],
            "converted_price": row[8],
        }

        print("\n===================================")
        print(f"📌 Processing listing #{listing['id']}")
        print("📸 Image:", listing["image"])
        print("🔗 Link:", listing["link"])
        print("===================================\n")

        ai = process_listing(listing)

        if ai is None:
            print("⛔ SKIPPED — AI failed.\n")
            continue

        print("✔ NORMALIZED AI RESULT:")
        print(json.dumps(ai, ensure_ascii=False, indent=2))

        # Insert into AI table
        cur.execute("""
            INSERT INTO "ListingAI"
            ("listingId", "cleanTitle", "propertyType", transaction,
            rooms, summary, "priceRON", "priceEUR", city, zone, image, link,
            "isOwner", "qualityScore", "aiVersion", "updatedAt")
            VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,80,1,NOW())
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
            listing["image"],
            listing["link"],
            ai["is_owner"],
        ))

        conn.commit()

    cur.close()
    conn.close()

    print("\n🎉 [AI] ALL LISTINGS PROCESSED SUCCESSFULLY!")