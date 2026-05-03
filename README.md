# Aspire — Grupp 4

Träningsapp där du kan följa kända atleters dagliga scheman, logga kalorier och hålla koll på dina streaks.

## Starta appen

**Frontend:** Öppna `aspire_kod/frontend/index.html` i webbläsaren.

**Backend:**
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8001
```

Skapa en `.env`-fil i `backend/` med din databasadress:
```
DATABASE_URL=postgresql://användarnamn:lösenord@localhost:5432/aspire
```

## Funktioner

- Inloggning och registrering
- Sök och bläddra bland atleter
- Kalorilogg med måltidsflikar
- Streak-räknare med veckokalender
- Kan installeras som app på iPhone (PWA)

## Teknik

HTML · CSS · JavaScript · FastAPI · PostgreSQL

