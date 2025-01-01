"""
Core schema management functionality for Gemini prompts
"""

import json
import logging
from datetime import datetime
from typing import Dict, Optional, Union

from fastapi import HTTPException
from pydantic import BaseModel, ValidationError
from sqlalchemy import Table

from .models import PromptSchema, PromptResponse, PromptSchemaBase, PromptResponseBase
from .database import Database

logger = logging.getLogger(__name__)

class SchemaManager:
    """Manages prompt schemas and their configurations"""
    
    def __init__(self, database: Database):
        """Initialize with database connection"""
        self.db = database

    async def create_schema(self, schema_data: PromptSchemaBase) -> PromptSchema:
        """Create a new prompt schema"""
        try:
            db_schema = PromptSchema(
                prompt_id=schema_data.prompt_id,
                raw_schema=schema_data.raw_schema,
                created_at=schema_data.created_at
            )
            async with self.db.session() as session:
                session.add(db_schema)
                await session.commit()
                await session.refresh(db_schema)
            return db_schema
        except Exception as e:
            logger.error(f"Error creating schema: {e}")
            raise HTTPException(status_code=500, detail=str(e))

    async def get_schema(self, prompt_id: str) -> Optional[PromptSchema]:
        """Retrieve a prompt schema by ID"""
        try:
            async with self.db.session() as session:
                result = await session.get(PromptSchema, prompt_id)
                return result
        except Exception as e:
            logger.error(f"Error retrieving schema: {e}")
            raise HTTPException(status_code=500, detail=str(e))

    async def create_response(self, response_data: PromptResponseBase) -> PromptResponse:
        """Create a new prompt response"""
        try:
            db_response = PromptResponse(
                response_id=response_data.response_id,
                prompt_id=response_data.prompt_id,
                raw_response=response_data.raw_response,
                created_at=response_data.created_at
            )
            async with self.db.session() as session:
                session.add(db_response)
                await session.commit()
                await session.refresh(db_response)
            return db_response
        except Exception as e:
            logger.error(f"Error creating response: {e}")
            raise HTTPException(status_code=500, detail=str(e))

    async def get_response(self, response_id: str) -> Optional[PromptResponse]:
        """Retrieve a prompt response by ID"""
        try:
            async with self.db.session() as session:
                result = await session.get(PromptResponse, response_id)
                return result
        except Exception as e:
            logger.error(f"Error retrieving response: {e}")
            raise HTTPException(status_code=500, detail=str(e))
