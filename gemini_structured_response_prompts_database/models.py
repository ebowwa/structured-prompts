"""
Pydantic models for schema validation with SQLAlchemy integration
"""

import time
from typing import Dict, List, Optional, Union, Any
from pydantic import BaseModel, Field, validator
from sqlalchemy import Column, String, Integer, Text, Boolean, Float, JSON, ForeignKey
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

class PromptSchema(BaseModel, Base):
    """
    Universal schema for prompt configuration across different LLM providers.
    Designed to be provider-agnostic while maintaining flexibility for provider-specific features.
    """
    __tablename__ = 'prompt_schemas'

    # Core Prompt Information
    prompt_id: str = Field(..., description="Unique identifier for this prompt", sa_column=Column(String, primary_key=True))
    prompt_title: str = Field(..., description="Human-readable title for the prompt", alias="prompt_type", sa_column=Column(String, nullable=False))
    prompt_description: str = Field("", description="Detailed description of the prompt's purpose and usage", sa_column=Column(Text))
    prompt_categories: List[str] = Field(default_factory=list, description="Categories/tags for organizing prompts", sa_column=Column(JSON))
    
    # Content
    main_prompt: str = Field(..., description="The primary prompt/instruction text", alias="prompt_text", sa_column=Column(Text, nullable=False))
    model_instruction: Optional[str] = Field(None, description="Specific instructions for model behavior", sa_column=Column(Text))
    additional_messages: Optional[List[Dict[str, str]]] = Field(
        default=None,
        description="Additional context messages in role:content format",
        sa_column=Column(JSON)
    )
    response_schema: Dict = Field(..., description="JSON schema for validating responses", sa_column=Column(JSON, nullable=False))
    
    # Metadata
    is_public: bool = Field(default=False, description="Whether this prompt is publicly accessible", sa_column=Column(Boolean, default=False))
    ranking: float = Field(default=0.0, description="Prompt effectiveness ranking (0-1)", sa_column=Column(Float, default=0.0))
    
    # Usage Tracking
    last_used: Optional[int] = Field(None, description="Timestamp of last usage", sa_column=Column(Integer))
    usage_count: int = Field(default=0, description="Number of times this prompt has been used", sa_column=Column(Integer, default=0))
    
    # Audit Trail
    created_at: int = Field(default_factory=lambda: int(time.time()), description="Creation timestamp", sa_column=Column(Integer, nullable=False))
    created_by: Optional[str] = Field(None, description="User ID of creator", sa_column=Column(String))
    last_updated: Optional[int] = Field(None, description="Last update timestamp", alias="updated_at", sa_column=Column(Integer))
    last_updated_by: Optional[str] = Field(None, description="User ID of last updater", sa_column=Column(String))
    
    # Provider Configuration
    provider_configs: Optional[Dict[str, Any]] = Field(
        default_factory=dict,
        description="Provider-specific configurations",
        sa_column=Column(JSON)
    )
    
    class Config:
        allow_population_by_field_name = True
        orm_mode = True


class PromptResponse(BaseModel, Base):
    """
    Dynamic response model that can handle arbitrary response structures.
    The actual schema is defined by the response_schema field in PromptSchema.
    """
    __tablename__ = 'prompt_responses'

    response_id: str = Field(..., description="Unique identifier for this response", sa_column=Column(String, primary_key=True))
    prompt_id: str = Field(..., description="Reference to the prompt that generated this response", sa_column=Column(String, ForeignKey("prompt_schemas.prompt_id"), nullable=False))
    raw_response: Dict[str, Any] = Field(..., description="Raw response data with arbitrary structure", sa_column=Column(JSON, nullable=False))
    created_at: int = Field(default_factory=lambda: int(time.time()), description="Response creation timestamp", sa_column=Column(Integer, nullable=False))
    
    class Config:
        extra = "allow"
        orm_mode = True
        
    @validator('raw_response')
    def validate_against_schema(cls, v, values, **kwargs):
        """
        This could be implemented to validate the raw_response against 
        the response_schema from the associated PromptSchema
        """
        return v
