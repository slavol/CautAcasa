import psycopg2
import os

def get_db():
    return psycopg2.connect(
        dbname=os.getenv("POSTGRES_DB", "cautacasa"),
        user=os.getenv("POSTGRES_USER", "slavoliu"),
        password=os.getenv("POSTGRES_PASSWORD", ""),
        host=os.getenv("POSTGRES_HOST", "localhost"),
        port=os.getenv("POSTGRES_PORT", "5432"),
    )