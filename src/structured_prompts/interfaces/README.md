# Structured Prompts Interfaces

This directory contains interfaces for integrating structured prompts with various LLM providers and protocols.

## MCP (Model Context Protocol) Interface

The MCP interface allows you to expose structured prompt management capabilities through the Model Context Protocol, enabling seamless integration with MCP-compatible LLM clients.

### Features

- Create, read, update, and delete prompt schemas
- List all available prompt schemas with pagination
- Full async support
- JSON schema validation for responses

### Usage

#### As a standalone server

```bash
# Install the package
pip install structured-prompts

# Run the MCP server
structured-prompts-mcp
```

#### Programmatic usage

```python
import asyncio
from src.interfaces.mcp import MCPInterface

async def main():
    # Initialize with custom database URL
    interface = MCPInterface(database_url="postgresql://user:pass@localhost/prompts")
    
    # Run the server
    await interface.run()

asyncio.run(main())
```

### Available Tools

1. **create_prompt_schema** - Create a new prompt schema with validation
2. **get_prompt_schema** - Retrieve a specific prompt schema by ID
3. **list_prompt_schemas** - List all schemas with pagination support
4. **update_prompt_schema** - Update an existing prompt schema
5. **delete_prompt_schema** - Delete a prompt schema

### Environment Variables

- `DATABASE_URL` - Database connection URL (defaults to SQLite)

### MCP Client Configuration

To use this with an MCP client, add to your client configuration:

```json
{
  "mcpServers": {
    "structured-prompts": {
      "command": "structured-prompts-mcp",
      "env": {
        "DATABASE_URL": "your-database-url"
      }
    }
  }
}
```