# Structured Prompts

A powerful and modular package for managing structured prompts with any LLM API. This package provides a database-agnostic interface for storing, retrieving, and managing prompt schemas with structured response validation, specifically designed for large-scale applications requiring consistent prompt management and response validation.

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
pip install structured-prompts  # Coming soon
```

## Configuration

Copy `.env.template` to `.env` and set the `DATABASE_URL` variable to match your
database connection string:

```bash
cp .env.template .env
# Edit .env and adjust DATABASE_URL
```

If `DATABASE_URL` is unset, the package defaults to `sqlite:///./structured_prompts.db`.

### Environment Variables

Currently the only environment variable recognized by the package is `DATABASE_URL`. This value sets the
database connection string for SQLAlchemy and falls back to the default SQLite database if not provided.
You can supply any SQLAlchemy-compatible connection string. For hosted PostgreSQL services such as
Supabase, set `DATABASE_URL` to the connection URL they provide, for example:

```
DATABASE_URL=postgresql://user:password@db.supabase.co:5432/dbname?sslmode=require
```

## Quick Start

```python
from src import (
    SchemaManager,
    PromptSchema,
)
from src.database import Database

# Initialize with your database connection
db = Database(url="postgresql://user:pass@localhost/db")
schema_manager = SchemaManager(database=db)

# Create a new prompt schema
await schema_manager.create_prompt_schema(
    prompt_type="sentiment_analysis",
    prompt_text="Analyze the sentiment of this text.",
    model_instruction="Respond in JSON format.",
    additional_messages=[{"role": "system", "content": "Use concise summaries."}],
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

# Retrieve the schema later
prompt_schema = await schema_manager.get_prompt_schema("sentiment_analysis")
```

### PromptSchema Fields

`PromptSchema` instances include several attributes for managing metadata and
additional instructions:

- `prompt_title`: human-readable title for the prompt
- `prompt_description`: detailed description of the prompt
- `main_prompt`: primary text shown to the model
- `model_instruction`: optional instructions for model behaviour
- `additional_messages`: optional list of `{role, content}` messages
- `response_schema`: JSON schema describing the expected response
- `is_public`: flag to expose the prompt publicly
- `ranking`: numeric rating for effectiveness
- `last_used` / `usage_count`: tracking statistics
- `created_at` / `created_by`: creation metadata
- `last_updated` / `last_updated_by`: update metadata

## Project Structure

The codebase is organized into a few key modules:

- **`database.py`** – Async wrapper around SQLAlchemy that handles engine
  creation, connection checks and automatic database creation. It exposes
  convenience methods like `create_schema`, `get_schema` and similar for
  `PromptSchemaDB` and `PromptResponseDB` models.
- **`models.py`** – Defines the SQLAlchemy models and matching Pydantic models
  (`PromptSchema` and `PromptResponse`) used for validation and data transfer.
- **`schema_manager.py`** – High level manager that converts between Pydantic
  and SQLAlchemy objects, performing CRUD operations and providing helpful
  error handling.
- **`__init__.py`** – Exports `SchemaManager` along with the Pydantic models as
  the public API for the package.
- **`tests/`** – Contains a small pytest suite demonstrating SQLite based
  integration tests.

## Using as a plugin

Install the package directly from GitHub:

```bash
pip install git+https://github.com/ebowwa/structured-prompts.git
```

Initialize the package in another project:

```python
from src.database import Database
from src import SchemaManager

db = Database(url="postgresql://user:pass@localhost/db")
schema_manager = SchemaManager(database=db)
```

Now you can manage prompt schemas using `schema_manager`.
## Advanced Usage

### Custom Schema Types

```python
from src import SchemaManager

# Create a complex analysis schema
await schema_manager.create_prompt_schema(
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
from src.database import Database

db = Database(
    url="postgresql://user:pass@localhost/db",
    min_size=5,
    max_size=20
)

schema_manager = SchemaManager(database=db)

# Batch operations
async def migrate_schemas(old_type: str, new_type: str):
    old_config = await schema_manager.get_prompt_schema(old_type)
    if old_config:
        await schema_manager.create_prompt_schema(
            prompt_type=new_type,
            prompt_text=old_config["prompt_text"],
            response_schema=old_config["response_schema"]
        )
```

## Development Setup

1. Clone the repository:
```bash
git clone https://github.com/ebowwa/structured-prompts.git
cd structured-prompts
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

We welcome contributions! Contributor guidelines will be added soon. Highlights include:
- Code style
- Development process
- Testing requirements
- Pull request process

## License

This project is licensed under the MIT License.

## Acknowledgments

- The open source community for their contributions
- FastAPI community for inspiration on API design
- SQLAlchemy team for the robust database toolkit
