import sqlite3
import json

db_path = "data/spam_database.db"

def initialise():
    global db_path
    try:
        with sqlite3.connect(db_path) as conn:
            cursor = conn.cursor()
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS results (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    content TEXT NOT NULL,
                    saved_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    spam_chance INT NOT NULL
                )
            """)
            conn.commit()
        return True
    except sqlite3.Error as e:
        print(f"SQLite error on initialise: {e}")
        return False

def check_health():
    global db_path
    try:
        with sqlite3.connect(db_path) as conn:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT name FROM sqlite_master
                WHERE type='table' AND name=?;
            """, ("results",))
            return cursor.fetchone() is not None
    except sqlite3.Error as e:
        print(f"SQLite error on check_health: {e}")
        return False


def insert_result(data: dict, spam_chance: int):
    try:
        with sqlite3.connect(db_path) as conn:
            cursor = conn.cursor()
            cursor.execute(
                "INSERT INTO results (content, spam_chance) VALUES (?, ?)",
                (json.dumps(data), spam_chance)
            )
            conn.commit()
        return True
    except sqlite3.Error as e:
        print(f"SQLite error on insert_result: {e}")
        return False

def get_page(page_number):
    global db_path
    offset = page_number * 10
    try:
        with sqlite3.connect(db_path) as conn:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT id, saved_at, spam_chance FROM results
                ORDER BY id DESC LIMIT 10 OFFSET ?
            """, (offset,))
            rows = cursor.fetchall()
            results = [{"id": r[0], "saved_at": r[1], "spam_chance": r[2]} for r in rows]
            return results
    except sqlite3.Error as e:
        print(f"SQLite error on get_page: {e}")
        return "sql_error"

def get_result(result_id):
    global db_path
    try:
        with sqlite3.connect(db_path) as conn:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT content FROM results WHERE id = ? LIMIT 1
            """, (result_id,))
            row = cursor.fetchone()
            if not row:
                return "No result for this Id"
            return json.loads(row[0])
    except sqlite3.Error as e:
        print(f"SQLite error on get_result: {e}")
        return "sql_error"