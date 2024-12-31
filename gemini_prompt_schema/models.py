"""
Pydantic models for schema validation
"""

from typing import Dict, List, Optional, Union
from pydantic import BaseModel, Field

class PromptSchema(BaseModel):
    """Schema for prompt configuration"""
    prompt_type: str = Field(..., description="Unique identifier for the prompt type")
    prompt_text: str = Field(..., description="The actual prompt text")
    response_schema: Dict = Field(..., description="JSON schema for validating responses")
    created_at: Optional[int] = Field(None, description="Creation timestamp")
    updated_at: Optional[int] = Field(None, description="Last update timestamp")

class PromptResponse(BaseModel):
    """Base model for prompt responses"""
    summary: Optional[str] = Field(None, description="Summary of the content")
    topics: Optional[List[str]] = Field(None, description="List of topics discussed")
    emotions: Optional[Dict] = Field(None, description="Detected emotions")
    key_points: Optional[List[str]] = Field(None, description="Key points from the content")
    insights: Optional[List[str]] = Field(None, description="Notable insights")
