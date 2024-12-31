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

from .models import PromptSchema, PromptResponse
from .database import Database

logger = logging.getLogger(__name__)

class SchemaManager:
    """Manages prompt schemas and their configurations"""
    
    DEFAULT_PROMPT_TYPE = "transcription_v1"
    DEFAULT_PROMPT_TEXT = (
        "Please analyze this audio and provide a detailed summary including: "
        "key topics discussed, speaker emotions, main points, and any notable insights or conclusions."
    )
    
    def __init__(
        self,
        database: Optional[Database] = None,
        table: Optional[Table] = None,
        default_prompt_type: Optional[str] = None,
        default_prompt_text: Optional[str] = None
    ):
        """
        Initialize SchemaManager with optional custom database and defaults
        
        Args:
            database: Optional custom database instance
            table: Optional custom table for storing schemas
            default_prompt_type: Optional custom default prompt type
            default_prompt_text: Optional custom default prompt text
        """
        self.database = database
        self.table = table
        self.DEFAULT_PROMPT_TYPE = default_prompt_type or self.DEFAULT_PROMPT_TYPE
        self.DEFAULT_PROMPT_TEXT = default_prompt_text or self.DEFAULT_PROMPT_TEXT

    async def get_config(self, prompt_type: str) -> Optional[Dict]:
        """
        Get prompt configuration
        
        Args:
            prompt_type: Type of prompt to retrieve
            
        Returns:
            Dict containing prompt configuration or None if not found
        """
        if prompt_type == self.DEFAULT_PROMPT_TYPE:
            return {
                "prompt_text": self.DEFAULT_PROMPT_TEXT,
                "response_schema": {
                    "type": "object",
                    "properties": {
                        "summary": {"type": "string"},
                        "topics": {"type": "array", "items": {"type": "string"}},
                        "emotions": {"type": "object"},
                        "key_points": {"type": "array", "items": {"type": "string"}},
                        "insights": {"type": "array", "items": {"type": "string"}}
                    }
                }
            }
            
        if not self.database or not self.table:
            return None
            
        query = self.table.select().where(
            self.table.c.prompt_type == prompt_type
        )
        result = await self.database.fetch_one(query)
        
        if result:
            return {
                "prompt_text": result["prompt_text"],
                "response_schema": json.loads(result["response_schema"])
            }
        return None

    async def get_prompt_text(self, prompt_type: str) -> str:
        """
        Get prompt text, raising 400 error if prompt type is invalid
        
        Args:
            prompt_type: Type of prompt to retrieve text for
            
        Returns:
            Prompt text string
            
        Raises:
            HTTPException: If prompt type is invalid
        """
        if prompt_type == self.DEFAULT_PROMPT_TYPE:
            return self.DEFAULT_PROMPT_TEXT
            
        config = await self.get_config(prompt_type)
        if not config:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid prompt type: {prompt_type}"
            )
        return config["prompt_text"]

    async def create_config(
        self,
        prompt_type: str,
        prompt_text: str,
        response_schema: Dict
    ) -> Dict:
        """
        Create new prompt configuration
        
        Args:
            prompt_type: Type of prompt to create
            prompt_text: Text of the prompt
            response_schema: Schema for validating responses
            
        Returns:
            Created prompt configuration
            
        Raises:
            HTTPException: If creation fails or prompt type is default
        """
        if prompt_type == self.DEFAULT_PROMPT_TYPE:
            raise HTTPException(
                status_code=400,
                detail=f"Cannot modify default prompt type: {self.DEFAULT_PROMPT_TYPE}"
            )
            
        if not self.database or not self.table:
            raise HTTPException(
                status_code=500,
                detail="Database not configured"
            )
            
        try:
            # Validate schema
            prompt_schema = PromptSchema(
                prompt_type=prompt_type,
                prompt_text=prompt_text,
                response_schema=response_schema
            )
            
            current_timestamp = int(datetime.utcnow().timestamp())
            query = self.table.insert().values(
                prompt_type=prompt_schema.prompt_type,
                prompt_text=prompt_schema.prompt_text,
                response_schema=json.dumps(prompt_schema.response_schema),
                created_at=current_timestamp,
                updated_at=current_timestamp
            )
            await self.database.execute(query)
            return await self.get_config(prompt_type)
            
        except ValidationError as e:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid schema: {str(e)}"
            )
        except Exception as e:
            logger.error(f"Error creating config: {e}", exc_info=True)
            raise HTTPException(
                status_code=500,
                detail="Failed to create prompt schema"
            )

    async def update_config(
        self,
        prompt_type: str,
        prompt_text: Optional[str] = None,
        response_schema: Optional[Dict] = None
    ) -> Dict:
        """
        Update existing prompt configuration
        
        Args:
            prompt_type: Type of prompt to update
            prompt_text: Optional new prompt text
            response_schema: Optional new response schema
            
        Returns:
            Updated prompt configuration
            
        Raises:
            HTTPException: If update fails or prompt type is default
        """
        if prompt_type == self.DEFAULT_PROMPT_TYPE:
            raise HTTPException(
                status_code=400,
                detail=f"Cannot modify default prompt type: {self.DEFAULT_PROMPT_TYPE}"
            )
            
        if not self.database or not self.table:
            raise HTTPException(
                status_code=500,
                detail="Database not configured"
            )
            
        try:
            current_timestamp = int(datetime.utcnow().timestamp())
            values = {"updated_at": current_timestamp}
            
            if prompt_text:
                values["prompt_text"] = prompt_text
            if response_schema:
                values["response_schema"] = json.dumps(response_schema)
                
            query = self.table.update().where(
                self.table.c.prompt_type == prompt_type
            ).values(**values)
            
            result = await self.database.execute(query)
            if not result:
                raise HTTPException(
                    status_code=404,
                    detail=f"Prompt schema not found: {prompt_type}"
                )
            return await self.get_config(prompt_type)
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error updating config: {e}", exc_info=True)
            raise HTTPException(
                status_code=500,
                detail="Failed to update prompt schema"
            )

    async def delete_config(self, prompt_type: str) -> bool:
        """
        Delete prompt configuration
        
        Args:
            prompt_type: Type of prompt to delete
            
        Returns:
            True if deleted successfully
            
        Raises:
            HTTPException: If deletion fails or prompt type is default
        """
        if prompt_type == self.DEFAULT_PROMPT_TYPE:
            raise HTTPException(
                status_code=400,
                detail=f"Cannot delete default prompt type: {self.DEFAULT_PROMPT_TYPE}"
            )
            
        if not self.database or not self.table:
            raise HTTPException(
                status_code=500,
                detail="Database not configured"
            )
            
        try:
            query = self.table.delete().where(
                self.table.c.prompt_type == prompt_type
            )
            result = await self.database.execute(query)
            return result is not None
            
        except Exception as e:
            logger.error(f"Error deleting config: {e}", exc_info=True)
            return False
