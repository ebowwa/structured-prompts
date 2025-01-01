"""
Pydantic models for schema validation with SQLAlchemy integration
"""

import time
from typing import Dict, List, Optional, Union, Any
from pydantic import BaseModel, Field, validator
from sqlalchemy import Column, String, Integer, Text, Boolean, Float, JSON, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import declarative_mixin

Base = declarative_base()

# Pydantic models for validation
class PromptSchemaBase(BaseModel):
    """Base Pydantic model for prompt schema validation"""
    prompt_id: str = Field(..., description="Unique identifier for this prompt")
    raw_schema: Dict[str, Any] = Field(..., description="Raw schema data with arbitrary structure")
    created_at: int = Field(default_factory=lambda: int(time.time()), description="Schema creation timestamp")

    class Config:
        orm_mode = True

# SQLAlchemy models for database
class PromptSchema(Base):
    """SQLAlchemy model for prompt schemas"""
    __tablename__ = 'prompt_schemas'

    prompt_id = Column(String, primary_key=True)
    raw_schema = Column(JSON, nullable=False)
    created_at = Column(Integer, nullable=False, default=lambda: int(time.time()))

class PromptResponseBase(BaseModel):
    """Base Pydantic model for response validation"""
    response_id: str = Field(..., description="Unique identifier for this response")
    prompt_id: str = Field(..., description="Reference to the prompt that generated this response")
    raw_response: Dict[str, Any] = Field(..., description="Raw response data with arbitrary structure")
    created_at: int = Field(default_factory=lambda: int(time.time()), description="Response creation timestamp")

    class Config:
        orm_mode = True

class PromptResponse(Base):
    """SQLAlchemy model for prompt responses"""
    __tablename__ = 'prompt_responses'

    response_id = Column(String, primary_key=True)
    prompt_id = Column(String, ForeignKey("prompt_schemas.prompt_id"), nullable=False)
    raw_response = Column(JSON, nullable=False)
    created_at = Column(Integer, nullable=False, default=lambda: int(time.time()))
