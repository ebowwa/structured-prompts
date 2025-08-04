"""
Pydantic models for schema validation with SQLAlchemy integration
"""

import time
from typing import Dict, List, Optional, Union, Any
from pydantic import BaseModel, Field, ConfigDict, field_validator
from sqlalchemy import Column, String, Integer, Text, Boolean, Float, JSON, ForeignKey
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()

# SQLAlchemy Models
class PromptSchemaDB(Base):
    """SQLAlchemy model for prompt configuration"""
    __tablename__ = 'prompt_schemas'

    prompt_id = Column(String, primary_key=True)
    prompt_title = Column(String, nullable=False)
    prompt_description = Column(Text)
    prompt_categories = Column(JSON)
    main_prompt = Column(Text, nullable=False)
    model_instruction = Column(Text)
    additional_messages = Column(JSON)
    response_schema = Column(JSON, nullable=False)
    is_public = Column(Boolean, default=False)
    ranking = Column(Float, default=0.0)
    last_used = Column(Integer)
    usage_count = Column(Integer, default=0)
    created_at = Column(Integer, nullable=False, default=lambda: int(time.time()))
    created_by = Column(String)
    last_updated = Column(Integer)
    last_updated_by = Column(String)
    provider_configs = Column(JSON)
    model_capabilities = Column(JSON)
    input_schema = Column(JSON)
    system_prompts = Column(JSON)

    # Relationship to responses
    responses = relationship("PromptResponseDB", back_populates="schema")

class PromptResponseDB(Base):
    """SQLAlchemy model for prompt responses"""
    __tablename__ = 'prompt_responses'

    response_id = Column(String, primary_key=True)
    prompt_id = Column(String, ForeignKey("prompt_schemas.prompt_id"), nullable=False)
    raw_response = Column(JSON, nullable=False)
    created_at = Column(Integer, nullable=False, default=lambda: int(time.time()))

    # Relationship to schema
    schema = relationship("PromptSchemaDB", back_populates="responses")

# Pydantic Models
class PromptSchema(BaseModel):
    """Pydantic model for prompt schema validation"""
    prompt_id: str = Field(..., description="Unique identifier for this prompt")
    prompt_type: str = Field(..., description="Type/category of the prompt")
    prompt_description: Optional[str] = Field("", description="Detailed description of the prompt's purpose and usage")
    prompt_categories: List[str] = Field(default_factory=list, description="Categories/tags for organizing prompts")
    prompt_text: str = Field(..., description="The primary prompt/instruction text")
    model_instruction: Optional[str] = Field(None, description="Specific instructions for model behavior")
    additional_messages: Optional[List[Dict[str, str]]] = Field(
        default=None,
        description="Additional context messages in role:content format"
    )
    response_schema: Optional[Dict] = Field(default_factory=dict, description="JSON schema for validating responses")
    is_public: bool = Field(default=False, description="Whether this prompt is publicly accessible")
    ranking: float = Field(default=0.0, description="Prompt effectiveness ranking (0-1)")
    last_used: Optional[int] = Field(None, description="Timestamp of last usage")
    usage_count: int = Field(default=0, description="Number of times this prompt has been used")
    created_at: int = Field(default_factory=lambda: int(time.time()), description="Creation timestamp")
    created_by: Optional[str] = Field(None, description="User ID of creator")
    last_updated: Optional[int] = Field(None, description="Last update timestamp")
    last_updated_by: Optional[str] = Field(None, description="User ID of last updater")
    provider_configs: Optional[Dict[str, Any]] = Field(
        default_factory=dict,
        description="Provider-specific configurations"
    )
    model_capabilities: Optional[Dict[str, Any]] = Field(
        default_factory=dict,
        description="Model-specific capabilities and requirements"
    )
    input_schema: Optional[Dict[str, Any]] = Field(
        default=None,
        description="JSON schema for validating user inputs"
    )
    system_prompts: Optional[List[Dict[str, Any]]] = Field(
        default_factory=list,
        description="Collection of system prompts with conditions"
    )

    model_config = ConfigDict(
        populate_by_name=True,
        from_attributes=True
    )

class PromptResponse(BaseModel):
    """Pydantic model for prompt response validation"""
    response_id: Optional[str] = Field(default_factory=lambda: f"resp_{int(time.time()*1000)}", description="Unique identifier for this response")
    prompt_id: Optional[str] = Field(default=None, description="Reference to the prompt that generated this response")
    raw_response: Dict[str, Any] = Field(default_factory=dict, description="Raw response data with arbitrary structure")
    created_at: int = Field(default_factory=lambda: int(time.time()), description="Response creation timestamp")

    model_config = ConfigDict(
        extra="allow",
        from_attributes=True
    )

    @field_validator('raw_response')
    @classmethod
    def validate_against_schema(cls, v, values):
        """
        This could be implemented to validate the raw_response against 
        the response_schema from the associated PromptSchema
        """
        return v
