"""
Database interface and utilities
"""

from typing import Optional, Dict, Any, List
import os
from sqlalchemy import create_engine, MetaData
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy_utils import JSONType, create_database, database_exists

from .models import Base, PromptSchemaDB, PromptResponseDB

metadata = MetaData()

async def create_tables(engine):
    """Create database tables"""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

class Database:
    """Database connection and operations wrapper"""
    
    def __init__(self, url: Optional[str] = None):
        """
        Initialize database connection
        
        Args:
            url: Database connection URL. If not provided, uses DATABASE_URL env var
        """
        self.url = url or os.getenv("DATABASE_URL", "sqlite:///./gemini_prompts.db")
        if self.url.startswith("sqlite"):
            self.url = self.url.replace("sqlite:", "sqlite+aiosqlite:")
        elif self.url.startswith("postgresql"):
            self.url = self.url.replace("postgresql:", "postgresql+asyncpg:")
        
        self.engine = create_async_engine(self.url, echo=True)
        self.async_session = sessionmaker(
            self.engine, 
            class_=AsyncSession, 
            expire_on_commit=False
        )

    async def connect(self):
        """Establish database connection"""
        if not database_exists(self.url):
            create_database(self.url)
        await create_tables(self.engine)

    async def disconnect(self):
        """Close database connection"""
        await self.engine.dispose()

    async def get_session(self) -> AsyncSession:
        """Get a database session"""
        return self.async_session()

    async def get_schema(self, prompt_type: str) -> Optional[PromptSchemaDB]:
        """Get a prompt schema by type"""
        async with self.async_session() as session:
            async with session.begin():
                result = await session.get(PromptSchemaDB, prompt_type)
                return result

    async def create_schema(self, schema: PromptSchemaDB) -> PromptSchemaDB:
        """Create a new prompt schema"""
        async with self.async_session() as session:
            async with session.begin():
                session.add(schema)
                await session.commit()
                await session.refresh(schema)
                return schema

    async def update_schema(self, schema: PromptSchemaDB) -> PromptSchemaDB:
        """Update an existing prompt schema"""
        async with self.async_session() as session:
            async with session.begin():
                result = await session.merge(schema)
                await session.commit()
                await session.refresh(result)
                return result

    async def delete_schema(self, prompt_type: str) -> bool:
        """Delete a prompt schema"""
        async with self.async_session() as session:
            async with session.begin():
                schema = await session.get(PromptSchemaDB, prompt_type)
                if schema:
                    await session.delete(schema)
                    await session.commit()
                    return True
                return False

    async def get_response(self, response_id: str) -> Optional[PromptResponseDB]:
        """Get prompt response by ID"""
        async with self.async_session() as session:
            async with session.begin():
                result = await session.get(PromptResponseDB, response_id)
                return result
            
    async def create_response(self, response: PromptResponseDB) -> PromptResponseDB:
        """Create new prompt response"""
        async with self.async_session() as session:
            async with session.begin():
                session.add(response)
                await session.commit()
                await session.refresh(response)
                return response
