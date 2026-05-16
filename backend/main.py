"""
Aspire — main.py
FastAPI-backend med endpoints för inloggning och registrering.

Starta servern: uvicorn main:app --reload --port 8001
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from typing import Optional
from database import get_connection, get_cursor, registrera_anvandare, hamta_anvandare, skapa_anvandartabell

app = FastAPI(title="Aspire API", version="1.0")

# Tillåter anrop från HTML-filerna
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def startup():
    """Skapar databastabeller om de inte finns när servern startar."""
    conn = get_connection()
    skapa_anvandartabell(conn)
    conn.close()


# ── Datamodeller ──────────────────────────────────────────

class RegistreraRequest(BaseModel):
    """Innehåller uppgifter för att skapa ett nytt konto."""
    namn:     str
    epost:    EmailStr
    losenord: str


class LoggaInRequest(BaseModel):
    """Innehåller uppgifter för att logga in."""
    epost:    EmailStr
    losenord: str


# ── Endpoints ─────────────────────────────────────────────

@app.post("/registrera")
def registrera(data: RegistreraRequest):
    """
    Skapar ett nytt användarkonto.

    Returnerar användaren om det lyckas,
    eller felmeddelande om e-posten redan finns.
    """
    if len(data.losenord) < 8:
        raise HTTPException(
            status_code=400,
            detail="Lösenordet måste ha minst 8 tecken."
        )

    anvandare = registrera_anvandare(data.namn, data.epost, data.losenord)

    if anvandare is None:
        raise HTTPException(
            status_code=409,
            detail="E-postadressen används redan."
        )

    return {
        "id":    anvandare["id"],
        "namn":  anvandare["namn"],
        "epost": anvandare["epost"]
    }


@app.post("/logga-in")
def logga_in(data: LoggaInRequest):
    """
    Loggar in en användare med e-post och lösenord.

    Returnerar användaren om uppgifterna stämmer,
    eller felmeddelande om de är fel.
    """
    anvandare = hamta_anvandare(data.epost)

    if anvandare is None or anvandare["losenord"] != data.losenord:
        raise HTTPException(
            status_code=401,
            detail="Felaktig e-postadress eller lösenord."
        )

    return {
        "id":    anvandare["id"],
        "namn":  anvandare["namn"],
        "epost": anvandare["epost"]
    }


@app.get("/atleter")
def hamta_atleter(sport: str = None):
    """
    Hämtar alla atleter, eller filtrerar på sport.

    Parametrar:
        sport (str): Valfri filtrering, t.ex. Basketball.
    """
    conn = get_connection()
    try:
        cursor = get_cursor(conn)
        if sport:
            cursor.execute("SELECT * FROM atleter WHERE sport = %s", (sport,))
        else:
            cursor.execute("SELECT * FROM atleter")
        return cursor.fetchall()
    finally:
        conn.close()


@app.get("/atleter/{atlet_id}/schema")
def hamta_schema(atlet_id: int):
    """
    Hämtar schemat för en specifik atlet.

    Parametrar:
        atlet_id (int): Atletens id i databasen.
    """
    conn = get_connection()
    try:
        cursor = get_cursor(conn)
        cursor.execute(
            "SELECT * FROM atlet_schema WHERE atlet_id = %s", (atlet_id,)
        )
        return cursor.fetchall()
    finally:
        conn.close()

from datetime import date, timedelta


@app.get("/streak/{anvandare_id}")
def hamta_streak(anvandare_id: int):
    conn = get_connection()
    try:
        cursor = get_cursor(conn)

        #hämtar alla datum då användaren varit aktiv
        cursor.execute("""
            SELECT DISTINCT datum
            FROM anvandar_aktiviteter
            WHERE anvandar_id = %s
            ORDER BY datum DESC
        """, (anvandare_id,))
        rows = cursor.fetchall()

        if not rows:
            return {"aktuell": 0, "langsta": 0}

        dates = [r["datum"] for r in rows]

        #räknar den aktuell streaken
        today = date.today()
        streak = 0
        check_day = today

        while check_day in dates:
            streak += 1
            check_day -= timedelta(days=1)

        #räkna den längsta streaken
        longest = 0
        current = 1

        for i in range(1, len(dates)):
            if dates[i-1] - dates[i] == timedelta(days=1):
                current += 1
            else:
                longest = max(longest, current)
                current = 1

        longest = max(longest, current)

        return {
            "aktuell": streak,
            "langsta": longest,
            "dagar": [str(d) for d in dates]
        }

    finally:
        conn.close()
