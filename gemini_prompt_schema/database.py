"""
Database interface and utilities
"""

from typing import Optional, Union
from databases import Database as AsyncDatabase
from sqlalchemy import (
    MetaData,
    Table,
    Column,
    String,
    Integer,
    Text,
    create_engine
)

metadata = MetaData()

prompt_schema_table = Table(
    "prompt_schemas",
    metadata,
    Column("prompt_type", String, primary_key=True),
    Column("prompt_text", Text, nullable=False),
    Column("response_schema", Text, nullable=False),
    Column("created_at", Integer, nullable=False),
    Column("updated_at", Integer, nullable=False)
)

class Database:
    """Database connection and operations wrapper"""
    
    def __init__(self, url: str):
        """
        Initialize database connection
        
        Args:
            url: Database connection URL
        """
        self.url = url
        self.engine = create_engine(url)
        self.database = AsyncDatabase(url)
        
    async def connect(self):
        """Connect to database"""
        await self.database.connect()
        
    async def disconnect(self):
        """Disconnect from database"""
        await self.database.disconnect()
        
    async def create_tables(self):
        """Create database tables"""
        metadata.create_all(self.engine)
        
    async def fetch_one(self, query):
        """Execute query and fetch one result"""
        return await self.database.fetch_one(query)
        
    async def fetch_all(self, query):
        """Execute query and fetch all results"""
        return await self.database.fetch_all(query)
        
    async def execute(self, query):
        """Execute query"""
        return await self.database.execute(query)
