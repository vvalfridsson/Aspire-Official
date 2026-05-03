"""
Aspire — database.py
Hanterar databasanslutning och användarfunktioner mot PostgreSQL.
"""

import os
import psycopg2
import psycopg2.extras
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")


def get_connection():
    """
    Returnerar en ny databasanslutning.

    Returnerar:
        conn: En psycopg2-anslutning till PostgreSQL.
    """
    conn = psycopg2.connect(DATABASE_URL)
    conn.autocommit = False
    return conn


def get_cursor(conn):
    """
    Returnerar en cursor som ger rader som dictionaries.

    Parametrar:
        conn: En aktiv psycopg2-anslutning.

    Returnerar:
        cursor: En RealDictCursor.
    """
    return conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)


def skapa_anvandartabell(conn):
    """
    Skapar användartabellen om den inte redan finns.

    Parametrar:
        conn: En aktiv psycopg2-anslutning.
    """
    cursor = get_cursor(conn)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS anvandare (
            id        SERIAL PRIMARY KEY,
            namn      TEXT NOT NULL,
            epost     TEXT UNIQUE NOT NULL,
            losenord  TEXT NOT NULL
        );
    """)
    conn.commit()


def registrera_anvandare(namn, epost, losenord):
    """
    Skapar ett nytt användarkonto i databasen.

    Parametrar:
        namn (str):     Användarens namn.
        epost (str):    Användarens e-postadress.
        losenord (str): Användarens lösenord.

    Returnerar:
        dict: Den skapade användaren, eller None vid fel.
    """
    try:
        conn = get_connection()
        cursor = get_cursor(conn)
        cursor.execute(
            "INSERT INTO anvandare (namn, epost, losenord) VALUES (%s, %s, %s) RETURNING id, namn, epost;",
            (namn, epost, losenord)
        )
        anvandare = cursor.fetchone()
        conn.commit()
        conn.close()
        return anvandare
    except psycopg2.errors.UniqueViolation:
        conn.rollback()
        conn.close()
        return None


def hamta_anvandare(epost):
    """
    Hämtar en användare baserat på e-post.

    Parametrar:
        epost (str): E-postadressen att söka på.

    Returnerar:
        dict: Användaren, eller None om den inte finns.
    """
    try:
        conn = get_connection()
        cursor = get_cursor(conn)
        cursor.execute(
            "SELECT id, namn, epost, losenord FROM anvandare WHERE epost = %s;",
            (epost,)
        )
        anvandare = cursor.fetchone()
        conn.close()
        return anvandare
    except Exception:
        return None


if __name__ == "__main__":
    try:
        conn = get_connection()
        skapa_anvandartabell(conn)
        print("Ansluten till PostgreSQL och tabell klar.")
        conn.close()
    except Exception as e:
        print("Anslutningsfel:", e)
