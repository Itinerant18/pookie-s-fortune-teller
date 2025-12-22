from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import text
import logging

logger = logging.getLogger(__name__)

class Database:
    def __init__(self, url: str):
        # Ensure async driver is used
        if url.startswith("postgresql://"):
            url = url.replace("postgresql://", "postgresql+asyncpg://")
        self.url = url
        self.engine = None
        self.session_maker = None

    async def connect(self):
        try:
            self.engine = create_async_engine(self.url, echo=False)
            self.session_maker = sessionmaker(
                self.engine, class_=AsyncSession, expire_on_commit=False
            )
            # Verify connection
            async with self.engine.begin() as conn:
                await conn.execute(text("SELECT 1"))
            logger.info("Database connection established")
        except Exception as e:
            logger.error(f"Database connection failed: {e}")
            # Don't raise here to allow app to start even if DB is down (optional)
            # raise e

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
