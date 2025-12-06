from olx_api_scraper import run_scraper
from ai_processor import process_all_listings

print("=== RUNNING FULL PIPELINE ===")
run_scraper(max_pages=80)
process_all_listings()
print("=== DONE ===")