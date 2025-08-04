"""
Simple examples showing how to use structured-prompts with the improved API

After v0.1.2 fixes:
- Pydantic v2 compatibility
- Simplified field names (no confusing aliases)
- Sensible defaults (most fields are now optional)
"""

from structured_prompts import PromptSchema, PromptResponse, SchemaManager
import json


def example_1_minimal_prompt():
    """Example 1: Create a minimal prompt with only required fields"""
    print("Example 1: Minimal Prompt")
    print("-" * 40)
    
    # Only 3 fields are truly required now!
    prompt = PromptSchema(
        prompt_id="simple_001",
        prompt_type="greeting",
        prompt_text="Say hello to {name}"
    )
    
    print(f"Created prompt: {prompt.prompt_id}")
    print(f"Text: {prompt.prompt_text}")
    print(f"Response schema: {prompt.response_schema}")  # Empty dict by default
    print()


def example_2_complete_prompt():
    """Example 2: Create a complete prompt with all optional fields"""
    print("Example 2: Complete Prompt")
    print("-" * 40)
    
    prompt = PromptSchema(
        prompt_id="analysis_001",
        prompt_type="data_analysis",
        prompt_text="Analyze the sentiment of: {text}",
        prompt_description="Analyzes text sentiment and extracts key themes",
        prompt_categories=["analysis", "sentiment", "nlp"],
        model_instruction="Provide structured JSON response",
        response_schema={
            "type": "object",
            "properties": {
                "sentiment": {"type": "string", "enum": ["positive", "negative", "neutral"]},
                "confidence": {"type": "number", "minimum": 0, "maximum": 1},
                "themes": {"type": "array", "items": {"type": "string"}}
            },
            "required": ["sentiment", "confidence"]
        },
        is_public=True,
        provider_configs={
            "temperature": 0.7,
            "max_tokens": 500
        },
        model_capabilities={
            "supports_json": True,
            "min_context_length": 4096
        }
    )
    
    print(f"Prompt: {prompt.prompt_id}")
    print(f"Categories: {', '.join(prompt.prompt_categories)}")
    print(f"Public: {prompt.is_public}")
    print(f"Response schema defined: {bool(prompt.response_schema)}")
    print()


def example_3_prompt_response():
    """Example 3: Create a response - now much simpler!"""
    print("Example 3: Prompt Response")
    print("-" * 40)
    
    # Response with auto-generated ID
    response = PromptResponse(
        raw_response={"answer": "Hello, World!", "confidence": 0.95}
    )
    
    print(f"Response ID (auto-generated): {response.response_id}")
    print(f"Created at: {response.created_at}")
    print(f"Response data: {response.raw_response}")
    print()
    
    # Response linked to a prompt
    linked_response = PromptResponse(
        prompt_id="greeting_001",
        raw_response={"text": "Hi there!"}
    )
    
    print(f"Linked to prompt: {linked_response.prompt_id}")
    print()


def example_4_schema_manager():
    """Example 4: Using SchemaManager to organize prompts"""
    print("Example 4: Schema Manager")
    print("-" * 40)
    
    manager = SchemaManager()
    
    # Create and register multiple prompts easily
    prompts = [
        PromptSchema(
            prompt_id="translate_001",
            prompt_type="translation",
            prompt_text="Translate to {language}: {text}"
        ),
        PromptSchema(
            prompt_id="summarize_001",
            prompt_type="summarization",
            prompt_text="Summarize in {length} sentences: {content}"
        ),
        PromptSchema(
            prompt_id="qa_001",
            prompt_type="question_answering",
            prompt_text="Answer this question: {question}\nContext: {context}"
        )
    ]
    
    # Register all prompts
    for prompt in prompts:
        # Note: You'd implement the registration logic in SchemaManager
        print(f"Registered: {prompt.prompt_id} ({prompt.prompt_type})")
    
    print()


def example_5_format_prompt():
    """Example 5: Format prompts with variables"""
    print("Example 5: Formatting Prompts")
    print("-" * 40)
    
    prompt = PromptSchema(
        prompt_id="email_001",
        prompt_type="email_generation",
        prompt_text="""Write a professional email:
To: {recipient}
Subject: {subject}
Tone: {tone}
Key points: {points}"""
    )
    
    # Format the prompt with actual values
    formatted = prompt.prompt_text.format(
        recipient="John Doe",
        subject="Project Update",
        tone="professional but friendly",
        points="deadline met, under budget, team did great"
    )
    
    print("Formatted prompt:")
    print(formatted)
    print()


def example_6_validation():
    """Example 6: Response validation against schema"""
    print("Example 6: Response Validation")
    print("-" * 40)
    
    # Create a prompt with strict response schema
    prompt = PromptSchema(
        prompt_id="structured_001",
        prompt_type="structured_extraction",
        prompt_text="Extract information from: {text}",
        response_schema={
            "type": "object",
            "properties": {
                "name": {"type": "string"},
                "age": {"type": "number"},
                "email": {"type": "string", "format": "email"}
            },
            "required": ["name", "age"]
        }
    )
    
    # Create responses
    valid_response = PromptResponse(
        prompt_id=prompt.prompt_id,
        raw_response={
            "name": "Alice Smith",
            "age": 30,
            "email": "alice@example.com"
        }
    )
    
    invalid_response = PromptResponse(
        prompt_id=prompt.prompt_id,
        raw_response={
            "name": "Bob Jones"
            # Missing required 'age' field
        }
    )
    
    print(f"Valid response: {valid_response.raw_response}")
    print(f"Invalid response (missing age): {invalid_response.raw_response}")
    print()


def main():
    """Run all examples"""
    print("=" * 60)
    print("Structured Prompts - Simple Usage Examples")
    print("=" * 60)
    print()
    
    example_1_minimal_prompt()
    example_2_complete_prompt()
    example_3_prompt_response()
    example_4_schema_manager()
    example_5_format_prompt()
    example_6_validation()
    
    print("=" * 60)
    print("Key Improvements in v0.1.2:")
    print("=" * 60)
    print("1. Pydantic v2 compatibility (no more warnings!)")
    print("2. Clear field names (no confusing aliases)")
    print("3. Most fields now optional with sensible defaults")
    print("4. Auto-generated IDs for responses")
    print("5. Simpler API - only 3 required fields for basic usage")


if __name__ == "__main__":
    main()