from flask import Flask, request, jsonify, send_from_directory
import psycopg2
from psycopg2.extras import RealDictCursor
import os

app = Flask(__name__, static_folder='.')


DB_CONFIG = {
    "host": "postgres.mau.se",      
    "database": "",
    "user": "",
    "password":"",
    "port": "55432"                  
}

def get_db_connection():
    return psycopg2.connect(**DB_CONFIG)

# Serverar HTML-filer
@app.route('/')
def index():
    return send_from_directory('.', 'index.html')

@app.route('/<path:path>')
def serve_file(path):
    return send_from_directory('.', path)

# API för att spara träning
@app.route('/api/save-workout', methods=['POST'])
def save_workout():
    data = request.json
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        
        # Denna SQL-fråga skickar data till din Postgres-databas
        cur.execute(
            "INSERT INTO workout_logs (exercise_name, sets, reps, weight) VALUES (%s, %s, %s, %s)",
            (data['exercise_name'], data['sets'], data['reps'], data['weight'])
        )
        
        conn.commit()
        cur.close()
        conn.close()
        return jsonify({"status": "success", "message": "Sparat i Postgres!"}), 201
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

if __name__ == "__main__":
    print("🚀 ASPIRE SERVER STARTAD PÅ http://localhost:8000")
    app.run(host='0.0.0.0', port=8000, debug=True)
