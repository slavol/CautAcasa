import psycopg2
import os

# Expected schema from Prisma (edit if you add/remove fields)
EXPECTED_COLUMNS = {
    "id": {"type": "integer", "nullable": False},
    "title": {"type": "text", "nullable": False},
    "price": {"type": "integer", "nullable": True},
    "description": {"type": "text", "nullable": True},
    "city": {"type": "text", "nullable": True},
    "image": {"type": "text", "nullable": True},
    "link": {"type": "text", "nullable": False},
    "source": {"type": "ListingSource", "nullable": False},
    "createdAt": {"type": "timestamp without time zone", "nullable": False},
    "updatedAt": {"type": "timestamp without time zone", "nullable": False},
    "convertedPrice": {"type": "double precision", "nullable": True},
    "currency": {"type": "text", "nullable": True},
    "transaction": {"type": "TransactionType", "nullable": False},
}

def get_connection():
    return psycopg2.connect(
        dbname=os.environ.get("POSTGRES_DB", "cautacasa"),
        user=os.environ.get("POSTGRES_USER", "slavoliu"),
        password=os.environ.get("POSTGRES_PASSWORD", ""),
        host=os.environ.get("POSTGRES_HOST", "localhost"),
        port=os.environ.get("POSTGRES_PORT", "5432")
    )

def fetch_enum_types(cur):
    cur.execute("""
        SELECT t.typname AS enum_name
        FROM pg_type t
        JOIN pg_enum e ON t.oid = e.enumtypid
        GROUP BY t.typname;
    """)
    return {row[0] for row in cur.fetchall()}

def fetch_table_columns(cur):
    cur.execute("""
        SELECT column_name, data_type, is_nullable, udt_name
        FROM information_schema.columns
        WHERE table_name='Listing'
        ORDER BY ordinal_position;
    """)
    return cur.fetchall()

def main():
    conn = get_connection()
    cur = conn.cursor()

    print("=== CHECKING LISTING SCHEMA ===\n")

    enum_types = fetch_enum_types(cur)
    columns = fetch_table_columns(cur)

    for name, datatype, nullable, udt_name in columns:
        pg_type = udt_name if udt_name in enum_types else datatype
        is_nullable = (nullable == "YES")

        expected = EXPECTED_COLUMNS.get(name)

        print(f"Column: {name} | type={pg_type} | nullable={is_nullable}")

        if not expected:
            print(f" ⚠ EXTRA COLUMN in DB: {name}\n")
            continue

        # Compare column type
        if expected["type"] != pg_type:
            print(f" ❌ TYPE MISMATCH: expected {expected['type']} but got {pg_type}")

        # Compare nullability
        if expected["nullable"] != is_nullable:
            print(f" ❌ NULLABILITY MISMATCH: expected nullable={expected['nullable']}")

        print()

    print("=== CHECK DONE ===")

    conn.close()


if __name__ == "__main__":
    main()