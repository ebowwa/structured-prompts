# Advanced Hook Patterns

This file demonstrates advanced hook configurations for the structured-prompts-ts project.

## Background Tasks

Run long-running tasks in the background without blocking Claude:

```json
{
  "PostToolUse": {
    "background_watch": {
      "description": "Run bun in watch mode in background",
      "enabled": true,
      "runInBackground": true,
      "command": "cd {{workspaceFolder}} && bun --watch src/index.ts",
      "stopOnSessionEnd": true
    }
  }
}
```

## Conditional Hooks

Use JSON output format for conditional logic based on file content:

```json
{
  "PostToolUse": {
    "conditional_format": {
      "description": "Format only if file has syntax errors",
      "enabled": true,
      "outputFormat": "json",
      "command": "cd {{workspaceFolder}} && bun run lint {{filePath}} || echo '{\"needsFormat\": true}'"
    }
  }
}
```

## Hook Chains

Run multiple hooks in sequence by using `waitForExit: true`:

```json
{
  "PostToolUse": {
    "step1_test": {
      "description": "Step 1: Run tests",
      "enabled": true,
      "includeToolNames": ["Write"],
      "includePatterns": ["src/**/*.ts"],
      "command": "cd {{workspaceFolder}} && bun test",
      "waitForExit": true,
      "runIfPreviousSuccess": true
    },
    "step2_build": {
      "description": "Step 2: Build (only if tests pass)",
      "enabled": true,
      "includeToolNames": ["Write"],
      "includePatterns": ["src/**/*.ts"],
      "command": "cd {{workspaceFolder}} && bun run build",
      "waitForExit": true,
      "runIfPreviousSuccess": true
    }
  }
}
```

## File Watching Patterns

Use complex glob patterns for precise matching:

```json
{
  "PostToolUse": {
    "models_only": {
      "description": "Only process model file changes",
      "enabled": true,
      "includePatterns": [
        "src/models/**/*.ts",
        "!src/models/**/*.test.ts",
        "!src/models/**/*.spec.ts"
      ],
      "excludePatterns": ["dist/**", "node_modules/**"]
    }
  }
}
```

## Environment-Specific Hooks

Use environment variables in hook commands:

```json
{
  "PostToolUse": {
    "notify_on_deploy": {
      "description": "Send notification on production builds",
      "enabled": true,
      "includePatterns": ["src/index.ts"],
      "command": "if [ \"$NODE_ENV\" = \"production\" ]; then echo 'Deploying to production'; fi",
      "notification": {
        "info": "Production build detected",
        "success": "✓ Production build complete"
      }
    }
  }
}
```

## Database Backup Hook

Automatically backup database before running tests:

```json
{
  "PreToolUse": {
    "backup_db_before_test": {
      "description": "Backup database before running tests",
      "enabled": true,
      "includeToolNames": ["Bash"],
      "includePatterns": ["bun test"],
      "command": "cd {{workspaceFolder}} && cp test.db test.db.backup 2>/dev/null || true"
    }
  }
}
```

## MCP Integration

Trigger MCP server actions based on file changes:

```json
{
  "PostToolUse": {
    "reload_mcp": {
      "description": "Restart MCP server after interface changes",
      "enabled": true,
      "includePatterns": ["src/interfaces/mcp.ts"],
      "command": "pkill -f 'bun.*mcp' 2>/dev/null; cd {{workspaceFolder}} && bun run src/interfaces/mcp.ts &",
      "waitForExit": false
    }
  }
}
```
