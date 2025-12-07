# scraper/run_all.py
import json
import time
import os

from olx_api_scraper import run_scraper
from ai_processor import process_all_listings

PROGRESS_FILE = os.path.join(
    os.path.dirname(__file__),
    "progress.json"
)

def update_progress(stage, message, running=True):
    """Scrie starea curentă a pipeline-ului în progress.json"""
    payload = {
        "stage": stage,          # "scraper" | "ai" | "done" | "error"
        "message": message,
        "timestamp": time.time(),
        "running": running,
    }

    try:
        with open(PROGRESS_FILE, "w") as f:
            json.dump(payload, f)
    except Exception as e:
        # Nu vrem să pice tot pipeline-ul doar pentru că nu merge log-ul
        print("[progress.json ERROR]", e)

print("=== RUNNING FULL PIPELINE ===")

try:
    # 1) SCRAPER
    update_progress("scraper", "Starting OLX scraper...", running=True)
    run_scraper(max_pages=80)

    # 2) AI PROCESSOR
    update_progress("ai", "Running AI processor...", running=True)
    process_all_listings()

    # 3) DONE
    update_progress("done", "Pipeline completed successfully!", running=False)
    print("=== DONE ===")

except Exception as e:
    print("=== PIPELINE ERROR ===", e)
    update_progress("error", f"Pipeline failed: {e}", running=False)
    raise