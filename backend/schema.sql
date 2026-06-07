
-- =====================================================
-- Aspire — schema.sql
-- Kör det här skriptet i din PostgreSQL-databas
-- för att skapa alla tabeller från grunden.
--
-- Kommando (psql):
--   psql -U ANVANDARE -d DATABASNAMN -f schema.sql
-- =====================================================

-- ─────────────────────────────────────────────────────
-- ANVÄNDARE
-- (skapas även automatiskt vid serverstart, men
--  inkluderas här för fullständighetens skull)
-- ─────────────────────────────────────────────────────
 
CREATE TABLE IF NOT EXISTS anvandare (
    id              SERIAL PRIMARY KEY,
    namn            TEXT NOT NULL,
    epost           TEXT UNIQUE NOT NULL,
    losenord        TEXT NOT NULL,          -- bcrypt-hashat, aldrig klartext
    skapad_datum    DATE DEFAULT CURRENT_DATE,
    vald_atlet_id   INTEGER,
    langd           FLOAT,
    vikt            FLOAT,
    fettprocent     FLOAT
);
 
 
-- ─────────────────────────────────────────────────────
-- ATLETER
-- ─────────────────────────────────────────────────────
 
CREATE TABLE IF NOT EXISTS atleter (
    id      SERIAL PRIMARY KEY,
    namn    TEXT NOT NULL,
    sport   TEXT NOT NULL
);
 
 
-- ─────────────────────────────────────────────────────
-- DAGSPROGRAM (kopplar atlet → schema-dagar)
-- ─────────────────────────────────────────────────────
 
CREATE TABLE IF NOT EXISTS dagsprogram (
    id          SERIAL PRIMARY KEY,
    atlet_id    INTEGER NOT NULL REFERENCES atleter(id) ON DELETE CASCADE
);
 
 
-- ─────────────────────────────────────────────────────
-- AKTIVITETER (kopplade till dagsprogram)
-- ─────────────────────────────────────────────────────
 
CREATE TABLE IF NOT EXISTS aktiviteter (
    id              SERIAL PRIMARY KEY,
    dagsprogram_id  INTEGER NOT NULL REFERENCES dagsprogram(id) ON DELETE CASCADE,
    sortering       INTEGER DEFAULT 0,
    tid_start       TIME,
    tid_slut        TIME,
    namn            TEXT NOT NULL,
    beskrivning     TEXT,
    typ             TEXT,
    ikon_kod        TEXT
);
 
 
-- ─────────────────────────────────────────────────────
-- ATLET-SCHEMA (enklare schemavy per atlet)
-- ─────────────────────────────────────────────────────
 
CREATE TABLE IF NOT EXISTS atlet_schema (
    id          SERIAL PRIMARY KEY,
    atlet_id    INTEGER NOT NULL REFERENCES atleter(id) ON DELETE CASCADE
);
 
 
-- ─────────────────────────────────────────────────────
-- ATLET-AKTIVITETER (direktkopplade till atlet, används
-- när användaren väljer atlet och schema kopieras)
-- ─────────────────────────────────────────────────────
 
CREATE TABLE IF NOT EXISTS atlet_aktiviteter (
    id          SERIAL PRIMARY KEY,
    atlet_id    INTEGER NOT NULL REFERENCES atleter(id) ON DELETE CASCADE,
    namn        TEXT NOT NULL,
    tid_start   TIME,
    tid_slut    TIME,
    beskrivning TEXT,
    typ         TEXT
);
 
 
-- ─────────────────────────────────────────────────────
-- ANVÄNDARENS DAGLIGA SCHEMA
-- (kopieras från atlet_aktiviteter när atlet väljs)
-- ─────────────────────────────────────────────────────
 
CREATE TABLE IF NOT EXISTS anvandare_schema (
    id          SERIAL PRIMARY KEY,
    anvandar_id INTEGER NOT NULL REFERENCES anvandare(id) ON DELETE CASCADE,
    atlet_id    INTEGER,
    namn        TEXT NOT NULL,
    tid_start   TIME,
    tid_slut    TIME,
    beskrivning TEXT,
    typ         TEXT,
    datum       DATE NOT NULL DEFAULT CURRENT_DATE,
    avbockad    BOOLEAN NOT NULL DEFAULT FALSE
);
 
 
-- ─────────────────────────────────────────────────────
-- GENOMFÖRDA STREAK-DAGAR
-- (en rad per användare och dag = en avklarad dag)
-- ─────────────────────────────────────────────────────
 
CREATE TABLE IF NOT EXISTS anvandar_aktiviteter (
    anvandar_id INTEGER NOT NULL REFERENCES anvandare(id) ON DELETE CASCADE,
    datum       DATE NOT NULL DEFAULT CURRENT_DATE,
    UNIQUE (anvandar_id, datum)
);
 
 
-- ─────────────────────────────────────────────────────
-- KALORILOGG
-- ─────────────────────────────────────────────────────
 
CREATE TABLE IF NOT EXISTS kaloriloggar (
    id          SERIAL PRIMARY KEY,
    anvandar_id INTEGER NOT NULL REFERENCES anvandare(id) ON DELETE CASCADE,
    maltid      TEXT NOT NULL,
    kalorier    INTEGER NOT NULL CHECK (kalorier > 0),
    skapad      TIMESTAMP NOT NULL DEFAULT NOW()
);
 
 
-- ─────────────────────────────────────────────────────
-- MILSTOLPAR / UTMANINGAR (globala mallar)
-- ─────────────────────────────────────────────────────
 
CREATE TABLE IF NOT EXISTS milstolpar (
    id          SERIAL PRIMARY KEY,
    namn        TEXT NOT NULL,
    beskrivning TEXT,
    krav_dagar  INTEGER NOT NULL,
    ikon        TEXT
);
 
 
-- ─────────────────────────────────────────────────────
-- ANVÄNDARENS UTMANINGAR
-- ─────────────────────────────────────────────────────
 
CREATE TABLE IF NOT EXISTS anvandar_utmaningar (
    id              SERIAL PRIMARY KEY,
    anvandar_id     INTEGER NOT NULL REFERENCES anvandare(id) ON DELETE CASCADE,
    milstolpe_id    INTEGER NOT NULL REFERENCES milstolpar(id) ON DELETE CASCADE,
    titel           TEXT NOT NULL,
    dag             INTEGER NOT NULL DEFAULT 1,
    total_dagar     INTEGER NOT NULL,
    procent_klar    INTEGER NOT NULL DEFAULT 0,
    aktiv           BOOLEAN NOT NULL DEFAULT TRUE,
    startdatum      DATE NOT NULL DEFAULT CURRENT_DATE
);
 
 
-- ─────────────────────────────────────────────────────
-- TRÄNINGSDAGBOK — PASS
-- ─────────────────────────────────────────────────────
 
CREATE TABLE IF NOT EXISTS traning_pass (
    id          SERIAL PRIMARY KEY,
    anvandar_id INTEGER NOT NULL REFERENCES anvandare(id) ON DELETE CASCADE,
    namn        TEXT NOT NULL,
    datum       DATE NOT NULL DEFAULT CURRENT_DATE
);
 
 
-- ─────────────────────────────────────────────────────
-- TRÄNINGSDAGBOK — ÖVNINGAR PER PASS
-- ─────────────────────────────────────────────────────
 
CREATE TABLE IF NOT EXISTS traning_ovningar (
    id          SERIAL PRIMARY KEY,
    pass_id     INTEGER NOT NULL REFERENCES traning_pass(id) ON DELETE CASCADE,
    ovning      TEXT NOT NULL,
    set_antal   INTEGER,
    reps        INTEGER,
    vikt_kg     FLOAT,
    vilotid_sek INTEGER
);
 
 
-- ─────────────────────────────────────────────────────
-- EXEMPELDATA — ATLETER
-- Ta bort eller justera efter behov.
-- ─────────────────────────────────────────────────────
 
INSERT INTO atleter (namn, sport) VALUES
    ('Lionel Messi',        'Fotboll'),
    ('LeBron James',        'Basketball'),
    ('Roger Federer',       'Tennis'),
    ('Usain Bolt',          'Sprint'),
    ('Serena Williams',     'Tennis'),
    ('Cristiano Ronaldo',   'Fotboll')
ON CONFLICT DO NOTHING;
 
 
-- ─────────────────────────────────────────────────────
-- EXEMPELDATA — MILSTOLPAR (utmaningar)
-- ─────────────────────────────────────────────────────
 
INSERT INTO milstolpar (namn, beskrivning, krav_dagar, ikon) VALUES
    ('7-dagarsmålsättning',   'Genomför ditt schema 7 dagar i rad.',   7,  '🔥'),
    ('30-dagarsutmaning',     'Håll din streak i 30 dagar.',           30, '⚡'),
    ('100-dagarslegenden',    'Bli en legend — 100 dagar utan avbrott.',100,'🏆')
ON CONFLICT DO NOTHING;
 
