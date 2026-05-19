# Aspire — Grupp 4

Aspire är en träningsapp byggd som mobilprototyp. Användare kan följa kända atleters dagliga scheman, logga kalorier, spåra streaks och hantera sin profil. Appen är byggd med HTML, CSS och vanilla JavaScript på frontend, och FastAPI med PostgreSQL på backend.

## Funktioner

- Registrering och inloggning med e-post och lösenord
- Sök och filtrera atleter efter sport
- Visa atletprofiler med schema, kost och träning
- Kalorilogg med måltidsflikar (sparas i databasen)
- Streak-räknare med veckokalender
- Profilsida med statistik och aktiv utmaning
- Kan installeras som app på iPhone (PWA)

## Projektstruktur

```
Aspire-Official-main/
├── backend/
│   ├── main.py            # FastAPI-server med alla endpoints
│   ├── database.py        # Databasanslutning och hjälpfunktioner
│   ├── requirements.txt   # Python-paket
│   └── .env               # Databasadress (skapas manuellt)
├── aspire_kod/
│   ├── javascript/
│   │   └── app.js         # Delad JavaScript för alla sidor
│   └── frontend/
│       ├── index.html      # Inloggningssida
│       ├── registrera.html # Registreringssida
│       ├── hem.html        # Startsida
│       ├── sok.html        # Sök atleter
│       ├── atletprofil.html# Atletens profil
│       ├── kalorier.html   # Kalorilogg
│       ├── streaks.html    # Streak-kalender
│       ├── profil.html     # Användarprofil
│       ├── css/styles.css  # All styling
│       └── javascript/
│           └── app.js      # Kopia av delad JavaScript
```

## Krav

- Python 3.10 eller nyare
- PostgreSQL-databas (remote eller lokal)
- En modern webbläsare (Chrome, Safari, Firefox)

## Starta appen

### 1. Installera Python-paket

**Windows:**
```bash
cd backend
pip install -r requirements.txt
```

**Mac/Linux:**
```bash
cd backend
pip3 install -r requirements.txt
```

### 2. Starta backend-servern

**Windows:**
```bash
cd backend
py -m uvicorn main:app --reload --port 8002
```

**Mac/Linux:**
```bash
cd backend
python3 -m uvicorn main:app --reload --port 8002
```

Servern körs på `http://127.0.0.1:8002`. Öppna `http://127.0.0.1:8002/health` för att verifiera — den ska visa `{"status": "ok"}`.

### 3. Öppna frontend

Öppna `aspire_kod/frontend/index.html` i webbläsaren:

- **VS Code:** Högerklicka på `index.html` → "Open with Live Server"
- **Manuellt:** Dubbelklicka på filen, eller dra den till webbläsaren

## API-endpoints

| Metod  | URL                              | Beskrivning                    |
|--------|----------------------------------|--------------------------------|
| GET    | /health                         | Hälsokontroll                  |
| POST   | /registrera                     | Skapa nytt konto               |
| POST   | /logga-in                       | Logga in                       |
| GET    | /atleter                        | Hämta alla atleter             |
| GET    | /atleter/{id}                   | Hämta en specifik atlet        |
| GET    | /atleter/{id}/schema            | Hämta atletens schema          |
| GET    | /atleter/{id}/aktiviteter       | Hämta atletens aktiviteter     |
| GET    | /streak/{id}                    | Hämta streak för användare     |
| GET    | /notiser/{id}                   | Hämta notiser                  |
| POST   | /kalorier/{id}                  | Spara en måltid                |
| GET    | /kalorier/{id}                  | Hämta dagens måltider          |
| DELETE | /kalorier/{id}/ta-bort          | Ta bort en måltid              |
| GET    | /profil/{id}                    | Hämta profildata               |

## Teknik

- **Frontend:** HTML, CSS, JavaScript (vanilla)
- **Backend:** Python, FastAPI, Uvicorn
- **Databas:** PostgreSQL med psycopg2
- **Font:** Inter (Google Fonts)
