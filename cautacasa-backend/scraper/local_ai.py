import requests
import json

OLLAMA_HOST = "http://100.89.223.118:11434"

def ollama_generate(model, prompt):
    url = f"{OLLAMA_HOST}/api/generate"

    payload = {
        "model": model,
        "prompt": prompt,
        "stream": False,
        "format": "json"  # 👈 OBLIGATORIU
    }

    try:
        response = requests.post(url, json=payload, timeout=120)
        response.raise_for_status()

        data = response.json()
        raw = data.get("response", "")

        try:
            return json.loads(raw)
        except json.JSONDecodeError:
            print("❌ Invalid JSON:\n", raw)
            return None

    except Exception as e:
        print("❌ Ollama error:", e)
        return None