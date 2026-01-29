---
# Structured Prompts TypeScript - Local Configuration

This file contains project-specific settings that override default Claude Code behavior.

## Project Settings

```yaml
# TypeScript/Bun runtime
runtime: bun

# Build output
outDir: ./dist

# Test patterns
testPatterns:
  - "**/*.test.ts"
  - "**/*.spec.ts"
  - "test/**/*.ts"

# Important files to never compact
preserveFiles:
  - "src/index.ts"
  - "src/models/schema.ts"
  - "src/database/client.ts"
  - "src/managers/schema-manager.ts"
```

## Development Notes

- **Database Files**: Test databases (*.db) are created in the project root during testing
- **Build Output**: Compiled JavaScript goes to `dist/` directory
- **Auto-Build**: Hooks automatically run `bun run build` after editing TypeScript files
