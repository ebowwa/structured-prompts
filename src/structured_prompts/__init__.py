"""
Gemini Prompt Schema - A modular package for managing structured prompts with Google's Gemini API
"""

from .schema_manager import SchemaManager
from .models import PromptSchema, PromptResponse

__version__ = "0.1.1"
__all__ = ["SchemaManager", "PromptSchema", "PromptResponse"]
