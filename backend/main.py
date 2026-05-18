anv"""
Aspire — main.py
FastAPI-backend med endpoints för inloggning, registrering, atleter och profiler.

Starta servern:
py -m uvicorn main:app --reload --port 8001
"""

from datetime import date, timedelta

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr

from database import (
    get_connection,
    get_cursor,
    registrera_anvandare,
    hamta_anvandare,
    skapa_anvandartabell,
)


app = FastAPI(title="Aspire API", version="1.0")


# Tillåter anrop från frontend/Live Server.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def startup():
    """
    Skapar användartabellen om den saknas när backend startar.
    Resten av tabellerna skapas via SQL-scriptet i pgAdmin.
    """
    conn = get_connection()
    try:
        skapa_anvandartabell(conn)
    finally:
        conn.close()


# ─────────────────────────────────────────────────────
# Datamodeller
# ─────────────────────────────────────────────────────

class RegistreraRequest(BaseModel):
    namn: str
    epost: EmailStr
    losenord: str


class LoggaInRequest(BaseModel):
    epost: EmailStr
    losenord: str


# ─────────────────────────────────────────────────────
# Grund-endpoint
# ─────────────────────────────────────────────────────

@app.get("/health")
def health():
    return {"status": "ok"}


# ─────────────────────────────────────────────────────
# Inloggning och registrering
# ─────────────────────────────────────────────────────

@app.post("/registrera")
def registrera(data: RegistreraRequest):
    """
    Skapar ett nytt användarkonto.
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
        "id": anvandare["id"],
        "namn": anvandare["namn"],
        "epost": anvandare["epost"],
    }


@app.post("/logga-in")
def logga_in(data: LoggaInRequest):
    """
    Loggar in en användare med e-post och lösenord.
    """
    anvandare = hamta_anvandare(data.epost)

    if anvandare is None or anvandare["losenord"] != data.losenord:
        raise HTTPException(
            status_code=401,
            detail="Felaktig e-postadress eller lösenord."
        )

    return {
        "id": anvandare["id"],
        "namn": anvandare["namn"],
        "epost": anvandare["epost"],
    }


# ─────────────────────────────────────────────────────
# Atleter
# ─────────────────────────────────────────────────────

@app.get("/atleter")
def hamta_atleter(sport: str = None):
    """
    Hämtar alla atleter, eller filtrerar på sport.
    """
    conn = get_connection()
    try:
        cursor = get_cursor(conn)

        if sport:
            cursor.execute(
                "SELECT * FROM atleter WHERE sport = %s ORDER BY id",
                (sport,)
            )
        else:
            cursor.execute("SELECT * FROM atleter ORDER BY id")

        return cursor.fetchall()
    finally:
        conn.close()


@app.get("/atleter/{atlet_id}")
def hamta_atlet(atlet_id: int):
    """
    Hämtar en specifik atlet från databasen.
    """
    conn = get_connection()
    try:
        cursor = get_cursor(conn)
        cursor.execute(
            "SELECT * FROM atleter WHERE id = %s",
            (atlet_id,)
        )
        atlet = cursor.fetchone()

        if atlet is None:
            raise HTTPException(status_code=404, detail="Atleten finns inte.")

        return atlet
    finally:
        conn.close()


@app.get("/atleter/{atlet_id}/schema")
def hamta_schema(atlet_id: int):
    """
    Hämtar enklare schema från atlet_schema.
    """
    conn = get_connection()
    try:
        cursor = get_cursor(conn)
        cursor.execute(
            """
            SELECT *
            FROM atlet_schema
            WHERE atlet_id = %s
            ORDER BY id
            """,
            (atlet_id,)
        )
        return cursor.fetchall()
    finally:
        conn.close()


@app.get("/atleter/{atlet_id}/aktiviteter")
def hamta_atlet_aktiviteter(atlet_id: int):
    """
    Hämtar aktiviteter från dagsprogram/aktiviteter för en atlet.
    """
    conn = get_connection()
    try:
        cursor = get_cursor(conn)
        cursor.execute(
            """
            SELECT 
                a.id,
                a.dagsprogram_id,
                a.sortering,
                a.tid_start,
                a.tid_slut,
                a.namn,
                a.beskrivning,
                a.typ,
                a.ikon_kod
            FROM aktiviteter a
            JOIN dagsprogram d ON d.id = a.dagsprogram_id
            WHERE d.atlet_id = %s
            ORDER BY a.sortering
            """,
            (atlet_id,)
        )

        return cursor.fetchall()
    finally:
        conn.close()


# ─────────────────────────────────────────────────────
# Streaks
# ─────────────────────────────────────────────────────

@app.get("/streak/{anvandare_id}")
def hamta_streak(anvandare_id: int):
    """
    Hämtar streak för en användare.
    Returnerar 0 om tabellen inte finns eller om användaren saknar aktivitet.
    """
    conn = get_connection()
    try:
        cursor = get_cursor(conn)

        try:
            cursor.execute(
                """
                SELECT DISTINCT datum
                FROM anvandar_aktiviteter
                WHERE anvandar_id = %s
                ORDER BY datum DESC
                """,
                (anvandare_id,)
            )
            rows = cursor.fetchall()
        except Exception:
            return {
                "aktuell": 0,
                "langsta": 0,
                "dagar": []
            }

        if not rows:
            return {
                "aktuell": 0,
                "langsta": 0,
                "dagar": []
            }

        dates = [r["datum"] for r in rows]

        today = date.today()
        streak = 0
        check_day = today

        while check_day in dates:
            streak += 1
            check_day -= timedelta(days=1)

        longest = 1
        current = 1

        for i in range(1, len(dates)):
            if dates[i - 1] - dates[i] == timedelta(days=1):
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


# ─────────────────────────────────────────────────────
# Profil
# ─────────────────────────────────────────────────────

@app.get("/notiser/{anvandare_id}")
def hamta_notiser(anvandare_id: int):
    return {"antal": 0}

@app.get("/atleter/{atlet_id}")
def hamta_atlet(atlet_id: int):
    conn = get_connection()
    try:
        cursor = get_cursor(conn)
        cursor.execute("SELECT * FROM atleter WHERE id = %s", (atlet_id,))
        atlet = cursor.fetchone()
        if not atlet:
            raise HTTPException(status_code=404, detail="Atlet hittades inte")
        return atlet
    finally:
        conn.close()

# ── PROFILENDPOINT ─────────────────────────────────────

@app.get("/profil/{anvandare_id}")
def hamta_profil(anvandare_id: int):
    conn = get_connection()
    try:
        cursor = get_cursor(conn)

        # Hämta grundinfo om användaren
        cursor.execute("""
            SELECT namn, skapad_datum
            FROM anvandare
            WHERE id = %s
        """, (anvandare_id,))
        anv = cursor.fetchone()

        if not anv:
            raise HTTPException(status_code=404, detail="Användare hittades inte")

        # Hämta streak
        cursor.execute("""
            SELECT COUNT(*) AS streak
            FROM anvandar_aktiviteter
            WHERE anvandar_id = %s
        """, (anvandare_id,))
        streak = cursor.fetchone()["streak"]

        # Hämta antal utmaningar
        cursor.execute("""
            SELECT COUNT(*) AS utmaningar
            FROM anvandar_utmaningar
            WHERE anvandar_id = %s
        """, (anvandare_id,))
        utmaningar = cursor.fetchone()["utmaningar"]

        # Hämta genomförandegrad
        cursor.execute("""
            SELECT ROUND(AVG(procent_klar)) AS genomfort
            FROM anvandar_utmaningar
            WHERE anvandar_id = %s
        """, (anvandare_id,))
        genomfort = cursor.fetchone()["genomfort"] or 0

        # Hämta aktiv utmaning
        cursor.execute("""
            SELECT titel, dag, total_dagar, procent_klar
            FROM anvandar_utmaningar
            WHERE anvandar_id = %s AND aktiv = true
            LIMIT 1
        """, (anvandare_id,))
        aktiv = cursor.fetchone()

        # Veckostatistik
        cursor.execute("""
            SELECT COUNT(*) AS traning
            FROM anvandar_aktiviteter
            WHERE anvandar_id = %s
              AND datum >= CURRENT_DATE - INTERVAL '7 days'
        """, (anvandare_id,))
        traning = cursor.fetchone()["traning"]

        cursor.execute("""
            SELECT COALESCE(SUM(kalorier),0) AS kalorier
            FROM anvandar_aktiviteter
            WHERE anvandar_id = %s
              AND datum >= CURRENT_DATE - INTERVAL '7 days'
        """, (anvandare_id,))
        kalorier = cursor.fetchone()["kalorier"]

        return {
            "namn": anv["namn"],
            "medsedan": anv["skapad_datum"].strftime("%Y-%m-%d"),
            "streak": streak,
            "utmaningar": utmaningar,
            "genomfort": genomfort,

            "aktiv": {
                "titel": aktiv["titel"] if aktiv else "",
                "dag": aktiv["dag"] if aktiv else 0,
                "total": aktiv["total_dagar"] if aktiv else 0,
                "procent": aktiv["procent_klar"] if aktiv else 0
            },

            "vecka": {
                "traning": traning,
                "kalorier": kalorier,
                "forbattring": 0
            }
        }

    finally:
        conn.close()


# ── NOTISER ────────────────────────────────────────────

@app.get("/notiser/{anvandare_id}")
def hamta_notiser(anvandare_id: int):
    conn = get_connection()
    try:
        cursor = get_cursor(conn)

        cursor.execute("""
            SELECT COUNT(*) AS antal
            FROM notiser
            WHERE anvandar_id = %s AND last = false
        """, (anvandare_id,))

        antal = cursor.fetchone()["antal"]

        return {"antal": antal}

    finally:
        conn.close()
