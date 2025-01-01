"""
Database interface and utilities
"""

from typing import Optional, Dict, Any, List
import os
from databases import Database as AsyncDatabase
from sqlalchemy import create_engine, MetaData
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
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
        self.engine = create_engine(self.url)
        self.database = AsyncDatabase(self.url)
        self.SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=self.engine)
        
        # Create database if it doesn't exist
        if not database_exists(self.url):
            create_database(self.url)
        
    async def connect(self):
        """Connect to database and create tables"""
        await self.database.connect()
        create_tables(self.engine)
    
    async def disconnect(self):
        """Disconnect from database"""
        await self.database.disconnect()
    
    def get_session(self) -> Session:
        """Get database session"""
        return self.SessionLocal()
    
    async def get_schema(self, prompt_type: str) -> Optional[PromptSchemaDB]:
        """Get prompt schema by type"""
        async with self.database.transaction():
            query = """
                SELECT * FROM prompt_schemas 
                WHERE prompt_id = :prompt_type
            """
            result = await self.database.fetch_one(
                query=query, 
                values={"prompt_type": prompt_type}
            )
            if result:
                return PromptSchemaDB(**dict(result))
            return None
    
    async def create_schema(self, schema: PromptSchemaDB) -> bool:
        """Create new prompt schema"""
        async with self.database.transaction():
            query = """
                INSERT INTO prompt_schemas (
                    prompt_id, prompt_title, prompt_description, prompt_categories,
                    main_prompt, model_instruction, additional_messages, response_schema,
                    is_public, ranking, last_used, usage_count, created_at,
                    created_by, last_updated, last_updated_by, provider_configs
                ) VALUES (
                    :prompt_id, :prompt_title, :prompt_description, :prompt_categories,
                    :main_prompt, :model_instruction, :additional_messages, :response_schema,
                    :is_public, :ranking, :last_used, :usage_count, :created_at,
                    :created_by, :last_updated, :last_updated_by, :provider_configs
                )
            """
            await self.database.execute(
                query=query,
                values=schema.__dict__
            )
            return True
    
    async def update_schema(self, schema: PromptSchemaDB) -> bool:
        """Update existing prompt schema"""
        async with self.database.transaction():
            query = """
                UPDATE prompt_schemas 
                SET 
                    prompt_title = :prompt_title,
                    prompt_description = :prompt_description,
                    prompt_categories = :prompt_categories,
                    main_prompt = :main_prompt,
                    model_instruction = :model_instruction,
                    additional_messages = :additional_messages,
                    response_schema = :response_schema,
                    is_public = :is_public,
                    ranking = :ranking,
                    last_used = :last_used,
                    usage_count = :usage_count,
                    last_updated = :last_updated,
                    last_updated_by = :last_updated_by,
                    provider_configs = :provider_configs
                WHERE prompt_id = :prompt_id
            """
            result = await self.database.execute(
                query=query,
                values=schema.__dict__
            )
            return result > 0
    
    async def delete_schema(self, prompt_type: str) -> bool:
        """Delete prompt schema"""
        async with self.database.transaction():
            query = """
                DELETE FROM prompt_schemas 
                WHERE prompt_id = :prompt_type
            """
            result = await self.database.execute(
                query=query,
                values={"prompt_type": prompt_type}
            )
            return result > 0
    
    async def get_response(self, response_id: str) -> Optional[PromptResponseDB]:
        """Get prompt response by ID"""
        async with self.database.transaction():
            query = """
                SELECT * FROM prompt_responses 
                WHERE response_id = :response_id
            """
            result = await self.database.fetch_one(
                query=query,
                values={"response_id": response_id}
            )
            if result:
                return PromptResponseDB(**dict(result))
            return None
            
    async def create_response(self, response: PromptResponseDB) -> bool:
        """Create new prompt response"""
        async with self.database.transaction():
            query = """
                INSERT INTO prompt_responses (
                    response_id, prompt_id, raw_response, created_at
                ) VALUES (
                    :response_id, :prompt_id, :raw_response, :created_at
                )
            """
            await self.database.execute(
                query=query,
                values=response.__dict__
            )
            return True
