"""Input validation schemas and utilities."""

import json
from typing import Any, Dict, List, Optional, Union
from pydantic import BaseModel, Field, validator
from jsonschema import validate, ValidationError as JsonSchemaError
from enum import Enum


class InputType(str, Enum):
    """Types of user inputs."""
    TEXT = "text"
    JSON = "json"
    CODE = "code"
    STRUCTURED = "structured"
    MULTIMODAL = "multimodal"


class InputValidation(BaseModel):
    """Input validation configuration."""
    input_type: InputType = Field(default=InputType.TEXT)
    required_fields: List[str] = Field(default_factory=list)
    json_schema: Optional[Dict[str, Any]] = Field(
        None,
        description="JSON Schema for structured validation"
    )
    text_constraints: Optional[Dict[str, Any]] = Field(
        default_factory=dict,
        description="Constraints for text input"
    )
    examples: List[Dict[str, Any]] = Field(
        default_factory=list,
        description="Example valid inputs"
    )
    error_messages: Dict[str, str] = Field(
        default_factory=dict,
        description="Custom error messages"
    )


class TextConstraints(BaseModel):
    """Constraints for text inputs."""
    min_length: Optional[int] = None
    max_length: Optional[int] = None
    pattern: Optional[str] = None  # Regex pattern
    allowed_formats: List[str] = Field(default_factory=list)
    forbidden_patterns: List[str] = Field(default_factory=list)
    language: Optional[str] = None
    
    
class ValidationResult(BaseModel):
    """Result of input validation."""
    is_valid: bool
    errors: List[str] = Field(default_factory=list)
    warnings: List[str] = Field(default_factory=list)
    transformed_input: Optional[Any] = None
    metadata: Dict[str, Any] = Field(default_factory=dict)


def validate_json_input(
    user_input: Union[str, Dict],
    schema: Dict[str, Any]
) -> ValidationResult:
    """Validate JSON input against schema."""
    result = ValidationResult(is_valid=True)
    
    try:
        # Parse if string
        if isinstance(user_input, str):
            try:
                parsed = json.loads(user_input)
            except json.JSONDecodeError as e:
                result.is_valid = False
                result.errors.append(f"Invalid JSON: {str(e)}")
                return result
        else:
            parsed = user_input
        
        # Validate against schema
        validate(parsed, schema)
        result.transformed_input = parsed
        
    except JsonSchemaError as e:
        result.is_valid = False
        result.errors.append(f"Schema validation failed: {e.message}")
        
    return result


def validate_text_input(
    user_input: str,
    constraints: TextConstraints
) -> ValidationResult:
    """Validate text input against constraints."""
    result = ValidationResult(is_valid=True, transformed_input=user_input)
    
    # Length validation
    if constraints.min_length and len(user_input) < constraints.min_length:
        result.is_valid = False
        result.errors.append(f"Input too short (min: {constraints.min_length})")
    
    if constraints.max_length and len(user_input) > constraints.max_length:
        result.is_valid = False
        result.errors.append(f"Input too long (max: {constraints.max_length})")
    
    # Pattern validation
    if constraints.pattern:
        import re
        if not re.match(constraints.pattern, user_input):
            result.is_valid = False
            result.errors.append("Input doesn't match required pattern")
    
    # Forbidden patterns
    for pattern in constraints.forbidden_patterns:
        if pattern in user_input:
            result.is_valid = False
            result.errors.append(f"Input contains forbidden pattern: {pattern}")
    
    return result


def validate_code_input(
    user_input: str,
    language: str,
    additional_checks: Optional[Dict[str, Any]] = None
) -> ValidationResult:
    """Validate code input."""
    result = ValidationResult(is_valid=True, transformed_input=user_input)
    
    # Basic syntax validation based on language
    if language == "python":
        try:
            compile(user_input, '<string>', 'exec')
        except SyntaxError as e:
            result.is_valid = False
            result.errors.append(f"Python syntax error: {str(e)}")
    
    elif language == "json":
        try:
            json.loads(user_input)
        except json.JSONDecodeError as e:
            result.is_valid = False
            result.errors.append(f"JSON syntax error: {str(e)}")
    
    # Add more language-specific validation as needed
    
    return result


def validate_user_input(
    user_input: Any,
    validation_config: InputValidation
) -> ValidationResult:
    """Main validation function."""
    if validation_config.input_type == InputType.JSON and validation_config.json_schema:
        return validate_json_input(user_input, validation_config.json_schema)
    
    elif validation_config.input_type == InputType.TEXT:
        constraints = TextConstraints(**validation_config.text_constraints)
        return validate_text_input(str(user_input), constraints)
    
    elif validation_config.input_type == InputType.CODE:
        language = validation_config.text_constraints.get("language", "python")
        return validate_code_input(str(user_input), language)
    
    # Default: accept any input
    return ValidationResult(is_valid=True, transformed_input=user_input)


# Example schemas for common use cases
COMMON_INPUT_SCHEMAS = {
    "key_value_pairs": {
        "type": "object",
        "additionalProperties": {"type": "string"}
    },
    "array_of_strings": {
        "type": "array",
        "items": {"type": "string"}
    },
    "structured_query": {
        "type": "object",
        "properties": {
            "query": {"type": "string"},
            "filters": {"type": "object"},
            "limit": {"type": "integer", "minimum": 1, "maximum": 100}
        },
        "required": ["query"]
    },
    "code_snippet": {
        "type": "object",
        "properties": {
            "language": {"type": "string", "enum": ["python", "javascript", "java", "go"]},
            "code": {"type": "string"}
        },
        "required": ["language", "code"]
    }
}