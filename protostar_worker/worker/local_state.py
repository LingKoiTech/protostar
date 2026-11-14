import sqlite3
import os
from datetime import datetime, timezone

DB_PATH = os.path.join(os.path.dirname(__file__), "local_state.db")


def _connect() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH)
    conn.execute("""
        CREATE TABLE IF NOT EXISTS local_runs (
            task_ref TEXT NOT NULL,
            run_id TEXT NOT NULL PRIMARY KEY,
            status TEXT NOT NULL,
            output_uploaded INTEGER NOT NULL DEFAULT 0,
            updated_at TEXT NOT NULL
        )
    """)
    conn.commit()
    return conn


def mark_claimed(task_ref: str, run_id: str) -> None:
    now = datetime.now(timezone.utc).isoformat()
    with _connect() as conn:
        conn.execute(
            "INSERT OR REPLACE INTO local_runs (task_ref, run_id, status, output_uploaded, updated_at) VALUES (?, ?, 'running', 0, ?)",
            (task_ref, run_id, now),
        )


def mark_uploaded(run_id: str) -> None:
    now = datetime.now(timezone.utc).isoformat()
    with _connect() as conn:
        conn.execute(
            "UPDATE local_runs SET output_uploaded=1, status='done', updated_at=? WHERE run_id=?",
            (now, run_id),
        )


def load_pending() -> list:
    with _connect() as conn:
        rows = conn.execute(
            "SELECT task_ref, run_id FROM local_runs WHERE output_uploaded=0"
        ).fetchall()
    return [{"task_ref": r[0], "run_id": r[1]} for r in rows]
