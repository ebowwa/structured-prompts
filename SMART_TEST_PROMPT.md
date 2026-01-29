# Smart Test Prompt - Works With or Without MCP Configuration

Copy this into a new Claude Code instance.

---

```
I want to test the structured-prompts TypeScript library at:

  /Users/ebowwa/Desktop/codespaces/structured-prompts-ts

This library has an MCP server that exposes tools for managing prompt schemas.

## First, Check Your Available Tools

Can you see if you have access to any of these MCP tools:
- create_prompt_schema
- get_prompt_schema
- list_prompt_schemas
- update_prompt_schema
- delete_prompt_schema

### If YES - You have MCP tools available:

Great! Please use the MCP tools to:
1. Create a prompt schema with these details:
   - prompt_id: "test-code-reviewer"
   - prompt_title: "Code Reviewer"
   - main_prompt: "Review the code for bugs and improvements"
   - response_schema: {"type":"object","properties":{"summary":{"type":"string"},"rating":{"type":"number"}}}

2. List all schemas to verify it was created

3. Get the schema by ID to see the full details

4. Delete the test schema

Show me the tool calls and responses.

### If NO - You don't have MCP tools:

That's okay! The MCP server might not be configured yet. Please test the library directly:

1. Read src/index.ts to understand the API

2. Create a test script that:
   - Creates a Database and SchemaManager
   - Creates the same "test-code-reviewer" schema
   - Lists, retrieves, and deletes it
   - Uses the validation functions
   - Shows the glm-4.7 model config

3. Run it with bun and show the output

---

Either way, show me what the library can do!
```

---

## Expected Behavior

**With MCP configured:** Claude will use the MCP tools directly
**Without MCP:** Claude will fall back to testing the SchemaManager API

---

## To Configure MCP (Optional)

If you want to enable the MCP tools, add this to your Claude Code MCP settings:

```json
{
  "mcpServers": {
    "structured-prompts": {
      "command": "bun",
      "args": ["run", "/Users/ebowwa/Desktop/codespaces/structured-prompts-ts/src/interfaces/mcp.ts"],
      "env": {
        "DATABASE_URL": "sqlite:///./structured_prompts.db"
      }
    }
  }
}
```

Then restart Claude Code for the tools to appear.
