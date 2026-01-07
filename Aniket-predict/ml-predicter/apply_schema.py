import asyncio
import os
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
from dotenv import load_dotenv

load_dotenv()

# Get DB URL and ensure async driver
DATABASE_URL = os.getenv("DATABASE_URL")
if DATABASE_URL and DATABASE_URL.startswith("postgresql://"):
    DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://")

async def run_migration():
    if not DATABASE_URL:
        print("Error: DATABASE_URL not found in environment variables.")
        return

    print(f"Connecting to database...")
    # Add connect_args to handle SSL and timeouts if needed
    engine = create_async_engine(
        DATABASE_URL, 
        echo=True,
        connect_args={"ssl": "require", "timeout": 30}
    )
    
    try:
        # Read schema file
        with open('../supabase/schema.sql', 'r') as f:
            schema_sql = f.read()
        
        # Split into statements (basic split by semicolon, considering potential issues with functions/triggers)
        # For simplicity in this script, we'll try to execute blocks or the whole thing if possible.
        # sqlalchemy execute might handle multiple statements if supported by driver, but often better to split.
        # schema.sql contains standard SQL.
        
        async with engine.begin() as conn:
            print("Executing schema migration...")
            await conn.execute(text(schema_sql))
            print("Migration completed successfully!")
            
    except Exception as e:
        print(f"Migration failed: {e}")
    finally:
        await engine.dispose()

if __name__ == "__main__":
    asyncio.run(run_migration())
