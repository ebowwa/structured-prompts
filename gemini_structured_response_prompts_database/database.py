"""
Database interface and utilities
"""

from typing import Optional, Dict, Any, List
import os
from sqlalchemy import create_engine, MetaData
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.ext.asyncio import async_sessionmaker
from sqlalchemy_utils import JSONType, create_database, database_exists

from .models import Base, PromptSchemaDB, PromptResponseDB

metadata = MetaData()

def create_tables(engine):
    """Create database tables"""
    Base.metadata.create_all(engine)

class Database:
    """Database connection and operations wrapper"""
    
    def __init__(self, url: Optional[str] = None):
        """
        Initialize database connection
        
        Args:
            url: Database connection URL. If not provided, uses DATABASE_URL env var
        """
        self.url = url or os.getenv("DATABASE_URL", "sqlite:///./gemini_prompts.db")
        
        # Convert PostgreSQL URL to async format if needed
        if self.url.startswith('postgresql://'):
            self.url = self.url.replace('postgresql://', 'postgresql+asyncpg://')
            # Remove sslmode from URL if present
            self.url = self.url.split('?')[0]
            self.engine = create_async_engine(self.url)
            self.SessionLocal = async_sessionmaker(bind=self.engine, class_=AsyncSession)
        else:
            # For SQLite or other databases, use synchronous connection
            self.engine = create_engine(self.url)
            self.SessionLocal = sessionmaker(bind=self.engine)
        
        # Create database if it doesn't exist
        if not database_exists(self.url):
            create_database(self.url)
        
        Base.metadata.bind = self.engine
        
    async def connect(self):
        """Connect to database and create tables"""
        async with self.engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
    
    async def disconnect(self):
        """Disconnect from database"""
        await self.engine.dispose()
    
    def get_session(self) -> Session:
        """Get database session"""
        return self.SessionLocal()
    
    async def get_schema(self, prompt_type: str) -> Optional[PromptSchemaDB]:
        """Get prompt schema by type"""
        async with self.get_session() as session:
            result = await session.query(PromptSchemaDB).filter(PromptSchemaDB.prompt_type == prompt_type).first()
            return result
    
    async def create_schema(self, schema: PromptSchemaDB) -> PromptSchemaDB:
        """Create new prompt schema"""
        async with self.get_session() as session:
            session.add(schema)
            await session.commit()
            await session.refresh(schema)
            return schema
            
    async def update_schema(self, schema: PromptSchemaDB) -> PromptSchemaDB:
        """Update existing prompt schema"""
        async with self.get_session() as session:
            result = await session.merge(schema)
            await session.commit()
            return result
            
    async def delete_schema(self, prompt_type: str):
        """Delete prompt schema"""
        async with self.get_session() as session:
            schema = await session.query(PromptSchemaDB).filter(PromptSchemaDB.prompt_type == prompt_type).first()
            if schema:
                await session.delete(schema)
                await session.commit()
                
    async def get_response(self, response_id: str) -> Optional[PromptResponseDB]:
        """Get prompt response by ID"""
        async with self.get_session() as session:
            result = await session.query(PromptResponseDB).filter(PromptResponseDB.id == response_id).first()
            return result
            
    async def create_response(self, response: PromptResponseDB) -> PromptResponseDB:
        """Create new prompt response"""
        async with self.get_session() as session:
            session.add(response)
            await session.commit()
            await session.refresh(response)
            return response
