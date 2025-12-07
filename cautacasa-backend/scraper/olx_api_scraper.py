import requests
import psycopg2
import time
import os

# ---------------------------------------
# PostgreSQL connection
# ---------------------------------------
def get_connection():
    return psycopg2.connect(
        dbname=os.environ.get("POSTGRES_DB", "cautacasa"),
        user=os.environ.get("POSTGRES_USER", "slavoliu"),
        password=os.environ.get("POSTGRES_PASSWORD", ""),
        host=os.environ.get("POSTGRES_HOST", "localhost"),
        port=os.environ.get("POSTGRES_PORT", "5432")
    )

# ---------------------------------------
# Fix OLX image URL
# ---------------------------------------
def fix_olx_image(url, width=800, height=600):
    if not url:
        return None
    return url.replace("{width}", str(width)).replace("{height}", str(height))

# ---------------------------------------
# Fix OLX listing link
# ---------------------------------------
def fix_olx_link(link):
    if not link:
        return None

    # 1. elimină dublurile gen "https://www.olx.rohttps://www.olx.ro/..."
    if link.count("https://www.olx.ro") > 1:
        return "https://www.olx.ro" + link.split("https://www.olx.ro")[-1]

    # 2. dacă e relativ de forma "/d/oferta/..."
    if link.startswith("/"):
        return "https://www.olx.ro" + link

    # 3. altfel, dacă deja începe corect
    return link

# ---------------------------------------
# Price extraction
# ---------------------------------------
def extract_price(item):
    for p in item.get("params", []):
        if p.get("key") == "price" and p.get("value"):
            v = p["value"]
            return (
                v.get("value"),
                v.get("currency"),
                v.get("converted_value")
            )
    return None, None, None

# ---------------------------------------
# Transaction extraction
# ---------------------------------------
def extract_transaction(item):
    slug = item.get("category", {}).get("slug", "").lower()

    if "inchiriere" in slug or "rent" in slug:
        return "RENT"
    if "vanzare" in slug or "sale" in slug:
        return "SALE"
    return "UNKNOWN"

# ---------------------------------------
# Parse JSON item → dict
# ---------------------------------------
def parse_listing(item):
    price, currency, converted_price = extract_price(item)

    photos = item.get("photos", [])
    image = fix_olx_image(photos[0]["link"]) if photos else None

    raw_link = "https://www.olx.ro" + item.get("url", "")
    link = fix_olx_link(raw_link)

    return {
        "title": item.get("title"),
        "description": item.get("description"),
        "city": item.get("location", {}).get("city", {}).get("name"),
        "image": image,
        "link": link,

        "price": price,
        "currency": currency,
        "converted_price": converted_price,

        "transaction": extract_transaction(item),
        "source": "OLX"
    }

# ---------------------------------------
# SAFE INSERT with per-row commit
# ---------------------------------------
def insert_listing(conn, listing):
    try:
        with conn.cursor() as cur:
            cur.execute("""
                INSERT INTO "Listing"
                    (title, price, currency, "convertedPrice", description, city, image, link, transaction, source)
                VALUES
                    (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                ON CONFLICT (link)
                DO UPDATE SET
                    title = EXCLUDED.title,
                    price = EXCLUDED.price,
                    currency = EXCLUDED.currency,
                    "convertedPrice" = EXCLUDED."convertedPrice",
                    description = EXCLUDED.description,
                    city = EXCLUDED.city,
                    image = EXCLUDED.image,
                    transaction = EXCLUDED.transaction,
                    "updatedAt" = NOW();
            """, (
                listing["title"],
                listing["price"],
                listing["currency"],
                listing["converted_price"],
                listing["description"],
                listing["city"],
                listing["image"],
                listing["link"],
                listing["transaction"],
                listing["source"]
            ))

        conn.commit()
        print(f"[OK] {listing['title'][:60]}")

    except Exception as e:
        conn.rollback()
        print("[DB ERROR]", e)


# ---------------------------------------
# Main scraper
# ---------------------------------------
def run_scraper(max_pages=100):
    print("=== STARTING OLX API SCRAPER ===")

    conn = get_connection()
    total = 0

    for page in range(max_pages):
        offset = page * 40
        url = (
            "https://www.olx.ro/api/v1/offers/"
            f"?category_id=3&offset={offset}&limit=40&sort_by=created_at%3Adesc"
        )

        print(f"[INFO] Fetching offset {offset}...")

        # retry request
        for _ in range(3):
            try:
                r = requests.get(url, timeout=10)
                break
            except:
                time.sleep(1)

        if r.status_code != 200:
            print(f"[STOP] HTTP {r.status_code}")
            break

        data = r.json()
        items = data.get("data", [])

        if not items:
            print("[DONE] No more results.")
            break

        for item in items:
            listing = parse_listing(item)
            insert_listing(conn, listing)
            total += 1

        time.sleep(0.5)

    conn.close()
    print(f"=== DONE — inserted/updated {total} listings ===")


if __name__ == "__main__":
    run_scraper(max_pages=200)