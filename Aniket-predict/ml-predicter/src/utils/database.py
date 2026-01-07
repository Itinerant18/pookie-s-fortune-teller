from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import text
from sqlalchemy.pool import NullPool
import logging
import urllib.parse

logger = logging.getLogger(__name__)

class Database:
    def __init__(self, url: str):
        # Ensure async driver is used
        if url.startswith("postgresql://"):
            url = url.replace("postgresql://", "postgresql+asyncpg://")
        
        # Handle URL-encoded passwords properly
        # Parse and reconstruct URL to ensure proper encoding
        try:
            # Decode any double-encoded characters
            url = urllib.parse.unquote(url)
        except Exception:
            pass
            
        self.url = url
        self.engine = None
        self.session_maker = None
        self.connected = False

    async def connect(self):
        try:
            # Create engine with connection pool settings
            self.engine = create_async_engine(
                self.url, 
                echo=False,
                poolclass=NullPool,  # Use NullPool for serverless/Lambda compatibility
                connect_args={
                    "timeout": 30,
                    "command_timeout": 30,
                }
            )
            self.session_maker = sessionmaker(
                self.engine, class_=AsyncSession, expire_on_commit=False
            )
            # Verify connection
            async with self.engine.begin() as conn:
                await conn.execute(text("SELECT 1"))
            self.connected = True
            logger.info("Database connection established")
        except Exception as e:
            logger.warning(f"Database connection failed: {e} - some features may be limited")
            self.connected = False
            # Don't raise - allow app to start even if DB is down

    async def disconnect(self):
        if self.engine:
            await self.engine.dispose()
            logger.info("Database disconnected")

    async def health_check(self):
        if not self.engine:
            return "disconnected"
        try:
            async with self.engine.begin() as conn:
                await conn.execute(text("SELECT 1"))
            return "connected"
        except Exception:
            return "error"
