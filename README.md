# Aspire — Grupp 4

Aspire är en mobilanpassad träningsapp där användare kan följa kända atleters dagliga scheman, logga kalorier, spåra streaks, föra träningsdagbok och hantera sin profil. Appen är designad som en mobilprototyp och kan installeras som en PWA (Progressive Web App) på iPhone.

---

## Innehållsförteckning

1. [Teknikstack](#teknikstack)
2. [Projektstruktur](#projektstruktur)
3. [Krav](#krav)
4. [Miljövariabel — .env](#miljövariabel--env)
5. [Databasschema](#databasschema)
6. [Installation och uppstart](#installation-och-uppstart)
7. [Frontend — konfiguration](#frontend--konfiguration)
8. [API-dokumentation](#api-dokumentation)
9. [Autentisering och sessionshantering](#autentisering-och-sessionshantering)
10. [Funktioner](#funktioner)
11. [PWA — Installera på iPhone](#pwa--installera-på-iphone)
12. [Vanliga fel och lösningar](#vanliga-fel-och-lösningar)

---

## Teknikstack

| Del       | Teknik                                      |
|-----------|---------------------------------------------|
| Frontend  | HTML5, CSS3, Vanilla JavaScript             |
| Backend   | Python 3.10+, FastAPI, Uvicorn              |
| Databas   | PostgreSQL                                  |
| ORM/DB    | psycopg2 (connection pool)                  |
| Auth      | bcrypt (lösenordshashning), localStorage    |
| Font      | Inter (Google Fonts)                        |

---

## Projektstruktur

```
Aspire-Official-main/
├── backend/
│   ├── main.py              # FastAPI-server — alla endpoints
│   ├── database.py          # Databasanslutning, connection pool, hjälpfunktioner
│   ├── requirements.txt     # Python-beroenden
│   └── .env                 # ⚠ Skapas manuellt — finns INTE i repot (se nedan)
│
└── aspire_kod/
    └── frontend/
        ├── index.html           # Inloggningssida (startsida)
        ├── registrera.html      # Registreringssida
        ├── hem.html             # Startsida efter inloggning
        ├── sok.html             # Sök och filtrera atleter
        ├── atletprofil.html     # Atletens detaljsida
        ├── kalorier.html        # Kalorilogg med måltidsflikar
        ├── streaks.html         # Streak-kalender och statistik
        ├── profil.html          # Användarens profilsida
        ├── installningar.html   # Inställningar, BMI, kontoborttagning
        ├── traning.html         # Träningsdagbok
        ├── integritet.html      # Integritetspolicy
        ├── css/
        │   └── styles.css       # All styling (~65 KB)
        ├── icons/               # SVG-ikoner (basketball, sprint, mat m.fl.)
        └── javascript/
            ├── app.js           # Delad JS för hela appen — importeras på varje sida
            ├── atletprofil.js   # Atletprofilsidans logik
            ├── hem.js           # Hemsidans logik
            ├── installningar.js # Inställningssidans logik
            ├── profil.js        # Profilsidans logik
            ├── sok.js           # Söksidans logik
            ├── statusbar.js     # Statusbar-hantering
            ├── streaks.js       # Streak-kalenderns logik
            └── traning.js       # Träningsdagbokens logik
```

---

## Krav

- **Python 3.10** eller nyare
- **PostgreSQL** — en körande instans (lokal eller remote, t.ex. Supabase, Railway, ElephantSQL)
- **En modern webbläsare** — Chrome, Safari eller Firefox
- **VS Code med Live Server** (rekommenderat för frontend)

---

## Miljövariabel — .env

Filen `.env` ingår **inte** i repot (den är gitignorerad). Du måste skapa den själv inuti `backend/`-mappen.

**Skapa filen `backend/.env` med följande innehåll:**

```env
DATABASE_URL=postgresql://ANVANDARE:LOSENORD@HOST:PORT/DATABASNAMN
```

**Exempel med lokal PostgreSQL:**

```env
DATABASE_URL=postgresql://postgres:mittlosenord@localhost:5432/aspire
```

**Exempel med Supabase (remote):**

```env
DATABASE_URL=postgresql://postgres:mittlosenord@db.xyzxyzxyz.supabase.co:5432/postgres
```

`database.py` läser in `DATABASE_URL` via `python-dotenv` och skapar en connection pool med 1–10 anslutningar mot databasen.

> **OBS:** Utan en korrekt `.env` startar inte backend-servern. Du får då felet `TypeError: argument of type 'NoneType'`.

---

## Databasschema

Databasen innehåller följande tabeller. **Tabellen `anvandare` skapas automatiskt** vid serverstart. Övriga tabeller måste finnas i din databas innan appen kan användas fullt ut — de förutsätts vara skapade i förväg (t.ex. av databasadministratören eller via ett SQL-skript).

### `anvandare` — skapas automatiskt
```sql
CREATE TABLE IF NOT EXISTS anvandare (
    id              SERIAL PRIMARY KEY,
    namn            TEXT NOT NULL,
    epost           TEXT UNIQUE NOT NULL,
    losenord        TEXT NOT NULL,          -- bcrypt-hashat
    skapad_datum    DATE DEFAULT CURRENT_DATE,
    vald_atlet_id   INTEGER,
    langd           FLOAT,
    vikt            FLOAT,
    fettprocent     FLOAT
);
```

### `atleter` — förutsätts finnas
```sql
CREATE TABLE atleter (
    id      SERIAL PRIMARY KEY,
    namn    TEXT NOT NULL,
    sport   TEXT NOT NULL
    -- övriga kolumner beroende på datainmatning
);
```

### `atlet_schema`
```sql
CREATE TABLE atlet_schema (
    id          SERIAL PRIMARY KEY,
    atlet_id    INTEGER REFERENCES atleter(id)
    -- övriga kolumner
);
```

### `atlet_aktiviteter`
```sql
CREATE TABLE atlet_aktiviteter (
    id          SERIAL PRIMARY KEY,
    atlet_id    INTEGER REFERENCES atleter(id),
    namn        TEXT,
    tid_start   TIME,
    tid_slut    TIME,
    beskrivning TEXT,
    typ         TEXT
);
```

### `aktiviteter`
```sql
CREATE TABLE aktiviteter (
    id              SERIAL PRIMARY KEY,
    dagsprogram_id  INTEGER,
    sortering       INTEGER,
    tid_start       TIME,
    tid_slut        TIME,
    namn            TEXT,
    beskrivning     TEXT,
    typ             TEXT,
    ikon_kod        TEXT
);
```

### `dagsprogram`
```sql
CREATE TABLE dagsprogram (
    id          SERIAL PRIMARY KEY,
    atlet_id    INTEGER REFERENCES atleter(id)
);
```

### `anvandare_schema`
```sql
CREATE TABLE anvandare_schema (
    id          SERIAL PRIMARY KEY,
    anvandar_id INTEGER REFERENCES anvandare(id),
    atlet_id    INTEGER,
    namn        TEXT,
    tid_start   TIME,
    tid_slut    TIME,
    beskrivning TEXT,
    typ         TEXT,
    datum       DATE DEFAULT CURRENT_DATE,
    avbockad    BOOLEAN DEFAULT FALSE
);
```

### `anvandar_aktiviteter`
```sql
CREATE TABLE anvandar_aktiviteter (
    anvandar_id INTEGER REFERENCES anvandare(id),
    datum       DATE,
    UNIQUE(anvandar_id, datum)        -- en rad per användare och dag
);
```

### `kaloriloggar`
```sql
CREATE TABLE kaloriloggar (
    id          SERIAL PRIMARY KEY,
    anvandar_id INTEGER REFERENCES anvandare(id),
    maltid      TEXT NOT NULL,
    kalorier    INTEGER NOT NULL,
    skapad      TIMESTAMP DEFAULT NOW()
);
```

### `milstolpar` (utmaningar)
```sql
CREATE TABLE milstolpar (
    id          SERIAL PRIMARY KEY,
    namn        TEXT NOT NULL,
    beskrivning TEXT,
    krav_dagar  INTEGER NOT NULL,
    ikon        TEXT
);
```

### `anvandar_utmaningar`
```sql
CREATE TABLE anvandar_utmaningar (
    id              SERIAL PRIMARY KEY,
    anvandar_id     INTEGER REFERENCES anvandare(id),
    milstolpe_id    INTEGER REFERENCES milstolpar(id),
    titel           TEXT,
    dag             INTEGER DEFAULT 1,
    total_dagar     INTEGER,
    procent_klar    INTEGER DEFAULT 0,
    aktiv           BOOLEAN DEFAULT TRUE,
    startdatum      DATE DEFAULT CURRENT_DATE
);
```

### `traning_pass`
```sql
CREATE TABLE traning_pass (
    id          SERIAL PRIMARY KEY,
    anvandar_id INTEGER REFERENCES anvandare(id),
    namn        TEXT NOT NULL,
    datum       DATE DEFAULT CURRENT_DATE
);
```

### `traning_ovningar`
```sql
CREATE TABLE traning_ovningar (
    id          SERIAL PRIMARY KEY,
    pass_id     INTEGER REFERENCES traning_pass(id),
    ovning      TEXT NOT NULL,
    set_antal   INTEGER,
    reps        INTEGER,
    vikt_kg     FLOAT,
    vilotid_sek INTEGER
);
```

---

## Installation och uppstart

### 1. Klona eller packa upp projektet

```bash
# Om du har zip-filen:
unzip Aspire-Official-main.zip
cd Aspire-Official-main
```

### 2. Skapa .env-filen

```bash
cd backend
# Windows (PowerShell):
echo DATABASE_URL=postgresql://ANVANDARE:LOSENORD@HOST:5432/DATABAS > .env

# Mac/Linux:
echo "DATABASE_URL=postgresql://ANVANDARE:LOSENORD@HOST:5432/DATABAS" > .env
```

Ersätt `ANVANDARE`, `LOSENORD`, `HOST` och `DATABAS` med dina faktiska uppgifter.

### 3. Installera Python-beroenden

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

Paketen som installeras:

| Paket            | Syfte                                      |
|------------------|--------------------------------------------|
| fastapi          | Webbramverk för REST API                   |
| uvicorn          | ASGI-server som kör FastAPI                |
| psycopg2-binary  | PostgreSQL-drivrutin för Python            |
| python-dotenv    | Läser in variabler från `.env`             |
| pydantic[email]  | Datavalidering inkl. e-postvalidering      |
| bcrypt           | Lösenordshashning                          |

### 4. Starta backend-servern

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

Servern startar på `http://127.0.0.1:8002`.

Verifiera att den körs:
```
http://127.0.0.1:8002/health   →  {"status": "ok"}
http://127.0.0.1:8002/docs     →  Interaktiv API-dokumentation (Swagger UI)
```

### 5. Öppna frontend

Öppna `aspire_kod/frontend/index.html` i webbläsaren:

- **VS Code (rekommenderat):** Högerklicka på `index.html` → "Open with Live Server"
- **Manuellt:** Dubbelklicka på filen, eller dra den till webbläsarfönstret

> **Tips:** Live Server (VS Code-extension) rekommenderas eftersom direktöppning via `file://` kan blockeras av webbläsarens CORS-restriktioner vid vissa anrop.

---

## Frontend — konfiguration

API-adressen är hårdkodad i flera JavaScript-filer och pekar på `http://127.0.0.1:8002` (lokal development). Om du byter port eller kör backend på en annan server behöver du uppdatera dessa rader:

| Fil                          | Variabel / rad                                          |
|------------------------------|--------------------------------------------------------|
| `javascript/app.js`          | `const ASPIRE_API_BASE_URL = "http://127.0.0.1:8002";` |
| `javascript/streaks.js`      | `const ASPIRE_STREAK_API = 'http://127.0.0.1:8002';`  |
| `javascript/hem.js`          | `const API = "http://127.0.0.1:8002";`                 |
| `javascript/profil.js`       | `const PROFIL_API = 'http://127.0.0.1:8002';`          |

---

## API-dokumentation

Samtliga endpoints finns på `http://127.0.0.1:8002`. En interaktiv version med testmöjligheter finns på `/docs`.

### Hälsokontroll

| Metod | URL       | Beskrivning          |
|-------|-----------|----------------------|
| GET   | `/health` | Returnerar `{"status":"ok"}` |

### Autentisering

| Metod | URL           | Body (JSON)                          | Svar                        |
|-------|---------------|--------------------------------------|-----------------------------|
| POST  | `/registrera` | `{namn, epost, losenord}`            | `{id, namn, epost}`         |
| POST  | `/logga-in`   | `{epost, losenord}`                  | `{id, namn, epost}`         |

Lösenordet måste vara **minst 8 tecken**. Lösenord lagras bcrypt-hashat.

### Atleter

| Metod | URL                            | Beskrivning                                  |
|-------|--------------------------------|----------------------------------------------|
| GET   | `/atleter`                     | Hämta alla atleter (valfri `?sport=` filter) |
| GET   | `/atleter/{id}`                | Hämta en specifik atlet                      |
| GET   | `/atleter/{id}/schema`         | Hämta atletens schema                        |
| GET   | `/atleter/{id}/aktiviteter`    | Hämta atletens alla aktiviteter              |

### Användarens schema och atlet

| Metod | URL                                            | Beskrivning                                      |
|-------|------------------------------------------------|--------------------------------------------------|
| POST  | `/anvandare/{id}/valj-atlet`                   | Välj atlet och kopiera schema till idag          |
| GET   | `/anvandare/{id}/vald-atlet`                   | Hämta vald atlet                                 |
| GET   | `/anvandare/{id}/schema/idag`                  | Hämta dagens schema                              |
| POST  | `/anvandare/{id}/schema/{rad_id}/bocka-av`     | Bocka av/av-bocka en aktivitet                   |

### Profil och kroppsdata

| Metod | URL                         | Beskrivning                                 | Auth krävs |
|-------|-----------------------------|---------------------------------------------|------------|
| GET   | `/profil/{id}`              | Hämta profildata (streak, statistik m.m.)   | Nej        |
| GET   | `/anvandare/{id}/kropp`     | Hämta längd, vikt, fettprocent              | Nej        |
| PUT   | `/anvandare/{id}/kropp`     | Spara längd, vikt, fettprocent              | Ja         |
| DELETE| `/anvandare/{id}`           | Radera konto och all data                   | Ja         |

### Kalorilogg

| Metod  | URL                          | Beskrivning                            |
|--------|------------------------------|----------------------------------------|
| POST   | `/kalorier/{id}`             | Spara en måltid `{maltid, kalorier}`   |
| GET    | `/kalorier/{id}`             | Hämta dagens måltider                  |
| DELETE | `/kalorier/{kalori_id}/ta-bort` | Ta bort en enskild måltidspost      |

### Streaks

| Metod | URL                        | Beskrivning                                |
|-------|----------------------------|--------------------------------------------|
| GET   | `/streak/{id}`             | Hämta streak-data `{aktuell, langsta, dagar}` |
| POST  | `/streak/{id}/reset`       | Återställ alla streak-data för användaren  |

### Notiser

| Metod | URL              | Beskrivning                        |
|-------|------------------|------------------------------------|
| GET   | `/notiser/{id}`  | Returnerar `{"antal": 0}` (stub)   |

### Utmaningar (milstolpar)

| Metod  | URL                                   | Beskrivning                              |
|--------|---------------------------------------|------------------------------------------|
| GET    | `/utmaningar`                         | Hämta alla tillgängliga utmaningar       |
| POST   | `/anvandare/{id}/utmaning/starta`     | Starta en utmaning `{milstolpe_id}`      |
| GET    | `/anvandare/{id}/utmaning/aktiv`      | Hämta aktiv utmaning                     |
| POST   | `/anvandare/{id}/utmaning/framsteg`   | Uppdatera framsteg (+1 dag)              |
| DELETE | `/anvandare/{id}/utmaning/avsluta`    | Avsluta aktiv utmaning                   |

### Träningsdagbok

| Metod  | URL                                  | Beskrivning                              | Auth krävs |
|--------|--------------------------------------|------------------------------------------|------------|
| POST   | `/anvandare/{id}/traning/pass`       | Skapa nytt träningspass `{namn}`         | Ja         |
| GET    | `/anvandare/{id}/traning/pass`       | Hämta alla pass med övningar             | Ja         |
| POST   | `/anvandare/{id}/traning/ovning`     | Logga övning till ett pass               | Ja         |
| DELETE | `/traning/ovning/{ovning_id}`        | Ta bort en övning                        | Ja         |

---

## Autentisering och sessionshantering

Appen använder **ingen JWT eller cookie-baserad autentisering**. Istället lagras inloggad användares data i `localStorage` under nyckeln `aspire_inloggad`:

```json
{
  "id": 1,
  "namn": "Anna Andersson",
  "epost": "anna@example.com"
}
```

Skyddade sidor (hem, profil, streaks m.fl.) kontrollerar vid sidladdning om `aspire_inloggad` finns i localStorage — saknas den görs en omdirigering till `index.html`.

Endpoints som ändrar känslig data (spara kropp, radera konto, träningslogg) kräver en HTTP-header:

```
X-Anvandare-Id: <användar-id>
```

Backend verifierar att detta ID finns i databasen via `krav_inloggad`-beroendet.

**Logga ut** rensar dessa localStorage-nycklar:
- `aspire_inloggad`
- `anvandare`
- `user`
- `aspire_alla_atleter`

---

## Funktioner

### Inloggning och registrering
Användare registrerar sig med namn, e-post och lösenord (minst 8 tecken). Lösenordet hashas med bcrypt innan det sparas. Vid inloggning kontrolleras lösenordet mot hashen.

### Sök atleter
Filtrera atleter på sport via filterknappar, eller sök i realtid på namn och sport. Atletdata cachas i localStorage (`aspire_alla_atleter`) för snabbare laddning vid återbesök.

### Atletprofil och dagligt schema
Välj en atlet för att följa deras dagliga schema. Schemat kopieras till användarens egna schematbell för dagens datum. Aktiviteter bockas av en i taget — när alla är avbockade sparas dagen som en genomförd streak-dag.

### Kalorilogg
Logga kalorier per måltid (frukost, lunch, middag, snacks). Alla poster sparas i databasen med tidsstämpel. Dagliga målet är 2 500 kcal. Gamla poster kan tas bort.

### Streaks
Streak-räknaren baseras på dagar i `anvandar_aktiviteter`. En dag räknas när alla schemaaktiviteter för dagen är avbockade. Visar aktuell streak, längsta streak och en månadskalender.

### Profil
Sammanfattning av användarens statistik: streak, antal utmaningar, genomsnittlig genomförandegrad, träningspass senaste 7 dagarna, och ett träningshistorik-diagram per vecka.

### BMI och kroppsdata
I inställningar kan användaren spara längd, vikt och fettprocent. BMI beräknas automatiskt med visuell indikator och kategori.

### Träningsdagbok
Skapa träningspass och logga övningar med set, reps, vikt och vilotid. Kräver inloggning via `X-Anvandare-Id`-header.

### Utmaningar
Starta en utmaning kopplad till en milstolpe. Framsteg uppdateras per dag, och utmaningen markeras som avklarad när alla dagar är genomförda.

### Kontoborttagning
Raderar alla användarrelaterade data i korrekt ordning (kaloriloggar → aktiviteter → schema → utmaningar → träning → konto).

---

## PWA — Installera på iPhone

Appen är konfigurerad med Apple-specifika PWA-metataggar och kan läggas till på hemskärmen:

1. Öppna appen i **Safari** på iPhone
2. Tryck på dela-ikonen (rutan med pil uppåt)
3. Välj **"Lägg till på hemskärmen"**
4. Appen öppnas då i helskärmsläge utan webbläsarens adressfält

---

## Vanliga fel och lösningar

**`TypeError: argument of type 'NoneType'` vid serverstart**
→ Filen `backend/.env` saknas eller `DATABASE_URL` är inte satt. Skapa `.env` enligt instruktionerna ovan.

**`connection refused` eller `CORS error` i webbläsaren**
→ Backend-servern körs inte. Kontrollera att `uvicorn`-kommandot kördes utan fel och att port 8002 är ledig.

**Tomma sidor eller "Ingen atlet vald"**
→ Databasen saknar data i tabellerna `atleter`, `atlet_aktiviteter` eller `milstolpar`. Fyll i dessa tabeller manuellt eller med ett seed-skript.

**`psycopg2.OperationalError: could not connect to server`**
→ PostgreSQL är inte igång, eller `DATABASE_URL` i `.env` innehåller felaktiga uppgifter (host, port, lösenord eller databasnamn).

**Appen fungerar inte på `file://` (utan Live Server)**
→ Webbläsare blockerar ibland fetch-anrop från `file://`-protokollet. Använd VS Code Live Server eller en lokal HTTP-server (`python3 -m http.server`).

**Port 8002 är redan upptagen**
→ Byt port i både uvicorn-kommandot och i alla fyra JavaScript-filer som innehåller API-adressen (se [Frontend — konfiguration](#frontend--konfiguration)).
