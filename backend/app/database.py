# backend/app/database.py

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker, declarative_base
from .config import DATABASE_URL

# Async SQLAlchemy engine
engine = create_async_engine(DATABASE_URL, echo=False)

# Async session
async_session = sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)

# Base class for models
Base = declarative_base()

# Function to create all tables
async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
