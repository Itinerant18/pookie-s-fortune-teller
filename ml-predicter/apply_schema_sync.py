import os
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

load_dotenv()

# Get DB URL
DATABASE_URL = os.getenv("DATABASE_URL")
# Ensure using psycopg2 (sync)
if DATABASE_URL and DATABASE_URL.startswith("postgresql+asyncpg://"):
    DATABASE_URL = DATABASE_URL.replace("postgresql+asyncpg://", "postgresql://")

def run_migration():
    if not DATABASE_URL:
        print("Error: DATABASE_URL not found in environment variables.")
        return

    print(f"Connecting to database (sync)...")
    try:
        # Use sslmode='require' for Supabase
        engine = create_engine(DATABASE_URL, echo=True, connect_args={'sslmode': 'require'})
        
        with open('../supabase/schema.sql', 'r') as f:
            schema_sql = f.read()
            
        with engine.begin() as conn:
            print("Executing schema migration...")
            # Split schema into statements if needed, but 'execute' usually handles blocks
            # Supabase schema has many statements. 
            # We will try executing it as one block. If it fails, we might need to split.
            conn.execute(text(schema_sql))
            print("Migration completed successfully!")
            
    except Exception as e:
        print(f"Migration failed: {e}")
    finally:
        if 'engine' in locals():
            engine.dispose()

if __name__ == "__main__":
    run_migration()
