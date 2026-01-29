# Structured Prompts TypeScript - Test Prompt

Copy and paste this prompt into a new Claude Code instance to test the library.

---

## Context

You are testing the `structured-prompts-ts` library - a TypeScript port of the Python structured-prompts package. The project is located at `/Users/ebowwa/Desktop/codespaces/structured-prompts-ts`.

## Project Overview

The library provides:
- **SchemaManager**: Core API for managing prompt schemas
- **Database**: SQLite (via Bun) and PostgreSQL support
- **Zod Validation**: Type-safe schema validation
- **Model Configurations**: Predefined configs for Claude, GPT-4, Gemini, O1
- **MCP Server**: Model Context Protocol interface

## File Structure

```
src/
├── index.ts              # Main exports
├── models/
│   ├── database.ts       # Database type definitions
│   └── schema.ts         # Zod schemas
├── database/
│   └── client.ts         # Database wrapper (Bun SQLite + PG)
├── managers/
│   └── schema-manager.ts # Core business logic
├── validation/
│   └── input-validator.ts
├── capabilities/
│   └── model-config.ts
└── interfaces/
    └── mcp.ts
```

## Test Tasks

Please complete the following tasks to verify the library works correctly:

### Task 1: Create a Test File

Create a file `src/demo.ts` that demonstrates basic usage:

```typescript
import { Database, SchemaManager } from "./index.js";

async function demo() {
  // Create database connection
  const db = new Database({ url: "sqlite:///./demo.db" });
  await db.connect();

  // Create schema manager
  const manager = new SchemaManager({ database: db });

  // Create a prompt schema
  const schema = await manager.createPromptSchema({
    promptId: "code-review-1",
    promptTitle: "Code Review Assistant",
    promptText: "You are an expert code reviewer. Analyze the given code for bugs, security issues, and improvements.",
    responseSchema: {
      type: "object",
      properties: {
        summary: { type: "string", description: "Brief review summary" },
        issues: { type: "array", items: { type: "object" } } },
        rating: { type: "number", minimum: 1, maximum: 10 }
      }
    },
    modelCapabilities: {
      supportsFunctionCalling: true,
      supportsVision: false
    }
  });

  console.log("Created schema:", schema.promptId);

  await db.disconnect();
}

demo();
```

### Task 2: Run the Demo

Execute the demo file with `bun run src/demo.ts` and verify it works.

### Task 3: Add a Second Schema

Add another schema for "test-generation" with:
- promptId: "test-generator-1"
- Response schema with `testCases` array and `coverage` percentage
- Set `isPublic: true`
- Add some `promptCategories`

### Task 4: List and Retrieve

Show code that:
1. Lists all schemas (should show 2)
2. Retrieves the "code-review-1" schema by ID
3. Prints the retrieved schema's `promptText`

### Task 5: Update a Schema

Update the "code-review-1" schema to add a `modelInstruction` field:
```
"Focus on security vulnerabilities and performance issues."
```

### Task 6: Test Validation

Show an example of using the validation functions from `src/validation/index.ts`:
1. Validate a JSON input against a schema
2. Validate text input with constraints (minLength, pattern)
3. Show the validation results

### Task 7: Test Model Capabilities

Use the predefined model configs from `src/capabilities/index.ts`:
1. Get the "claude-3-opus" config
2. Check if it supports thinking mode
3. Print the special tokens

### Task 8: Clean Up

Delete both test schemas and close the database connection properly.

---

## Expected Output

After completing these tasks, you should have:
1. A working `demo.ts` file
2. Two schemas created and retrievable
3. Demonstrated validation capabilities
4. Shown model configuration features
5. Clean database state

## Notes

- The library uses Bun's native SQLite - no compilation needed
- Zod schemas use `.nullish()` for optional fields (allows null/undefined)
- Database columns are snake_case, but the API uses camelCase
- The build runs automatically via hooks after TypeScript file changes

## Verification

To verify everything works, run:
```bash
cd /Users/ebowwa/Desktop/codespaces/structured-prompts-ts
bun run src/demo.ts
```
