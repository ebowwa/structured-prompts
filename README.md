# Gemini Structured Response Prompts Database

A powerful and modular package for managing structured prompts with Google's Gemini API. This package provides a database-agnostic interface for storing, retrieving, and managing prompt schemas with structured response validation, specifically designed for large-scale applications requiring consistent prompt management and response validation.

## Key Features

### Core Functionality
- Database-agnostic schema management with SQLAlchemy support
- Default and custom prompt types with versioning
- JSON schema validation for responses
- Async/await support with high performance
- FastAPI integration ready
- Extensible design patterns

### Schema Management
- Flexible prompt schema creation and management
- Version control for prompt schemas
- Default prompt templates
- Custom prompt type support
- Schema validation and enforcement

### Response Validation
- Structured response validation using JSON Schema
- Custom validation rules support
- Error handling and reporting
- Response type enforcement
- Schema evolution support

### Database Integration
- Support for multiple database backends:
  - PostgreSQL (with asyncpg)
  - SQLite
  - MySQL
  - Any SQLAlchemy-compatible database
- Connection pooling and optimization
- Async database operations
- Migration support

### API Integration
- FastAPI endpoints for schema management
- RESTful API for CRUD operations
- Swagger/OpenAPI documentation
- Rate limiting support
- Authentication ready

## Installation

```bash
pip install gemini-prompt-schema  # Coming soon
```

## Quick Start

```python
from gemini_prompt_schema import SchemaManager, PromptSchema, PromptResponse

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
        },
        "required": ["sentiment", "confidence"]
    }
)

# Use in your application
prompt_text = await schema_manager.get_prompt_text("sentiment_analysis")
```

## Advanced Usage

### Custom Schema Types

```python
from gemini_prompt_schema import SchemaManager

# Create a complex analysis schema
await schema_manager.create_config(
    prompt_type="content_analysis",
    prompt_text="Perform a detailed analysis of this content.",
    response_schema={
        "type": "object",
        "properties": {
            "main_topics": {
                "type": "array",
                "items": {"type": "string"}
            },
            "sentiment": {
                "type": "object",
                "properties": {
                    "overall": {"type": "string"},
                    "confidence": {"type": "number"},
                    "aspects": {
                        "type": "array",
                        "items": {
                            "type": "object",
                            "properties": {
                                "aspect": {"type": "string"},
                                "sentiment": {"type": "string"}
                            }
                        }
                    }
                }
            },
            "key_insights": {
                "type": "array",
                "items": {"type": "string"}
            }
        }
    }
)
```

### Database Operations

```python
# Custom database configuration
from gemini_prompt_schema import Database

db = Database(
    url="postgresql://user:pass@localhost/db",
    min_size=5,
    max_size=20
)

schema_manager = SchemaManager(database=db)

# Batch operations
async def migrate_schemas(old_type: str, new_type: str):
    old_config = await schema_manager.get_config(old_type)
    if old_config:
        await schema_manager.create_config(
            prompt_type=new_type,
            prompt_text=old_config["prompt_text"],
            response_schema=old_config["response_schema"]
        )
```

## Development Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/gemini-structured-response-prompts-database.git
cd gemini-structured-response-prompts-database
```

2. Install dependencies:
```bash
./setup.sh
```

3. Run tests:
```bash
poetry run pytest
```

## Contributing

We welcome contributions! Please read our [Contributing Guidelines](CONTRIBUTING.md) for details on:
- Code style
- Development process
- Testing requirements
- Pull request process

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Google's Gemini API team for their excellent documentation
- FastAPI community for inspiration on API design
- SQLAlchemy team for the robust database toolkit
