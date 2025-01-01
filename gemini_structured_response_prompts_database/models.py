"""
Pydantic models for schema validation with SQLAlchemy integration
"""

import time
from typing import Dict, List, Optional, Union, Any
from pydantic import BaseModel, Field, validator
from sqlalchemy import Column, String, Integer, Text, Boolean, Float, JSON, ForeignKey
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship

class Base(DeclarativeBase):
    """Base class for SQLAlchemy models"""
    pass

# SQLAlchemy Models
class PromptSchemaDB(Base):
    """SQLAlchemy model for prompt configuration"""
    __tablename__ = 'prompt_schemas'

    prompt_id: Mapped[str] = mapped_column(String, primary_key=True)
    prompt_title: Mapped[str] = mapped_column(String, nullable=False)
    prompt_description: Mapped[Optional[str]] = mapped_column(Text)
    prompt_categories: Mapped[List[str]] = mapped_column(JSON)
    main_prompt: Mapped[str] = mapped_column(Text, nullable=False)
    model_instruction: Mapped[Optional[str]] = mapped_column(Text)
    additional_messages: Mapped[Optional[List[Dict[str, str]]]] = mapped_column(JSON)
    response_schema: Mapped[Dict] = mapped_column(JSON, nullable=False)
    is_public: Mapped[bool] = mapped_column(Boolean, default=False)
    ranking: Mapped[float] = mapped_column(Float, default=0.0)
    last_used: Mapped[Optional[int]] = mapped_column(Integer)
    usage_count: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[int] = mapped_column(Integer, nullable=False, default=lambda: int(time.time()))
    created_by: Mapped[Optional[str]] = mapped_column(String)
    last_updated: Mapped[Optional[int]] = mapped_column(Integer)
    last_updated_by: Mapped[Optional[str]] = mapped_column(String)
    provider_configs: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSON)

    # Relationship to responses
    responses: Mapped[List["PromptResponseDB"]] = relationship(back_populates="schema")

class PromptResponseDB(Base):
    """SQLAlchemy model for prompt responses"""
    __tablename__ = 'prompt_responses'

    response_id: Mapped[str] = mapped_column(String, primary_key=True)
    prompt_id: Mapped[str] = mapped_column(String, ForeignKey("prompt_schemas.prompt_id"), nullable=False)
    raw_response: Mapped[Dict] = mapped_column(JSON, nullable=False)
    created_at: Mapped[int] = mapped_column(Integer, nullable=False, default=lambda: int(time.time()))

    # Relationship to schema
    schema: Mapped["PromptSchemaDB"] = relationship(back_populates="responses")

# Pydantic Models
class PromptSchema(BaseModel):
    """Pydantic model for prompt schema validation"""
    prompt_id: str = Field(..., description="Unique identifier for this prompt")
    prompt_title: str = Field(..., description="Human-readable title for the prompt", alias="prompt_type")
    prompt_description: Optional[str] = Field("", description="Detailed description of the prompt's purpose and usage")
    prompt_categories: List[str] = Field(default_factory=list, description="Categories/tags for organizing prompts")
    main_prompt: str = Field(..., description="The primary prompt/instruction text", alias="prompt_text")
    model_instruction: Optional[str] = Field(None, description="Specific instructions for model behavior")
    additional_messages: Optional[List[Dict[str, str]]] = Field(
        default=None,
        description="Additional context messages in role:content format"
    )
    response_schema: Dict = Field(..., description="JSON schema for validating responses")
    is_public: bool = Field(default=False, description="Whether this prompt is publicly accessible")
    ranking: float = Field(default=0.0, description="Prompt effectiveness ranking (0-1)")
    last_used: Optional[int] = Field(None, description="Timestamp of last usage")
    usage_count: int = Field(default=0, description="Number of times this prompt has been used")
    created_at: int = Field(default_factory=lambda: int(time.time()), description="Creation timestamp")
    created_by: Optional[str] = Field(None, description="User ID of creator")
    last_updated: Optional[int] = Field(None, description="Last update timestamp", alias="updated_at")
    last_updated_by: Optional[str] = Field(None, description="User ID of last updater")
    provider_configs: Optional[Dict[str, Any]] = Field(
        default_factory=dict,
        description="Provider-specific configurations"
    )

    class Config:
        allow_population_by_field_name = True
        from_attributes = True

class PromptResponse(BaseModel):
    """Pydantic model for prompt response validation"""
    response_id: str = Field(..., description="Unique identifier for this response")
    prompt_id: str = Field(..., description="Reference to the prompt that generated this response")
    raw_response: Dict[str, Any] = Field(..., description="Raw response data with arbitrary structure")
    created_at: int = Field(default_factory=lambda: int(time.time()), description="Response creation timestamp")

    class Config:
        extra = "allow"
        from_attributes = True

    @validator('raw_response')
    def validate_against_schema(cls, v, values, **kwargs):
        """
        This could be implemented to validate the raw_response against 
        the response_schema from the associated PromptSchema
        """
        return v
