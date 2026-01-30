import requests
import json
import os
import re

# IP-ul Tailscale Corect
DEFAULT_HOST = "http://100.107.244.9:11434" 
OLLAMA_HOST = os.getenv("OLLAMA_HOST", DEFAULT_HOST)

def clean_json_string(raw_str):
    cleaned = re.sub(r"```json\s*", "", raw_str, flags=re.IGNORECASE)
    cleaned = re.sub(r"```\s*$", "", cleaned)
    return cleaned.strip()

def ollama_generate(model, prompt):
    url = f"{OLLAMA_HOST}/api/generate"

    payload = {
        "model": model,
        "prompt": prompt,
        "stream": False,
        "format": "json",
        "options": {
            "temperature": 0.1,
            "num_ctx": 4096 
        }
    }

    try:
        # Timeout 5 minute, sa fim siguri
        response = requests.post(url, json=payload, timeout=300) 
        response.raise_for_status()

        data = response.json()
        raw = data.get("response", "")
        
        if not raw: return None

        cleaned_raw = clean_json_string(raw)
        
        try:
            return json.loads(cleaned_raw)
        except json.JSONDecodeError:
            print(f"[AI ERROR] Invalid JSON from {model}")
            return None

    except Exception as e:
        print(f"[AI ERROR] Connection failed to {OLLAMA_HOST}: {e}")
        return None