# 🏡 CautAcasa – Platformă Imobiliară Inteligentă - PREDA SLAVOLIUB-DENIS - PROIECT INDIVIDUAL

CautAcasa este o platformă modernă de căutare imobiliară care combină:
- 📡 Scraper automat OLX (Python)
- 🧠 Curățare date cu AI local (Ollama – Qwen2.5 7B)
- 🤖 Chat AI inteligent cu Google Gemini
- 🔍 Motor de căutare clasică + căutare în limbaj natural
- 🛠️ Panou complet de administrare

Scopul aplicației este de a automatiza colectarea și standardizarea anunțurilor imobiliare pentru utilizatorii din România.

---

# **B. Explicitarile culese de la potențiali clienți**


### **REQ1 – Căutare intuitivă și rapidă**
Utilizatorii vor filtre simple:
- locație
- tip proprietate
- preț
- camere
- suprafață
- direct proprietar sau agenție

---

### **REQ2 – Căutare în limbaj natural**
Utilizatorii doresc să scrie efectiv ceea ce caută:
> „Vreau un apartament cu 2 camere în Timișoara, până în 100.000 euro.”

AI-ul interpretează cerințele și returnează rezultate precise.

---

### **REQ3 – Anunțuri curate și standardizate**
Utilizatorii au nevoie de:
- prețuri convertite
- titluri standardizate
- extragerea numărului de camere
- identificarea tipului de proprietate
- rezumat scurt și clar

AI-ul local (Ollama) realizează automat aceste transformări.

---

### **REQ4 – Istoric de căutări și conversații salvate**
Utilizatorul trebuie să își poată revizita interacțiunile anterioare.

---

### **REQ5 – Claritate privind proveniența anunțului**
Platforma indică dacă este:
- PROPRIETAR  
- AGENTIE  

AI-ul deduce această informație din textul anunțului.

---

# **C. Dezvoltarea Proiectului**

## **1. Software Architecture**
                    ┌─────────────────────────┐
                    │        FRONTEND         │
                    │ React + Vite + Tailwind │
                    └────────────┬────────────┘
                                 │
                                 ▼
                     ┌─────────────────────┐
                     │     BACKEND API     │
                     │ Node.js + Express   │
                     └───────┬─────────────┘
       ┌──────────────────────┼────────────────────────┐
       ▼                      ▼                        ▼
┌─────────────┐      ┌────────────────┐       ┌──────────────────┐
│ Auth Module │      │ Listings CRUD  │       │ AI Search (Gemini)│
└─────────────┘      └────────────────┘       └──────────────────┘
       │                      │                        │
       └──────────────┬──────┴──────────┬─────────────┘
                      ▼                 ▼
              ┌────────────┐    ┌───────────────┐
              │ PostgreSQL │    │ Admin Module  │
              │  Database  │    │ Dashboard     │
              └─────┬──────┘    │ Scraper Start │
                    │           └───────┬───────┘
                    │                   ▼
                    │           ┌──────────────────┐
                    │           │ PYTHON SCRAPER   │
                    │           │ + AI PROCESSING  │
                    ▼           │ (Ollama Qwen)    │
            ┌───────────────────────┐──────────────┘
            │  Listing / ListingAI  │
            └────────────────────────┘


## **3. Lista modulelor + descriere**

### **🧍 User Modules**
| Modul | Descriere |
|------|-----------|
| Login | Autentificare JWT |
| Căutare clasică | Filtre DB: oraș, camere, preț, tip |
| Căutare AI | Interpretare text liber + filtrare automată |
| Chat History | Conversații salvate automat |
| Listing Viewer | Vizualizare anunțuri curățate |

### **🛠️ Admin Modules**
| Modul | Descriere |
|------|-----------|
| Dashboard | Statistici AI + căutări |
| Manage Listings | Editare, completare, ștergere |
| Incomplete Listings | Identificare automată a anunțurilor lipsă |
| Scraper Panel | Pornire scraper + status live |

### **🤖 AI Modules**
| Modul | Descriere |
|------|-----------|
| AI Chat | Răspunsuri Gemini |
| AI Data Processor | Qwen2.5 7B prin Ollama – JSON strict |
| AI Normalization | Output standardizat pentru DB |

### **🕷️ Python Scraper Modules**
| Modul | Descriere |
|------|-----------|
| OLX Scraper | Extrage date brute din OLX |
| Data Cleaner | Corectează imagini + link-uri |
| Safe Insert | Introduce date în PostgreSQL |
| Progress Reporter | Scrie status pentru UI |

---

# **D. Verificare și Validare**

## **1. Manual de utilizare – User**

### 🔐 Login
- utilizatorul se autentifică cu email/parolă
- tokenul este salvat în localStorage

### 🔎 Căutare clasică
Filtre disponibile:
- oraș
- zonă
- camere
- suprafață
- buget
- tip imobil
- proprietar / agenție

Datele provin din tabelul **ListingAI** (curățat).

### 🤖 Căutare AI
Userul scrie text:
> „Caut o casă în Dumbrăvița cu minim 500 mp teren, până în 200.000 euro.”

AI extrage automat:
- camere
- preț
- locație
- tip proprietate
- buget

și trimite interogarea către backend.

### 💬 Chat History
Toate conversațiile cu AI sunt salvate în DB.

---

## **2. Manual de utilizare – Admin**

### 📊 Admin Dashboard
Afișează:
- statistici cuvinte căutate în AI
- zone populare
- distribuția tipurilor de proprietate

### 📋 Admin Listings
- vizualizare listă
- sortare
- completare câmpuri lipsă
- editare titluri, prețuri, rezumate
- ștergere

### 🕷️ Scraper Panel
Adminul vede:
- status în timp real din `progress.json`
- etapa curentă: scraper / AI processor / done
- buton **Start Scraper**

---

# **3. Validarea cerințelor REQ1–REQ5**

| Cerință | Rezolvare |
|--------|-----------|
| **REQ1 – Căutare intuitivă** | Filtre complete în frontend + query performant în backend |
| **REQ2 – AI natural language search** | Implementare cu Google Gemini |
| **REQ3 – Date curate** | Procesare cu Qwen2.5 via Ollama (Python) |
| **REQ4 – Istoric** | Tabel dedicat în DB + UI pentru utilizator |
| **REQ5 – Identificare agenție** | AI detectează automat PROPRIETAR/AGENTIE |

---

# 🎉 Concluzie

Acest proiect îmbină scraping-ul, AI-ul și o aplicație web completă într-o arhitectură modulară, scalabilă și modernă.

Tot fluxul:
1. Scraper → 2. AI Processor → 3. DB → 4. Interfață User → 5. Admin Dashboard


