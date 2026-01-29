# Test Prompt for Structured Prompts TypeScript

Copy and paste the text below into a **new Claude Code instance** to test the library.

---

## Test Prompt

```
I want to test the structured-prompts TypeScript library located at:

  /Users/ebowwa/Desktop/codespaces/structured-prompts-ts

This is a library for managing structured LLM prompts with database persistence, validation, and model-specific configurations.

## Library Features

- SchemaManager: Create, read, update, delete prompt schemas
- Database: SQLite (Bun) and PostgreSQL support
- Validation: JSON schema, text constraints, code syntax
- Model Configs: Predefined configs for glm-4.7, claude-3-opus, gpt-4, gemini-pro, o1
- MCP Server: Model Context Protocol interface
- Type Safety: Full Zod validation

## What I Want You To Do

1. **Explore the codebase** - Read src/index.ts to understand the exports

2. **Create a demo script** at `src/my-demo.ts` that:
   - Creates a Database connection (SQLite)
   - Creates a SchemaManager
   - Creates 2-3 different prompt schemas with various features
   - Demonstrates retrieving schemas by ID
   - Shows the validation capabilities
   - Demonstrates model configuration features
   - Cleans up (deletes test schemas)

3. **Run the demo** with bun and show me the output

4. **Show me** the created demo file contents

## Example Schema to Create

Create a "code-analyzer" schema with:
- promptId: "code-analyzer"
- Title: "Code Quality Analyzer"
- Categories: ["development", "code-quality", "static-analysis"]
- Response schema with: findings (array), score (number 1-100), recommendations (array)
- isPublic: true
- Model capabilities showing it supports function calling

Get creative! Make it demonstrate the library's capabilities.
```

---

## Quick Version (Shorter Prompt)

If you want something shorter, use this:

```
Test the structured-prompts TypeScript library at /Users/ebowwa/Desktop/codespaces/structured-prompts-ts

Create a demo that shows:
1. Creating prompt schemas with SchemaManager
2. Using the glm-4.7 model config
3. Validating inputs with Zod
4. Running it with bun

Show me the code and output.
```
