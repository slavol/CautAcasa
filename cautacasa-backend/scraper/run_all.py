import json
import time
import os
import sys

# Adăugăm folderul curent la path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from olx_api_scraper import run_scraper
from ai_processor import process_all_listings

PROGRESS_FILE = "scraper/progress.json"

def init_progress():
    save_state({
        "running": True,
        "stage": "STARTING",
        "progress": 0,
        "total": 0,
        "current": 0,
        "logs": ["🚀 Pipeline initialized..."]
    })

def save_state(state):
    try:
        os.makedirs(os.path.dirname(PROGRESS_FILE), exist_ok=True)
        with open(PROGRESS_FILE, "w") as f:
            json.dump(state, f)
    except Exception as e:
        print(f"Could not save progress: {e}")

def get_current_state():
    try:
        if os.path.exists(PROGRESS_FILE):
            with open(PROGRESS_FILE, "r") as f:
                return json.load(f)
    except:
        pass
    return {"logs": []}

def log_message(message, stage=None, progress=0, total=0, current=0, running=True):
    """Adaugă un mesaj în log-ul vizibil în frontend"""
    state = get_current_state()
    
    timestamp = time.strftime("%H:%M:%S")
    log_entry = f"[{timestamp}] {message}"
    
    state["logs"] = [log_entry] + state.get("logs", [])[:9]
    
    if stage: state["stage"] = stage
    state["progress"] = progress
    state["total"] = total
    state["current"] = current
    state["running"] = running
    
    print(log_entry)
    save_state(state)

def scraper_callback(processed_count):
    # Doar actualizăm contorul, nu facem spam cu loguri
    state = get_current_state()
    state["current"] = processed_count
    save_state(state)

def ai_callback(current, total, last_title, success):
    percent = int((current / total) * 100) if total > 0 else 0
    status_icon = "✅" if success else "❌"
    # Scurtăm titlul pentru log
    short_title = (last_title[:30] + '..') if last_title and len(last_title) > 30 else last_title
    msg = f"{status_icon} Processed: {short_title}"
    log_message(msg, "AI_PROCESSING", percent, total, current, True)

def main():
    init_progress()
    
    try:
        # --- ETAPA 1: SCRAPER ---
        log_message("Starting OLX API Scraper...", "SCRAPER", 0, 0, 0, True)
        
        # Scraper-ul rulează și returnează CÂȚI itemi a procesat
        total_scraped = run_scraper(max_pages=50, callback=scraper_callback)
        
        log_message(f"Scraper finished. Processed {total_scraped} listings.", "SCRAPER_DONE", 0, 0, total_scraped, True)

        # --- LOGICA NOUĂ DE CONTROL ---
        if total_scraped == 0:
            log_message("⚠️ No listings found or added. Stopping pipeline to save resources.", "COMPLETED", 100, 0, 0, False)
            return  # <--- STOP AICI DACĂ E 0

        # --- ETAPA 2: AI ---
        log_message("Starting AI Analysis...", "AI_START", 0, 0, 0, True)
        process_all_listings(progress_callback=ai_callback)

        # --- FINAL ---
        log_message("🎉 Pipeline finished successfully!", "COMPLETED", 100, 0, 0, False)

    except Exception as e:
        log_message(f"CRITICAL ERROR: {str(e)}", "ERROR", 0, 0, 0, False)

if __name__ == "__main__":
    main()