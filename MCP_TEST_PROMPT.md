# MCP Test Prompt for Structured Prompts TypeScript

Copy this into a new Claude Code instance to test the MCP server functionality.

---

## MCP Server Test Prompt

```
I want to test the MCP (Model Context Protocol) server for the structured-prompts TypeScript library.

The library is located at: /Users/ebowwa/Desktop/codespaces/structured-prompts-ts

## The MCP Server

The MCP server is at: src/interfaces/mcp.ts

It exposes these tools:
- create_prompt_schema: Create a new prompt schema
- get_prompt_schema: Retrieve a prompt schema by ID
- list_prompt_schemas: List all available schemas
- update_prompt_schema: Update an existing schema
- delete_prompt_schema: Delete a schema

## What I Want You To Do

1. First, START the MCP server by running:
   cd /Users/ebowwa/Desktop/codespaces/structured-prompts-ts
   bun run src/interfaces/mcp.ts

2. Then USE the MCP tools that are now available to:
   - Create a prompt schema (use create_prompt_schema)
   - List all schemas (use list_prompt_schemas)
   - Get a specific schema by ID (use get_prompt_schema)
   - Update the schema (use update_prompt_schema)
   - Delete the schema (use delete_prompt_schema)

The server runs on stdio, so once it's started, the MCP tools should become available to you.

Show me each step and the results you get from calling the MCP tools.
```

---

## Alternative: If MCP Tools Don't Auto-Connect

```
I want to test the MCP server at: /Users/ebowwa/Desktop/codespaces/structured-prompts-ts/src/interfaces/mcp.ts

Please:
1. Read the MCP server code to understand what tools it exposes
2. Start the server with: bun run src/interfaces/mcp.ts
3. In a separate terminal or by sending stdin messages, test the MCP protocol:
   - Call the tools/create_prompt_schema tool
   - Call tools/list_prompt_schemas
   - Call tools/get_prompt_schema
   - Show me the JSON responses

The server uses stdio transport for the MCP protocol.
```

---

## Key Point

The MCP server runs on **stdio** (standard input/output), not HTTP. Once you start it with `bun run src/interfaces/mcp.ts`, the MCP tools become available through the Model Context Protocol interface.

Look for the MCP tools becoming available after starting the server - they should appear as callable tools in your interface.
