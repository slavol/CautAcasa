import json
import requests

OLLAMA_URL = "http://98.81.124.152:11434/api/generate"  # SERVER AWS

def ollama_generate(model: str, prompt: str):
    try:
        resp = requests.post(
            OLLAMA_URL,
            json={
                "model": model,
                "prompt": prompt,
                "stream": False
            },
            timeout=120
        )

        data = resp.json()

        if "response" not in data:
            print("❌ OLLAMA: no 'response' field")
            return None

        raw = data["response"]

        # Extract JSON from inside long text
        first = raw.find("{")
        last = raw.rfind("}") + 1

        if first == -1 or last == -1:
            print("❌ JSON not found in AI output")
            return None

        return json.loads(raw[first:last])

    except Exception as e:
        print("❌ OLLAMA ERROR:", e)
        return None