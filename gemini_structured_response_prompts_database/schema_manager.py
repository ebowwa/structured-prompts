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

from .models import PromptSchema, PromptResponse, PromptSchemaDB, PromptResponseDB
from .database import Database

logger = logging.getLogger(__name__)

class SchemaManager:
    """Manages prompt schemas and their configurations"""
    
    DEFAULT_PROMPT_TYPE = "example_prompt"
    DEFAULT_PROMPT_TEXT = (
        "This is an example prompt. The response schema should be defined "
        "based on your specific use case and the expected structure of the response."
    )
    DEFAULT_RESPONSE_SCHEMA = {
        "type": "object",
        "description": "Dynamic response schema - define based on your needs",
        "additionalProperties": True  # Allows any additional properties
    }
    
    def __init__(
        self,
        database: Optional[Database] = None,
        table: Optional[Table] = None,
        default_prompt_type: Optional[str] = None,
        default_prompt_text: Optional[str] = None,
        default_response_schema: Optional[Dict] = None
    ):
        """
        Initialize SchemaManager with optional custom database and defaults
        
        Args:
            database: Optional custom database instance
            table: Optional custom table for storing schemas
            default_prompt_type: Optional custom default prompt type
            default_prompt_text: Optional custom default prompt text
            default_response_schema: Optional custom default response schema
        """
        self.database = database
        self.table = table
        self.default_prompt_type = default_prompt_type or self.DEFAULT_PROMPT_TYPE
        self.default_prompt_text = default_prompt_text or self.DEFAULT_PROMPT_TEXT
        self.default_response_schema = default_response_schema or self.DEFAULT_RESPONSE_SCHEMA
    
    def _db_to_pydantic(self, db_model: Union[PromptSchemaDB, PromptResponseDB]) -> Union[PromptSchema, PromptResponse]:
        """Convert SQLAlchemy model to Pydantic model"""
        if isinstance(db_model, PromptSchemaDB):
            return PromptSchema.model_validate(db_model)
        elif isinstance(db_model, PromptResponseDB):
            return PromptResponse.model_validate(db_model)
        raise ValueError(f"Unknown model type: {type(db_model)}")

    def _pydantic_to_db(self, pydantic_model: Union[PromptSchema, PromptResponse]) -> Union[PromptSchemaDB, PromptResponseDB]:
        """Convert Pydantic model to SQLAlchemy model"""
        data = pydantic_model.model_dump()
        if isinstance(pydantic_model, PromptSchema):
            return PromptSchemaDB(**data)
        elif isinstance(pydantic_model, PromptResponse):
            return PromptResponseDB(**data)
        raise ValueError(f"Unknown model type: {type(pydantic_model)}")

    async def get_prompt_schema(self, prompt_type: str) -> PromptSchema:
        """
        Get a prompt schema by type
        
        Args:
            prompt_type: Type identifier for the prompt schema
            
        Returns:
            PromptSchema: The prompt schema configuration
            
        Raises:
            HTTPException: If schema not found
        """
        try:
            if not self.database:
                raise ValueError("Database not initialized")
                
            db_schema = await self.database.get_schema(prompt_type)
            if not db_schema:
                raise ValueError(f"Schema not found for type: {prompt_type}")
                
            return self._db_to_pydantic(db_schema)
            
        except Exception as e:
            logger.error(f"Error getting prompt schema: {str(e)}")
            raise HTTPException(
                status_code=404,
                detail=f"Schema not found for type: {prompt_type}"
            )

    async def create_prompt_schema(
        self,
        prompt_type: str,
        prompt_text: str,
        response_schema: Dict,
        **kwargs
    ) -> PromptSchema:
        """
        Create a new prompt schema
        
        Args:
            prompt_type: Type identifier for the prompt
            prompt_text: The prompt text/template
            response_schema: JSON schema for validating responses
            **kwargs: Additional schema configuration options
            
        Returns:
            PromptSchema: The created schema configuration
            
        Raises:
            HTTPException: If schema creation fails
        """
        try:
            schema_data = {
                "prompt_id": prompt_type,  # Using prompt_type as ID
                "prompt_title": prompt_type,
                "main_prompt": prompt_text,
                "response_schema": response_schema,
                **kwargs
            }
            
            # Create Pydantic model first for validation
            pydantic_schema = PromptSchema(**schema_data)
            
            # Convert to DB model
            db_schema = self._pydantic_to_db(pydantic_schema)
            
            if not self.database:
                raise ValueError("Database not initialized")
                
            # Save to database
            await self.database.create_schema(db_schema)
            
            return pydantic_schema
            
        except ValidationError as e:
            logger.error(f"Schema validation error: {str(e)}")
            raise HTTPException(
                status_code=422,
                detail=f"Invalid schema configuration: {str(e)}"
            )
        except Exception as e:
            logger.error(f"Error creating prompt schema: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail=f"Failed to create schema: {str(e)}"
            )

    async def update_prompt_schema(
        self,
        prompt_type: str,
        prompt_text: Optional[str] = None,
        response_schema: Optional[Dict] = None,
        **kwargs
    ) -> PromptSchema:
        """
        Update an existing prompt schema
        
        Args:
            prompt_type: Type identifier for the prompt
            prompt_text: Optional new prompt text
            response_schema: Optional new response schema
            **kwargs: Additional update fields
            
        Returns:
            PromptSchema: The updated schema configuration
            
        Raises:
            HTTPException: If update fails
        """
        try:
            if not self.database:
                raise ValueError("Database not initialized")
                
            # Get existing schema
            existing_schema = await self.get_prompt_schema(prompt_type)
            if not existing_schema:
                raise ValueError(f"Schema not found: {prompt_type}")
                
            # Update fields
            update_data = existing_schema.model_dump()
            if prompt_text:
                update_data["main_prompt"] = prompt_text
            if response_schema:
                update_data["response_schema"] = response_schema
            update_data.update(kwargs)
            
            # Create new Pydantic model with updates
            updated_schema = PromptSchema(**update_data)
            
            # Convert to DB model and save
            db_schema = self._pydantic_to_db(updated_schema)
            await self.database.update_schema(db_schema)
            
            return updated_schema
            
        except Exception as e:
            logger.error(f"Error updating prompt schema: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail=f"Failed to update schema: {str(e)}"
            )

    async def delete_prompt_schema(self, prompt_type: str) -> bool:
        """
        Delete a prompt schema
        
        Args:
            prompt_type: Type identifier for the prompt
            
        Returns:
            bool: True if deletion successful
            
        Raises:
            HTTPException: If deletion fails
        """
        try:
            if not self.database:
                raise ValueError("Database not initialized")
                
            success = await self.database.delete_schema(prompt_type)
            if not success:
                raise ValueError(f"Failed to delete schema: {prompt_type}")
                
            return True
            
        except Exception as e:
            logger.error(f"Error deleting prompt schema: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail=f"Failed to delete schema: {str(e)}"
            )
