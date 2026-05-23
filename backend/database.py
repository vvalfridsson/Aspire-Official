"""
Aspire — database.py
Hanterar databasanslutning och användarfunktioner mot PostgreSQL.
"""
import bcrypt
import os
import psycopg2
import psycopg2.extras
import psycopg2.pool
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
_pool = psycopg2.pool.SimpleConnectionPool(1, 10, DATABASE_URL)


def get_connection():
    conn = _pool.getconn()
    conn.autocommit = False
    return conn


def release_connection(conn):
    _pool.putconn(conn)


def get_cursor(conn):
    return conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)


def skapa_anvandartabell(conn):
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
    conn = get_connection()
    hashat_losenord = bcrypt.hashpw(
    losenord.encode('utf-8'),
    bcrypt.gensalt()
    ).decode('utf-8')
    try:
        cursor = get_cursor(conn)
        cursor.execute(
            "INSERT INTO anvandare (namn, epost, losenord) VALUES (%s, %s, %s) RETURNING id, namn, epost;",
            (namn, epost, hashat_losenord)
        )
        anvandare = cursor.fetchone()
        conn.commit()
        return anvandare
    except psycopg2.errors.UniqueViolation:
        conn.rollback()
        return None
    finally:
        release_connection(conn)


def hamta_anvandare(epost):
    conn = get_connection()
    try:
        cursor = get_cursor(conn)
        cursor.execute(
            "SELECT id, namn, epost, losenord FROM anvandare WHERE epost = %s;",
            (epost,)
        )
        return cursor.fetchone()
    except Exception:
        return None
    finally:
        release_connection(conn)


if __name__ == "__main__":
    try:
        conn = get_connection()
        skapa_anvandartabell(conn)
        print("Ansluten till PostgreSQL och tabell klar.")
        release_connection(conn)
    except Exception as e:
        print("Anslutningsfel:", e)