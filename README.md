# Gemini Structured Response Prompts Database

A modular and reusable package for managing structured prompts with Google's Gemini API. This package provides a database-agnostic interface for storing, retrieving, and managing prompt schemas with structured response validation.

## Features

- Database-agnostic schema management
- Default and custom prompt types
- JSON schema validation for responses
- Async/await support
- FastAPI integration ready
- Extensible design

## Installation

```bash
pip install gemini-prompt-schema  # Coming soon
```

## Quick Start

```python
from gemini_prompt_schema import SchemaManager

# Initialize with your database connection
schema_manager = SchemaManager(database_url="postgresql://user:pass@localhost/db")

# Create a new prompt schema
await schema_manager.create_config(
    prompt_type="sentiment_analysis",
    prompt_text="Analyze the sentiment of this text.",
    response_schema={
        "type": "object",
        "properties": {
            "sentiment": {"type": "string", "enum": ["positive", "negative", "neutral"]},
            "confidence": {"type": "number"},
            "explanation": {"type": "string"}
        }
    }
)

# Use in your application
prompt_text = await schema_manager.get_prompt_text("sentiment_analysis")
```

## Contributing

Contributions are welcome! Please read our [Contributing Guidelines](CONTRIBUTING.md) for details.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
