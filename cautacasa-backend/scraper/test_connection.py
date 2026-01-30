import requests
import json
import time

# --- CONFIGURARE ---
# Daca e pe acelasi PC: "http://127.0.0.1:11434"
# Daca e pe alt PC (Tailscale): "http://100.89.223.118:11434"
HOST_URL = "http://100.107.244.9:11434" 

MODEL = "hermes3:latest"
# -------------------

def test_connection():
    print(f"1️⃣  Testare conexiune la {HOST_URL}...")
    try:
        # Pas 1: Vedem daca serverul raspunde
        r = requests.get(f"{HOST_URL}/api/tags", timeout=5)
        if r.status_code == 200:
            print("✅ Conexiune REUȘITĂ!")
            models = [m['name'] for m in r.json().get('models', [])]
            print(f"📋 Modele disponibile: {models}")
            
            if MODEL not in models and f"{MODEL}:latest" not in models:
                print(f"⚠️ ATENȚIE: Modelul '{MODEL}' NU apare în listă! AI-ul va da eroare.")
                print("   -> Rulează 'ollama pull qwen2.5:7b-instruct' pe server.")
                return
        else:
            print(f"❌ Serverul a răspuns cu cod: {r.status_code}")
            return
    except Exception as e:
        print(f"❌ EROARE FATALĂ DE CONEXIUNE: {e}")
        print("   -> Verifica daca IP-ul e corect.")
        print("   -> Verifica daca Ollama ruleaza.")
        print("   -> Verifica daca firewall-ul permite conexiunea.")
        return

    print(f"\n2️⃣  Testare Generare (Simplu 'Salut')...")
    try:
        start = time.time()
        payload = {
            "model": MODEL,
            "prompt": "Salut! Raspunde cu un singur cuvant: CONFIRMAT.",
            "stream": False
        }
        r = requests.post(f"{HOST_URL}/api/generate", json=payload, timeout=30)
        duration = time.time() - start
        
        if r.status_code == 200:
            response_text = r.json().get('response', '').strip()
            print(f"✅ Răspuns primit în {duration:.2f}s: '{response_text}'")
        else:
            print(f"❌ Eroare la generare: {r.text}")

    except Exception as e:
        print(f"❌ Eroare la generare: {e}")

if __name__ == "__main__":
    test_connection()