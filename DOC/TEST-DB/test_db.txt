import psycopg2

try:
    conn = psycopg2.connect(
        host="localhost",
        port="5432",
        user="postgres",
        password="postgres",
        database="nmsdb"
    )
    print("Connected successfully!")
    conn.close()
except Exception as e:
    print("Error:", e)
