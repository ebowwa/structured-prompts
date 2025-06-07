"""
Database interface and utilities
"""

import os
import re
from typing import Any, Dict, List, Optional
from urllib.parse import parse_qs, urlparse

from sqlalchemy import MetaData, create_engine, text
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy_utils import JSONType, create_database, database_exists

from .models import Base, PromptResponseDB, PromptSchemaDB

metadata = MetaData()


async def create_tables(engine):
    """Create database tables"""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


class Database:
    """Database connection and operations wrapper"""

    def __init__(self, url: Optional[str] = None):
        """Initialize database connection"""
        self.url = url or os.getenv("DATABASE_URL", "sqlite:///./gemini_prompts.db")

        # Clean and transform the URL
        if self.url.startswith("sqlite"):
            self.url = self.url.replace("sqlite:", "sqlite+aiosqlite:")
        elif self.url.startswith("postgresql"):
            # Parse the URL
            parsed = urlparse(self.url)
            query_params = parse_qs(parsed.query)

            # Remove sslmode from query parameters
            if "sslmode" in query_params:
                del query_params["sslmode"]

            # Reconstruct the URL without sslmode
            netloc = parsed.netloc
            if "@" not in netloc and ":" in netloc:
                # Add username if not present
                netloc = f"postgres@{netloc}"

            # Build the new URL
            self.url = f"postgresql+asyncpg://{netloc}{parsed.path}"

            # Add back any remaining query parameters
            if query_params:
                query_string = "&".join(f"{k}={v[0]}" for k, v in query_params.items())
                self.url = f"{self.url}?{query_string}"

        self.engine = create_async_engine(self.url, echo=True)
        self.async_session = sessionmaker(
            bind=self.engine, class_=AsyncSession, expire_on_commit=False
        )

    async def connect(self):
        """Establish database connection"""
        try:
            # For async engines, we need to use run_sync to check database existence
            async with self.engine.begin() as conn:
                # Try to execute a simple query to check connection
                await conn.execute(text("SELECT 1"))
        except Exception as e:
            # If database doesn't exist, create it
            if "does not exist" in str(e).lower():
                # Create database using psycopg2 for PostgreSQL
                if self.url.startswith("postgresql"):
                    parsed = urlparse(self.url)
                    db_name = parsed.path[1:]  # Remove leading '/'
                    temp_url = f"{parsed.scheme}://{parsed.netloc}/postgres"
                    engine = create_engine(temp_url)
                    with engine.connect() as conn:
                        conn.execute("commit")
                        conn.execute(f"CREATE DATABASE {db_name}")
                else:
                    create_database(self.url)
            else:
                raise e

        await create_tables(self.engine)

    async def disconnect(self):
        """Close database connection"""
        await self.engine.dispose()

    async def get_schema(self, prompt_id: str) -> Optional[PromptSchemaDB]:
        """Get a prompt schema by ID"""
        async with self.async_session() as session:
            result = await session.get(PromptSchemaDB, prompt_id)
            return result

    async def create_schema(self, schema: PromptSchemaDB) -> PromptSchemaDB:
        """Create a new prompt schema"""
        async with self.async_session() as session:
            session.add(schema)
            await session.commit()
            await session.refresh(schema)
            return schema

    async def update_schema(self, schema: PromptSchemaDB) -> PromptSchemaDB:
        """Update an existing prompt schema"""
        async with self.async_session() as session:
            result = await session.merge(schema)
            await session.commit()
            await session.refresh(result)
            return result

    async def delete_schema(self, prompt_id: str) -> bool:
        """Delete a prompt schema"""
        async with self.async_session() as session:
            schema = await session.get(PromptSchemaDB, prompt_id)
            if schema:
                await session.delete(schema)
                await session.commit()
                return True
            return False

    async def get_response(self, response_id: str) -> Optional[PromptResponseDB]:
        """Get prompt response by ID"""
        async with self.async_session() as session:
            result = await session.get(PromptResponseDB, response_id)
            return result

    async def create_response(self, response: PromptResponseDB) -> PromptResponseDB:
        """Create new prompt response"""
        async with self.async_session() as session:
            session.add(response)
            await session.commit()
            await session.refresh(response)
            return response
