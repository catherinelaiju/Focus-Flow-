from flask import Flask, request, jsonify
import sqlite3

app = Flask(__name__)
DB_FILE = "tasks.db"

# Function to connect to the database
def get_db_connection():
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    return conn

# Initialize database
def init_db():
    with get_db_connection() as conn:
        conn.execute('''
            CREATE TABLE IF NOT EXISTS tasks (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                task_text TEXT NOT NULL,
                completed BOOLEAN NOT NULL DEFAULT 0
            )
        ''')
        conn.commit()

# Fetch all tasks
@app.route("/tasks", methods=["GET"])
def get_tasks():
    conn = get_db_connection()
    tasks = conn.execute("SELECT * FROM tasks").fetchall()
    conn.close()
    return jsonify([dict(task) for task in tasks])

# Add a new task
@app.route("/tasks", methods=["POST"])
def add_task():
    data = request.json
    task_text = data.get("task_text", "").strip()
    
    if not task_text:
        return jsonify({"error": "Task cannot be empty"}), 400
    
    conn = get_db_connection()
    conn.execute("INSERT INTO tasks (task_text) VALUES (?)", (task_text,))
    conn.commit()
    conn.close()
    
    return jsonify({"message": "Task added successfully"}), 201

# Mark task as completed
@app.route("/tasks/<int:task_id>/complete", methods=["PUT"])
def complete_task(task_id):
    conn = get_db_connection()
    conn.execute("UPDATE tasks SET completed = 1 WHERE id = ?", (task_id,))
    conn.commit()
    conn.close()
    return jsonify({"message": "Task marked as completed"})

# Delete a task
@app.route("/tasks/<int:task_id>", methods=["DELETE"])
def delete_task(task_id):
    conn = get_db_connection()
    conn.execute("DELETE FROM tasks WHERE id = ?", (task_id,))
    conn.commit()
    conn.close()
    return jsonify({"message": "Task deleted successfully"})

# Run the Flask app
if __name__ == "__main__":
    init_db()
    app.run(debug=True)
