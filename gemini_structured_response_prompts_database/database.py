"""
Database interface and utilities
"""

from typing import Optional, Dict, Any
import os
from databases import Database as AsyncDatabase
from sqlalchemy import create_engine, MetaData
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy_utils import JSONType, create_database, database_exists

from .models import PromptSchema, PromptResponse

metadata = MetaData()
Base = declarative_base(metadata=metadata)

def create_tables_from_models(engine):
    """Generate SQLAlchemy tables from Pydantic models"""
    from sqlalchemy.orm import registry

    mapper_registry = registry()
    
    # Create tables
    metadata.create_all(engine)
    
    # Map Pydantic models to SQLAlchemy tables
    mapper_registry.map_imperatively(PromptSchema, metadata.tables['prompt_schemas'])
    mapper_registry.map_imperatively(PromptResponse, metadata.tables['prompt_responses'])

class Database:
    """Database connection and operations wrapper"""
    
    def __init__(self, url: Optional[str] = None):
        """
        Initialize database connection
        
        Args:
            url: Database connection URL. If not provided, uses DATABASE_URL env var
        """
        self.url = url or os.getenv("DATABASE_URL", "sqlite:///./gemini_prompts.db")
        self.engine = create_engine(self.url)
        self.database = AsyncDatabase(self.url)
        
        # Create database if it doesn't exist
        if not database_exists(self.url):
            create_database(self.url)
        
    async def connect(self):
        """Connect to database"""
        await self.database.connect()
        create_tables_from_models(self.engine)
        
    async def disconnect(self):
        """Disconnect from database"""
        await self.database.disconnect()
        
    async def execute(self, query, values=None):
        """Execute a query"""
        return await self.database.execute(query, values)
        
    async def fetch_one(self, query, values=None):
        """Fetch one result"""
        return await self.database.fetch_one(query, values)
        
    async def fetch_all(self, query, values=None):
        """Fetch all results"""
        return await self.database.fetch_all(query, values)
