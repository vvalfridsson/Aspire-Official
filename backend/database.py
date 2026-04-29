
#Importerar det som behövs och förbereder
import os

import psycopg2

import psycopg2.extras   # för UUID och dict-cursor

from dotenv import load_dotenv

 

# Läs in .env-filen 

load_dotenv()

 

#Anslutningssträng från miljövariabel

DATABASE_URL = os.getenv("DATABASE_URL")
 

def get_connection():

    """

    Returnerar en ny psycopg2-anslutning.

    Anrop get_connection() i varje endpoint som behöver databasen

    och stäng anslutningen när du är klar (eller använd with-sats).

    """

    conn = psycopg2.connect(DATABASE_URL)

    conn.autocommit = False

    return conn

 

 

def get_cursor(conn):

    """

    Returnerar en RealDictCursor så att rader returneras som

    Python-dictionaries { kolumn: värde } istället för tupler.

    """

    return conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

#Ansluter till filen om den är main och skriver ut det, skickar felmeddelande annars

if __name__ == "__main__":

    try:

        conn = get_connection()

        cur  = get_cursor(conn)

        cur.execute("SELECT version();")

        print(" Ansluten till PostgreSQL:", cur.fetchone()["version"])

        conn.close()

    except Exception as e:

        print(" Anslutningsfel:", e)
