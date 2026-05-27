"""
Aspire — main.py
FastAPI-backend med endpoints för inloggning, registrering, atleter och profiler.

Starta servern:
py -m uvicorn main:app --reload --port 8002
"""

from datetime import date, timedelta
from typing import Optional

from fastapi import FastAPI, HTTPException, Header, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr

from database import (
    get_connection,
    get_cursor,
    release_connection,
    registrera_anvandare,
    hamta_anvandare,
    skapa_anvandartabell,
    kontrollera_losenord,
    hasha_losenord,
)


app = FastAPI(title="Aspire API", version="1.0")


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

def krav_inloggad(x_anvandare_id: int = Header(...)):
    conn = get_connection()
    try:
        cursor = get_cursor(conn)
        cursor.execute("SELECT id FROM anvandare WHERE id = %s", (x_anvandare_id,))
        if not cursor.fetchone():
            raise HTTPException(status_code=401, detail="Obehörig")
        return x_anvandare_id
    finally:
        release_connection(conn)

@app.on_event("startup")
def startup():
    conn = get_connection()
    try:
        skapa_anvandartabell(conn)
    finally:
        release_connection(conn)


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

class KaloriRequest(BaseModel):
    maltid: str
    kalorier: int

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
    anvandare = hamta_anvandare(data.epost)

    if anvandare is None:
        raise HTTPException(
            status_code=401,
            detail="Felaktig e-postadress eller lösenord."
        )

    if not kontrollera_losenord(data.losenord, anvandare["losenord"]):
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
        release_connection(conn)


@app.get("/atleter/{atlet_id}")
def hamta_atlet(atlet_id: int):
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
        release_connection(conn)


@app.get("/atleter/{atlet_id}/schema")
def hamta_schema(atlet_id: int):
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
        release_connection(conn)


@app.get("/atleter/{atlet_id}/aktiviteter")
def hamta_atlet_aktiviteter(atlet_id: int):
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
        release_connection(conn)


# ─────────────────────────────────────────────────────
# Streaks
# ─────────────────────────────────────────────────────

@app.get("/streak/{anvandare_id}")
def hamta_streak(anvandare_id: int):
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
            return {"aktuell": 0, "langsta": 0, "dagar": []}

        if not rows:
            return {"aktuell": 0, "langsta": 0, "dagar": []}

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
        release_connection(conn)


# ─────────────────────────────────────────────────────
# Notiser
# ─────────────────────────────────────────────────────

@app.get("/notiser/{anvandare_id}")
def hamta_notiser(anvandare_id: int):
    return {"antal": 0}


# ─────────────────────────────────────────────────────
# Kalorilogg
# ─────────────────────────────────────────────────────

@app.post("/kalorier/{anvandare_id}")
def spara_kalori(anvandare_id: int, data: KaloriRequest):
    if data.kalorier <= 0:
        raise HTTPException(status_code=400, detail="Kalorier måste vara större än 0.")
    conn = get_connection()
    try:
        cursor = get_cursor(conn)
        cursor.execute(
            "INSERT INTO kaloriloggar (anvandar_id, maltid, kalorier) VALUES (%s, %s, %s) RETURNING id, maltid, kalorier, skapad",
            (anvandare_id, data.maltid, data.kalorier)
        )
        rad = cursor.fetchone()
        conn.commit()
        return rad
    finally:
        release_connection(conn)


@app.get("/kalorier/{anvandare_id}")
def hamta_kalorier(anvandare_id: int):
    conn = get_connection()
    try:
        cursor = get_cursor(conn)
        cursor.execute(
            "SELECT id, maltid, kalorier, skapad FROM kaloriloggar WHERE anvandar_id = %s AND skapad::date = CURRENT_DATE ORDER BY skapad",
            (anvandare_id,)
        )
        return cursor.fetchall()
    finally:
        release_connection(conn)


@app.delete("/kalorier/{kalori_id}/ta-bort")
def ta_bort_kalori(kalori_id: int):
    conn = get_connection()
    try:
        cursor = get_cursor(conn)
        cursor.execute("DELETE FROM kaloriloggar WHERE id = %s", (kalori_id,))
        conn.commit()
        return {"status": "borttagen"}
    finally:
        release_connection(conn)


# ─────────────────────────────────────────────────────
# Profil
# ─────────────────────────────────────────────────────
@app.get("/profil/{anvandare_id}")
def hamta_profil(anvandare_id: int):
    conn = get_connection()
    try:
        cursor = get_cursor(conn)

        cursor.execute("""
            SELECT namn, skapad_datum
            FROM anvandare
            WHERE id = %s
        """, (anvandare_id,))
        anv = cursor.fetchone()
        if not anv:
            raise HTTPException(status_code=404, detail="Användare hittades inte")
        streak = hamta_streak(anvandare_id)["aktuell"]

        # Hämta antal utmaningar
        cursor.execute("""
            SELECT COUNT(*) AS utmaningar
            FROM anvandar_utmaningar
            WHERE anvandar_id = %s
        """, (anvandare_id,))
        utmaningar = cursor.fetchone()["utmaningar"]

        cursor.execute("""
            SELECT ROUND(AVG(procent_klar)) AS genomfort
            FROM anvandar_utmaningar
            WHERE anvandar_id = %s
        """, (anvandare_id,))
        genomfort = cursor.fetchone()["genomfort"] or 0

        cursor.execute("""
            SELECT titel, dag, total_dagar, procent_klar
            FROM anvandar_utmaningar
            WHERE anvandar_id = %s AND aktiv = true
            LIMIT 1
        """, (anvandare_id,))
        aktiv = cursor.fetchone()

        cursor.execute("""
            SELECT COUNT(*) AS traning
            FROM anvandar_aktiviteter
            WHERE anvandar_id = %s
              AND datum >= CURRENT_DATE - INTERVAL '7 days'
        """, (anvandare_id,))
        traning = cursor.fetchone()["traning"]

        cursor.execute("""
            SELECT COUNT(*) AS traning_forra
            FROM anvandar_aktiviteter
            WHERE anvandar_id = %s
              AND datum >= CURRENT_DATE - INTERVAL '14 days'
              AND datum <  CURRENT_DATE - INTERVAL '7 days'
        """, (anvandare_id,))
        traning_forra = cursor.fetchone()["traning_forra"]

        if traning_forra > 0:
            forbattring = round(((traning - traning_forra) / traning_forra) * 100)
        elif traning > 0:
            forbattring = 100
        else:
            forbattring = 0

        cursor.execute("""
            SELECT COUNT(*) AS dagar
            FROM (
                SELECT skapad::date, SUM(kalorier) AS totalt
                FROM kaloriloggar
                WHERE anvandar_id = %s
                  AND skapad::date >= CURRENT_DATE - INTERVAL '7 days'
                GROUP BY skapad::date
                HAVING SUM(kalorier) >= 2500
            ) AS uppnadda
        """, (anvandare_id,))
        kalorier_dagar = cursor.fetchone()["dagar"]

        cursor.execute("""
            SELECT DATE_TRUNC('week', datum)::date AS vecka_start, COUNT(*) AS pass
            FROM anvandar_aktiviteter
            WHERE anvandar_id = %s
              AND datum >= CURRENT_DATE - INTERVAL '56 days'
            GROUP BY vecka_start
            ORDER BY vecka_start DESC
        """, (anvandare_id,))
        historik = [
            {"vecka": r["vecka_start"].strftime("%d %b"), "pass": r["pass"]}
            for r in cursor.fetchall()
        ]

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
                "kalorier_dagar": kalorier_dagar,
                "forbattring": forbattring
            },
            "historik": historik
        }

    finally:
        release_connection(conn)

# ─────────────────────────────────────────────────────
# VÄLJ ATLET & SCHEMA FÖR HEM.HTML
# ─────────────────────────────────────────────────────

class ValjAtletBody(BaseModel):
    atlet_id: int

class BockaAvBody(BaseModel):
    avbockad: bool

class Kroppsdata(BaseModel):
    langd: float
    vikt: float
    fettprocent: Optional[float] = None

class NyttPass(BaseModel):
    namn: str

class NyOvning(BaseModel):
    pass_id: int
    ovning: str
    set_antal: int
    reps: int
    vikt_kg: float
    vilotid_sek: int


@app.post("/anvandare/{anvandare_id}/valj-atlet")
def valj_atlet(anvandare_id: int, body: ValjAtletBody):
    conn = get_connection()
    try:
        cursor = get_cursor(conn)

        cursor.execute("""
            UPDATE anvandare SET vald_atlet_id = %s WHERE id = %s
        """, (body.atlet_id, anvandare_id))

        cursor.execute("""
            SELECT namn, tid_start, tid_slut, beskrivning, typ
            FROM atlet_aktiviteter
            WHERE atlet_id = %s
            ORDER BY tid_start
        """, (body.atlet_id,))
        aktiviteter = cursor.fetchall()

        cursor.execute("""
            DELETE FROM anvandare_schema
            WHERE anvandar_id = %s AND datum = CURRENT_DATE
        """, (anvandare_id,))

        for akt in aktiviteter:
            cursor.execute("""
                INSERT INTO anvandare_schema (anvandar_id, atlet_id, namn, tid_start, tid_slut, beskrivning, typ, datum, avbockad)
                VALUES (%s, %s, %s, %s, %s, %s, %s, CURRENT_DATE, FALSE)
            """, (anvandare_id, body.atlet_id, akt["namn"], akt.get("tid_start"), akt.get("tid_slut"), akt.get("beskrivning"), akt.get("typ")))

        conn.commit()
        return {"status": "ok"}
    finally:
        release_connection(conn)


@app.get("/anvandare/{anvandare_id}/vald-atlet")
def hamta_vald_atlet(anvandare_id: int):
    conn = get_connection()
    try:
        cursor = get_cursor(conn)

        cursor.execute("""
            SELECT vald_atlet_id FROM anvandare WHERE id = %s
        """, (anvandare_id,))
        anv = cursor.fetchone()

        if not anv or not anv["vald_atlet_id"]:
            raise HTTPException(status_code=404, detail="Ingen atlet vald")

        cursor.execute("""
            SELECT id, namn, sport FROM atleter WHERE id = %s
        """, (anv["vald_atlet_id"],))
        atlet = cursor.fetchone()

        if not atlet:
            raise HTTPException(status_code=404, detail="Atleten hittades inte")

        return {"id": atlet["id"], "namn": atlet["namn"], "sport": atlet["sport"]}
    finally:
        release_connection(conn)


@app.get("/anvandare/{anvandare_id}/schema/idag")
def hamta_schema_idag(anvandare_id: int):
    conn = get_connection()
    try:
        cursor = get_cursor(conn)

        cursor.execute("""
            SELECT id, namn, tid_start, tid_slut, beskrivning, avbockad, typ
            FROM anvandare_schema
            WHERE anvandar_id = %s AND datum = CURRENT_DATE
            ORDER BY tid_start
        """, (anvandare_id,))
        rader = cursor.fetchall()

        return [
            {
                "id": r["id"],
                "namn": r["namn"],
                "tid_start": r["tid_start"],
                "tid_slut": r["tid_slut"],
                "beskrivning": r["beskrivning"],
                "avbockad": r["avbockad"],
                "typ": r["typ"]
            }
            for r in rader
        ]
    finally:
        release_connection(conn)


@app.post("/anvandare/{anvandare_id}/schema/{rad_id}/bocka-av")
def bocka_av_aktivitet(anvandare_id: int, rad_id: int, body: BockaAvBody):
    conn = get_connection()
    try:
        cursor = get_cursor(conn)

        cursor.execute("""
            UPDATE anvandare_schema
            SET avbockad = %s
            WHERE id = %s AND anvandar_id = %s
        """, (body.avbockad, rad_id, anvandare_id))

        cursor.execute("""
            SELECT COUNT(*) AS totalt,
                   SUM(CASE WHEN avbockad THEN 1 ELSE 0 END) AS avbockade
            FROM anvandare_schema
            WHERE anvandar_id = %s AND datum = CURRENT_DATE
        """, (anvandare_id,))
        rad = cursor.fetchone()
        totalt = rad["totalt"]
        avbockade = rad["avbockade"]

        if totalt > 0 and totalt == avbockade:
            cursor.execute("""
                INSERT INTO anvandar_aktiviteter (anvandar_id, datum)
                VALUES (%s, CURRENT_DATE)
                ON CONFLICT (anvandar_id, datum) DO NOTHING
            """, (anvandare_id,))
        else:
            cursor.execute("""
                DELETE FROM anvandar_aktiviteter
                WHERE anvandar_id = %s AND datum = CURRENT_DATE
            """, (anvandare_id,))

        conn.commit()
        return {"status": "ok", "avbockade": avbockade, "totalt": totalt}
    finally:
        release_connection(conn)

@app.get("/anvandare/{anvandare_id}/kropp")
def hamta_kropp(anvandare_id: int):
    conn = get_connection()
    try:
        cursor = get_cursor(conn)
        cursor.execute("""
            SELECT langd, vikt, fettprocent FROM anvandare WHERE id = %s
        """, (anvandare_id,))
        rad = cursor.fetchone()
        if not rad:
            raise HTTPException(status_code=404, detail="Användare hittades inte")
        return {"langd": rad["langd"], "vikt": rad["vikt"], "fettprocent": rad["fettprocent"]}
    finally:
        release_connection(conn)


@app.put("/anvandare/{anvandare_id}/kropp")
def spara_kropp(anvandare_id: int, data: Kroppsdata, _: int = Depends(krav_inloggad)):
    conn = get_connection()
    try:
        cursor = get_cursor(conn)
        cursor.execute("""
            UPDATE anvandare SET langd = %s, vikt = %s, fettprocent = %s WHERE id = %s
        """, (data.langd, data.vikt, data.fettprocent, anvandare_id))
        conn.commit()
        return {"status": "ok"}
    finally:
        release_connection(conn)

@app.delete("/anvandare/{anvandare_id}")
def radera_konto(anvandare_id: int, _: int = Depends(krav_inloggad)):
    conn = get_connection()
    try:
        cursor = get_cursor(conn)
        cursor.execute("DELETE FROM kaloriloggar WHERE anvandar_id = %s", (anvandare_id,))
        cursor.execute("DELETE FROM anvandar_aktiviteter WHERE anvandar_id = %s", (anvandare_id,))
        cursor.execute("DELETE FROM anvandare_schema WHERE anvandar_id = %s", (anvandare_id,))
        cursor.execute("DELETE FROM anvandar_utmaningar WHERE anvandar_id = %s", (anvandare_id,))
        cursor.execute("DELETE FROM traning_ovningar WHERE pass_id IN (SELECT id FROM traning_pass WHERE anvandar_id = %s)", (anvandare_id,))
        cursor.execute("DELETE FROM traning_pass WHERE anvandar_id = %s", (anvandare_id,))
        cursor.execute("DELETE FROM anvandare WHERE id = %s", (anvandare_id,))
        conn.commit()
        return {"status": "konto raderat"}
    finally:
        release_connection(conn)

        
# ─────────────────────────────────────────────────────
# TRÄNINGSDAGBOK
# ─────────────────────────────────────────────────────

@app.post("/anvandare/{anvandare_id}/traning/pass")
def skapa_pass(anvandare_id: int, data: NyttPass, _: int = Depends(krav_inloggad)):
    conn = get_connection()
    try:
        cursor = get_cursor(conn)
        cursor.execute("""
            INSERT INTO traning_pass (anvandar_id, namn, datum)
            VALUES (%s, %s, CURRENT_DATE)
            RETURNING id, namn, datum
        """, (anvandare_id, data.namn))
        rad = cursor.fetchone()
        conn.commit()
        return {"id": rad["id"], "namn": rad["namn"], "datum": str(rad["datum"])}
    finally:
        release_connection(conn)


@app.get("/anvandare/{anvandare_id}/traning/pass")
def hamta_pass(anvandare_id: int, _: int = Depends(krav_inloggad)):
    conn = get_connection()
    try:
        cursor = get_cursor(conn)
        cursor.execute("""
            SELECT id, namn, datum FROM traning_pass
            WHERE anvandar_id = %s
            ORDER BY datum DESC, id DESC
        """, (anvandare_id,))
        pass_lista = cursor.fetchall()
        resultat = []
        for p in pass_lista:
            cursor.execute("""
                SELECT id, ovning, set_antal, reps, vikt_kg, vilotid_sek
                FROM traning_ovningar WHERE pass_id = %s
                ORDER BY id
            """, (p["id"],))
            ovningar = cursor.fetchall()
            resultat.append({
                "id": p["id"],
                "namn": p["namn"],
                "datum": str(p["datum"]),
                "ovningar": [
                    {
                        "id": o["id"],
                        "ovning": o["ovning"],
                        "set_antal": o["set_antal"],
                        "reps": o["reps"],
                        "vikt_kg": o["vikt_kg"],
                        "vilotid_sek": o["vilotid_sek"]
                    }
                    for o in ovningar
                ]
            })
        return resultat
    finally:
        release_connection(conn)


@app.post("/anvandare/{anvandare_id}/traning/ovning")
def logga_ovning(anvandare_id: int, data: NyOvning, _: int = Depends(krav_inloggad)):
    conn = get_connection()
    try:
        cursor = get_cursor(conn)
        cursor.execute("""
            INSERT INTO traning_ovningar (pass_id, ovning, set_antal, reps, vikt_kg, vilotid_sek)
            VALUES (%s, %s, %s, %s, %s, %s)
            RETURNING id
        """, (data.pass_id, data.ovning, data.set_antal, data.reps, data.vikt_kg, data.vilotid_sek))
        rad = cursor.fetchone()
        conn.commit()
        return {"id": rad["id"], "status": "ok"}
    finally:
        release_connection(conn)


@app.delete("/traning/ovning/{ovning_id}")
def ta_bort_ovning(ovning_id: int, _: int = Depends(krav_inloggad)):
    conn = get_connection()
    try:
        cursor = get_cursor(conn)
        cursor.execute("DELETE FROM traning_ovningar WHERE id = %s", (ovning_id,))
        conn.commit()
        return {"status": "ok"}
    finally:
        release_connection(conn)        