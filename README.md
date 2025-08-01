# Structured Prompts

A powerful and modular package for managing structured prompts with any LLM API. This package provides a database-agnostic interface for storing, retrieving, and managing prompt schemas with model-specific optimizations, input validation, and structured response validation. Designed for large-scale applications requiring consistent prompt management across different AI models.

## Key Features

### Core Functionality
- Database-agnostic schema management with SQLAlchemy support
- Model-specific optimizations (thinking mode, special tokens)
- Input validation before sending to LLMs
- JSON schema validation for responses
- MCP (Model Context Protocol) server integration
- Async/await support with high performance
- FastAPI integration ready
- Extensible design patterns

### Schema Management
- Flexible prompt schema creation and management
- Version control for prompt schemas
- Default prompt templates
- Custom prompt type support
- Schema validation and enforcement

### Input & Response Validation
- User input validation with JSON schemas
- Text constraints (length, patterns, forbidden content)
- Code syntax validation
- Structured response validation using JSON Schema
- Custom validation rules and error messages
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
- MCP server for LLM client integration
- RESTful API for CRUD operations
- Swagger/OpenAPI documentation
- Rate limiting support
- Authentication ready

### Model-Specific Features
- Support for model capabilities detection
- Automatic thinking mode optimization
- Special token handling (Claude, GPT, Gemini)
- Model-specific prompt formatting
- Smart routing based on capabilities

## Installation

```bash
pip install structured-prompts
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

### Basic Usage

```python
from structured_prompts import SchemaManager, PromptSchema
from structured_prompts.database import Database

# Initialize with your database connection
db = Database(url="postgresql://user:pass@localhost/db")
schema_manager = SchemaManager(database=db)

# Create a prompt with input validation
await schema_manager.create_prompt_schema(
    prompt_id="code_analysis",
    prompt_title="Code Analysis",
    prompt_description="Analyze code and explain its functionality",
    main_prompt="Analyze this code and explain what it does.",
    prompt_categories=["code", "analysis"],
    input_schema={
        "type": "object",
        "properties": {
            "code": {"type": "string"},
            "language": {"type": "string", "enum": ["python", "javascript", "go"]}
        },
        "required": ["code", "language"]
    },
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
```

### Model-Specific Optimization

```python
from structured_prompts.model_capabilities import ModelCapability, PromptOptimization

# Create a prompt optimized for thinking models
await schema_manager.create_prompt_schema(
    prompt_id="complex_reasoning",
    prompt_title="Complex Reasoning Task",
    prompt_description="Mathematical proof requiring deep thinking",
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
    ]
)

# The system automatically adds thinking tags for capable models
```

### Input Validation

```python
# Validate user input before sending to LLM
from structured_prompts.input_validation import validate_user_input, InputValidation

validation_config = InputValidation(
    input_type="json",
    json_schema={
        "type": "object",
        "properties": {
            "query": {"type": "string", "minLength": 10},
            "max_results": {"type": "integer", "minimum": 1, "maximum": 100}
        },
        "required": ["query"]
    }
)

result = validate_user_input(user_data, validation_config)
if not result.is_valid:
    print(f"Input errors: {result.errors}")
```

### MCP Server Usage

```bash
# Run the MCP server
structured-prompts-mcp

# Or with custom database
DATABASE_URL=postgresql://user:pass@localhost/prompts structured-prompts-mcp
```

Configure your MCP client:
```json
{
  "mcpServers": {
    "prompts": {
      "command": "structured-prompts-mcp"
    }
  }
}
```

### PromptSchema Fields

`PromptSchema` instances include several attributes for managing metadata and
additional instructions:

- `prompt_id`: unique identifier for the prompt (required)
- `prompt_title`: human-readable title for the prompt (required)
- `prompt_description`: detailed description of the prompt
- `prompt_categories`: list of category tags for organization
- `main_prompt`: primary text shown to the model (required)
- `model_instruction`: optional instructions for model behaviour
- `additional_messages`: optional list of `{role, content}` messages
- `response_schema`: JSON schema describing the expected response (required)
- `input_schema`: JSON schema for validating user inputs
- `model_capabilities`: model-specific optimizations and requirements (JSON)
- `system_prompts`: conditional system prompts based on model capabilities (JSON)
- `provider_configs`: provider-specific configurations (JSON)
- `is_public`: flag to expose the prompt publicly (default: False)
- `ranking`: numeric rating for effectiveness (default: 0.0)
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
from structured_prompts.database import Database
from structured_prompts import SchemaManager

db = Database(url="postgresql://user:pass@localhost/db")
schema_manager = SchemaManager(database=db)
```

Now you can manage prompt schemas using `schema_manager`.
## Advanced Usage

### Custom Schema Types

```python
from structured_prompts import SchemaManager

# Create a complex analysis schema
await schema_manager.create_prompt_schema(
    prompt_id="content_analysis",
    prompt_title="Content Analysis",
    prompt_description="Detailed content analysis with sentiment and insights",
    main_prompt="Perform a detailed analysis of this content.",
    prompt_categories=["analysis", "sentiment"],
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
from structured_prompts.database import Database

db = Database(
    url="postgresql://user:pass@localhost/db",
    min_size=5,
    max_size=20
)

schema_manager = SchemaManager(database=db)

# Batch operations
async def migrate_schemas(old_id: str, new_id: str):
    old_config = await schema_manager.get_prompt_schema(old_id)
    if old_config:
        await schema_manager.create_prompt_schema(
            prompt_id=new_id,
            prompt_title=old_config["prompt_title"] + " (Migrated)",
            prompt_description=old_config.get("prompt_description", ""),
            main_prompt=old_config["main_prompt"],
            response_schema=old_config["response_schema"],
            input_schema=old_config.get("input_schema"),
            model_capabilities=old_config.get("model_capabilities")
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
