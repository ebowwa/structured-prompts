# Structured Prompts - TypeScript

A modular package for managing structured prompts with TypeScript/Node.js. This is a TypeScript port of the Python `structured-prompts` package.

## Features

- **Type-safe**: Built with TypeScript and Zod for runtime validation
- **ORM Agnostic**: Uses Drizzle ORM supporting both SQLite and PostgreSQL
- **MCP Support**: Built-in Model Context Protocol server interface
- **Edge Ready**: Optimized for Bun runtime with Edge compatibility
- **Validation**: JSON schema validation for inputs and responses

## Installation

```bash
bun install structured-prompts
```

## Quick Start

```typescript
import { SchemaManager, createDatabase, PromptSchema } from "structured-prompts";

// Create database connection
const db = await createDatabase({
  url: "sqlite:///./prompts.db"
});

// Create schema manager
const manager = new SchemaManager({ database: db });

// Create a prompt schema
const schema = await manager.createPromptSchema({
  promptId: "my-prompt",
  promptTitle: "My Custom Prompt",
  promptText: "You are a helpful assistant.",
  responseSchema: {
    type: "object",
    properties: {
      answer: { type: "string" }
    }
  }
});

// Retrieve a schema
const retrieved = await manager.getPromptSchema("my-prompt");
```

## Architecture

```
src/
├── index.ts                 # Main exports
├── models/
│   ├── schema.ts           # Zod schemas + TypeScript types
│   └── database.ts         # Drizzle ORM schema
├── database/
│   └── client.ts          # Database connection wrapper
├── managers/
│   └── schema-manager.ts  # Core business logic
├── validation/
│   └── input-validator.ts # Input validation
├── capabilities/
│   └── model-config.ts    # Model-specific configs
└── interfaces/
    └── mcp.ts             # MCP server implementation
```

## Database Support

### SQLite (default)
```typescript
const db = await createDatabase({
  url: "sqlite:///./prompts.db"
});
```

### PostgreSQL
```typescript
const db = await createDatabase({
  url: "postgresql://user:pass@localhost/dbname"
});
```

## MCP Server

Run the built-in MCP server:

```bash
bun run mcp
```

Or programmatically:

```typescript
import { MCPInterface } from "structured-prompts";

const mcp = new MCPInterface(process.env.DATABASE_URL);
await mcp.run();
```

## Development

```bash
# Install dependencies
bun install

# Run tests
bun test

# Build
bun run build

# Development mode
bun run dev
```

## License

MIT
