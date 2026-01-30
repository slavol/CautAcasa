import requests
import time
from db import get_db

def fix_olx_image(url, width=800, height=600):
    if not url: return None
    return url.replace("{width}", str(width)).replace("{height}", str(height))

def fix_olx_link(link):
    if not link: return None
    if link.count("https://www.olx.ro") > 1:
        return "https://www.olx.ro" + link.split("https://www.olx.ro")[-1]
    if link.startswith("/"):
        return "https://www.olx.ro" + link
    return link

def parse_listing(item):
    params = {p["key"]: p["value"] for p in item.get("params", []) if p.get("key")}
    
    price_data = params.get("price", {})
    price = price_data.get("value") if isinstance(price_data, dict) else None
    currency = price_data.get("currency") if isinstance(price_data, dict) else None
    converted_price = price_data.get("converted_value") if isinstance(price_data, dict) else None

    slug = item.get("category", {}).get("slug", "").lower()
    transaction = "UNKNOWN"
    if "inchiriere" in slug or "rent" in slug: transaction = "RENT"
    elif "vanzare" in slug or "sale" in slug: transaction = "SALE"

    photos = item.get("photos", [])
    image = fix_olx_image(photos[0]["link"]) if photos else None
    
    return {
        "title": item.get("title"),
        "description": item.get("description"),
        "city": item.get("location", {}).get("city", {}).get("name"),
        "image": image,
        "link": fix_olx_link(item.get("url", "")),
        "price": price,
        "currency": currency,
        "converted_price": converted_price,
        "transaction": transaction,
        "source": "OLX"
    }

def insert_listing(conn, listing):
    """Returnează True dacă a fost inserat/updatat cu succes, False dacă e eroare"""
    try:
        with conn.cursor() as cur:
            # Verificăm întâi dacă există link-ul (optimizare)
            # Notă: ON CONFLICT se ocupă de asta, dar vrem să știm dacă e "nou" sau nu?
            # Pentru simplitate, considerăm succes orice rulare fără eroare DB.
            
            cur.execute("""
                INSERT INTO "Listing"
                    (title, price, currency, "convertedPrice", description, city, image, link, transaction, source, "updatedAt")
                VALUES
                    (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, NOW())
                ON CONFLICT (link)
                DO UPDATE SET
                    price = EXCLUDED.price,
                    "convertedPrice" = EXCLUDED."convertedPrice",
                    "updatedAt" = NOW()
                WHERE "Listing".price IS DISTINCT FROM EXCLUDED.price; 
            """, (
                listing["title"], listing["price"], listing["currency"], listing["converted_price"],
                listing["description"], listing["city"], listing["image"], listing["link"],
                listing["transaction"], listing["source"]
            ))
        conn.commit()
        return True
    except Exception as e:
        conn.rollback()
        print(f"[DB ERROR] {e}")
        return False

def run_scraper(max_pages=50, callback=None):
    print("=== STARTING OLX API SCRAPER ===")
    conn = get_db()
    total_success = 0 # Numărăm doar succesurile
    
    base_url = "https://www.olx.ro/api/v1/offers/?category_id=3&limit=40&sort_by=created_at%3Adesc"

    for page in range(max_pages):
        offset = page * 40
        
        # Callback vizual
        if callback: callback(total_success)

        try:
            r = requests.get(f"{base_url}&offset={offset}", timeout=10)
            if r.status_code != 200:
                print(f"[STOP] API returned {r.status_code}")
                break
                
            data = r.json()
            items = data.get("data", [])
            
            if not items:
                print("[DONE] No more items returned by API.")
                break

            for item in items:
                listing = parse_listing(item)
                if insert_listing(conn, listing):
                    total_success += 1
                
        except Exception as e:
            print(f"[ERROR] Page {page}: {e}")
            time.sleep(2)
            continue
            
        time.sleep(0.3)

    conn.close()
    return total_success