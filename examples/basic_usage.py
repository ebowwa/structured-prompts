"""
Basic usage examples for the structured-prompts package.
"""

import asyncio
from structured_prompts import SchemaManager, PromptSchema
from structured_prompts.database import Database
from structured_prompts.model_capabilities import ModelCapability, PromptOptimization
from structured_prompts.input_validation import validate_user_input, InputValidation


async def basic_example():
    """Basic usage example."""
    # Initialize database
    db = Database()  # Uses SQLite by default
    schema_manager = SchemaManager(database=db)
    
    # Create a simple prompt schema
    await schema_manager.create_prompt_schema(
        prompt_id="simple_question",
        prompt_title="Simple Question Answering",
        prompt_description="Answer questions with structured responses",
        main_prompt="Please answer the following question comprehensively.",
        prompt_categories=["qa", "general"],
        response_schema={
            "type": "object",
            "properties": {
                "answer": {"type": "string"},
                "confidence": {"type": "string", "enum": ["high", "medium", "low"]},
                "sources": {"type": "array", "items": {"type": "string"}}
            },
            "required": ["answer", "confidence"]
        }
    )
    
    # Retrieve the schema
    schema = await schema_manager.get_prompt_schema("simple_question")
    print(f"Created schema: {schema['prompt_title']}")


async def model_specific_example():
    """Example with model-specific optimizations."""
    db = Database()
    schema_manager = SchemaManager(database=db)
    
    # Create a prompt optimized for thinking models
    await schema_manager.create_prompt_schema(
        prompt_id="complex_reasoning",
        prompt_title="Complex Reasoning Task",
        prompt_description="Solve complex problems with step-by-step thinking",
        main_prompt="Solve this step-by-step mathematical proof.",
        prompt_categories=["reasoning", "mathematics"],
        model_capabilities={
            "prefer_thinking_mode": True,
            "thinking_instruction": "Work through this systematically",
            "optimal_models": ["o1", "claude-3-opus"]
        },
        system_prompts=[
            {
                "id": "think_deeply",
                "name": "Deep Thinking Mode",
                "content": "Take your time to think through each step carefully",
                "priority": 1,
                "condition": {
                    "capability_required": "thinking",
                    "always_apply": False
                },
                "token_format": "plain"
            }
        ],
        response_schema={
            "type": "object",
            "properties": {
                "explanation": {"type": "string"},
                "complexity": {"type": "string", "enum": ["low", "medium", "high"]},
                "suggestions": {"type": "array", "items": {"type": "string"}}
            },
            "required": ["explanation", "complexity"]
        }
    )
    
    print("Created model-specific optimized prompt")


async def input_validation_example():
    """Example with input validation."""
    db = Database()
    schema_manager = SchemaManager(database=db)
    
    # Create a code analysis prompt with input validation
    await schema_manager.create_prompt_schema(
        prompt_id="code_analysis",
        prompt_title="Code Analysis",
        prompt_description="Analyze code and explain its functionality",
        main_prompt="Analyze this code and explain what it does.",
        prompt_categories=["code", "analysis"],
        input_schema={
            "type": "object",
            "properties": {
                "code": {
                    "type": "string",
                    "minLength": 10,
                    "maxLength": 10000
                },
                "language": {
                    "type": "string", 
                    "enum": ["python", "javascript", "go", "rust", "java"]
                },
                "context": {
                    "type": "string",
                    "description": "Additional context about the code"
                }
            },
            "required": ["code", "language"]
        },
        response_schema={
            "type": "object",
            "properties": {
                "explanation": {"type": "string"},
                "complexity": {"type": "string", "enum": ["low", "medium", "high"]},
                "suggestions": {"type": "array", "items": {"type": "string"}},
                "potential_issues": {"type": "array", "items": {"type": "string"}}
            },
            "required": ["explanation", "complexity"]
        }
    )
    
    # Validate user input
    validation_config = InputValidation(
        input_type="json",
        json_schema={
            "type": "object",
            "properties": {
                "code": {"type": "string", "minLength": 10},
                "language": {"type": "string", "enum": ["python", "javascript", "go"]}
            },
            "required": ["code", "language"]
        }
    )
    
    # Test with valid input
    valid_input = {
        "code": "def hello_world():\\n    print('Hello, World!')",
        "language": "python"
    }
    
    result = validate_user_input(valid_input, validation_config)
    print(f"Valid input test: {result.is_valid}")
    
    # Test with invalid input
    invalid_input = {
        "code": "short",
        "language": "cobol"  # Not in enum
    }
    
    result = validate_user_input(invalid_input, validation_config)
    print(f"Invalid input test: {result.is_valid}, Errors: {result.errors}")


async def complex_schema_example():
    """Example with complex nested schemas."""
    db = Database()
    schema_manager = SchemaManager(database=db)
    
    # Create a complex content analysis schema
    await schema_manager.create_prompt_schema(
        prompt_id="content_analysis",
        prompt_title="Content Analysis",
        prompt_description="Detailed content analysis with sentiment and insights",
        main_prompt="Perform a detailed analysis of this content.",
        prompt_categories=["analysis", "sentiment"],
        model_instruction="Provide comprehensive analysis with specific examples",
        additional_messages=[
            {
                "role": "system",
                "content": "You are an expert content analyst."
            }
        ],
        response_schema={
            "type": "object",
            "properties": {
                "summary": {
                    "type": "string",
                    "description": "Brief summary of the content"
                },
                "main_topics": {
                    "type": "array",
                    "items": {"type": "string"},
                    "minItems": 1,
                    "maxItems": 10
                },
                "sentiment": {
                    "type": "object",
                    "properties": {
                        "overall": {
                            "type": "string",
                            "enum": ["positive", "negative", "neutral", "mixed"]
                        },
                        "confidence": {
                            "type": "number",
                            "minimum": 0,
                            "maximum": 1
                        },
                        "aspects": {
                            "type": "array",
                            "items": {
                                "type": "object",
                                "properties": {
                                    "aspect": {"type": "string"},
                                    "sentiment": {
                                        "type": "string",
                                        "enum": ["positive", "negative", "neutral"]
                                    },
                                    "score": {
                                        "type": "number",
                                        "minimum": -1,
                                        "maximum": 1
                                    }
                                },
                                "required": ["aspect", "sentiment"]
                            }
                        }
                    },
                    "required": ["overall", "confidence"]
                },
                "key_insights": {
                    "type": "array",
                    "items": {"type": "string"},
                    "minItems": 1,
                    "maxItems": 5
                },
                "recommendations": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "properties": {
                            "action": {"type": "string"},
                            "priority": {
                                "type": "string",
                                "enum": ["high", "medium", "low"]
                            },
                            "rationale": {"type": "string"}
                        },
                        "required": ["action", "priority"]
                    }
                }
            },
            "required": ["summary", "main_topics", "sentiment", "key_insights"]
        }
    )
    
    print("Created complex content analysis schema")


async def list_and_update_example():
    """Example of listing and updating schemas."""
    db = Database()
    schema_manager = SchemaManager(database=db)
    
    # List all schemas
    all_schemas = await schema_manager.list_prompt_schemas()
    print(f"Total schemas: {len(all_schemas)}")
    
    for schema in all_schemas:
        print(f"- {schema['prompt_id']}: {schema['prompt_title']}")
    
    # Update a schema
    if all_schemas:
        first_schema_id = all_schemas[0]['prompt_id']
        
        await schema_manager.update_prompt_schema(
            prompt_id=first_schema_id,
            ranking=0.95,  # Update ranking
            model_capabilities={
                "prefer_thinking_mode": True,
                "updated": True
            }
        )
        
        print(f"Updated schema: {first_schema_id}")


async def main():
    """Run all examples."""
    print("=== Basic Example ===")
    await basic_example()
    
    print("\n=== Model-Specific Example ===")
    await model_specific_example()
    
    print("\n=== Input Validation Example ===")
    await input_validation_example()
    
    print("\n=== Complex Schema Example ===")
    await complex_schema_example()
    
    print("\n=== List and Update Example ===")
    await list_and_update_example()


if __name__ == "__main__":
    asyncio.run(main())