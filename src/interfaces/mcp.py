"""Model Context Protocol (MCP) interface for structured prompts.

This module provides an MCP server implementation that exposes structured
prompt management capabilities through the Model Context Protocol.
"""

import json
from typing import Any, Dict, List, Optional
from mcp.server import Server, NotificationOptions
from mcp.server.models import InitializationOptions
import mcp.server.stdio
import mcp.types as types

from ..database import Database
from ..models import PromptSchemaDB
from ..schema_manager import SchemaManager
from ..model_capabilities import get_model_config, should_use_thinking_mode
from ..input_validation import validate_user_input, InputValidation


class MCPInterface:
    """MCP server interface for structured prompts management."""
    
    def __init__(self, database_url: Optional[str] = None):
        """Initialize the MCP interface.
        
        Args:
            database_url: Database connection URL. If None, uses default SQLite.
        """
        self.server = Server("structured-prompts")
        self.db = Database(url=database_url)
        self.schema_manager = SchemaManager(self.db)
        self._setup_handlers()
    
    def _setup_handlers(self):
        """Set up MCP tool handlers."""
        
        @self.server.list_tools()
        async def handle_list_tools() -> List[types.Tool]:
            """List available tools."""
            return [
                types.Tool(
                    name="create_prompt_schema",
                    description="Create a new prompt schema",
                    inputSchema={
                        "type": "object",
                        "properties": {
                            "prompt_id": {"type": "string", "description": "Unique identifier for the prompt"},
                            "prompt_title": {"type": "string", "description": "Title of the prompt"},
                            "main_prompt": {"type": "string", "description": "The main prompt text"},
                            "response_schema": {"type": "object", "description": "JSON schema for response validation"},
                            "system_instructions": {"type": "string", "description": "System instructions for the LLM"},
                            "context": {"type": "string", "description": "Additional context for the prompt"},
                            "model_capabilities": {"type": "object", "description": "Model-specific capabilities"},
                            "input_schema": {"type": "object", "description": "Schema for validating user inputs"},
                            "system_prompts": {"type": "array", "description": "Collection of conditional system prompts"},
                        },
                        "required": ["prompt_id", "prompt_title", "main_prompt", "response_schema"]
                    }
                ),
                types.Tool(
                    name="get_prompt_schema",
                    description="Retrieve a prompt schema by ID",
                    inputSchema={
                        "type": "object",
                        "properties": {
                            "prompt_id": {"type": "string", "description": "ID of the prompt to retrieve"}
                        },
                        "required": ["prompt_id"]
                    }
                ),
                types.Tool(
                    name="list_prompt_schemas",
                    description="List all available prompt schemas",
                    inputSchema={
                        "type": "object",
                        "properties": {
                            "limit": {"type": "integer", "description": "Maximum number of schemas to return", "default": 100},
                            "offset": {"type": "integer", "description": "Number of schemas to skip", "default": 0}
                        }
                    }
                ),
                types.Tool(
                    name="update_prompt_schema",
                    description="Update an existing prompt schema",
                    inputSchema={
                        "type": "object",
                        "properties": {
                            "prompt_id": {"type": "string", "description": "ID of the prompt to update"},
                            "prompt_title": {"type": "string", "description": "New title"},
                            "main_prompt": {"type": "string", "description": "New main prompt"},
                            "response_schema": {"type": "object", "description": "New response schema"},
                            "system_instructions": {"type": "string", "description": "New system instructions"},
                            "context": {"type": "string", "description": "New context"},
                        },
                        "required": ["prompt_id"]
                    }
                ),
                types.Tool(
                    name="delete_prompt_schema",
                    description="Delete a prompt schema",
                    inputSchema={
                        "type": "object",
                        "properties": {
                            "prompt_id": {"type": "string", "description": "ID of the prompt to delete"}
                        },
                        "required": ["prompt_id"]
                    }
                ),
            ]
        
        @self.server.call_tool()
        async def handle_call_tool(
            name: str, arguments: Optional[Dict[str, Any]]
        ) -> List[types.TextContent]:
            """Handle tool calls."""
            if not await self.db.is_connected():
                await self.db.connect()
            
            try:
                if name == "create_prompt_schema":
                    schema = PromptSchemaDB(**arguments)
                    await self.db.create_schema(schema)
                    return [types.TextContent(
                        type="text",
                        text=f"Created prompt schema with ID: {schema.prompt_id}"
                    )]
                
                elif name == "get_prompt_schema":
                    schema = await self.db.get_schema(arguments["prompt_id"])
                    if schema:
                        return [types.TextContent(
                            type="text",
                            text=json.dumps(schema.dict(), indent=2)
                        )]
                    else:
                        return [types.TextContent(
                            type="text",
                            text=f"Prompt schema not found: {arguments['prompt_id']}"
                        )]
                
                elif name == "list_prompt_schemas":
                    limit = arguments.get("limit", 100)
                    offset = arguments.get("offset", 0)
                    schemas = await self.db.list_schemas(limit=limit, offset=offset)
                    return [types.TextContent(
                        type="text",
                        text=json.dumps([s.dict() for s in schemas], indent=2)
                    )]
                
                elif name == "update_prompt_schema":
                    prompt_id = arguments.pop("prompt_id")
                    existing = await self.db.get_schema(prompt_id)
                    if not existing:
                        return [types.TextContent(
                            type="text",
                            text=f"Prompt schema not found: {prompt_id}"
                        )]
                    
                    # Update only provided fields
                    for key, value in arguments.items():
                        if value is not None:
                            setattr(existing, key, value)
                    
                    await self.db.update_schema(prompt_id, existing)
                    return [types.TextContent(
                        type="text",
                        text=f"Updated prompt schema: {prompt_id}"
                    )]
                
                elif name == "delete_prompt_schema":
                    await self.db.delete_schema(arguments["prompt_id"])
                    return [types.TextContent(
                        type="text",
                        text=f"Deleted prompt schema: {arguments['prompt_id']}"
                    )]
                
                else:
                    return [types.TextContent(
                        type="text",
                        text=f"Unknown tool: {name}"
                    )]
                    
            except Exception as e:
                return [types.TextContent(
                    type="text",
                    text=f"Error: {str(e)}"
                )]
    
    async def run(self):
        """Run the MCP server."""
        async with mcp.server.stdio.stdio_server() as (read_stream, write_stream):
            await self.server.run(
                read_stream,
                write_stream,
                InitializationOptions(
                    server_name="structured-prompts",
                    server_version="0.1.0",
                    capabilities=self.server.get_capabilities(
                        notification_options=NotificationOptions(),
                        experimental_capabilities={},
                    )
                )
            )


async def main():
    """Main entry point for the MCP server."""
    import os
    
    database_url = os.getenv("DATABASE_URL")
    interface = MCPInterface(database_url)
    await interface.run()


if __name__ == "__main__":
    import asyncio
    asyncio.run(main())