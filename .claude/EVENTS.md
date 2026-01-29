# Hook Events Reference

Complete reference of all available hook events in Claude Code.

## Event Types

### PreToolUse
Fires **before** a tool is executed. Useful for validation, formatting, or confirmation prompts.

**Available fields:**
- `includeToolNames` - Array of tool names to match (e.g., `["Write", "Edit", "Bash"]`)
- `includePatterns` - Glob patterns for tool arguments
- `excludePatterns` - Patterns to exclude
- `prompt` - Confirmation prompt message
- `requireConfirmation` - Boolean, show yes/no prompt
- `command` - Shell command to run
- `waitForExit` - Wait for command to complete before proceeding

**Example:**
```json
{
  "PreToolUse": {
    "confirm_delete": {
      "includeToolNames": ["Bash"],
      "includePatterns": ["rm *"],
      "prompt": "Delete files?",
      "requireConfirmation": true
    }
  }
}
```

---

### PostToolUse
Fires **after** a tool completes execution. Useful for builds, tests, notifications.

**Additional fields:**
- `runInBackground` - Run as long-running background task
- `stopOnSessionEnd` - Kill background task when session ends
- `notification` - Notification config with `info`, `success`, `error` messages
- `runIfPreviousSuccess` - Only run if previous hook succeeded
- `outputFormat` - `"json"` or `"text"` for command output

**Example:**
```json
{
  "PostToolUse": {
    "auto_build": {
      "includeToolNames": ["Write"],
      "includePatterns": ["src/**/*.ts"],
      "command": "bun run build",
      "waitForExit": false,
      "notification": {
        "info": "Building...",
        "success": "✓ Build complete",
        "error": "✗ Build failed"
      }
    }
  }
}
```

---

### SessionStart
Fires when a new Claude Code session begins. Useful for initialization tasks.

**Example:**
```json
{
  "SessionStart": {
    "restore_database": {
      "enabled": true,
      "command": "cp test.backup.db test.db 2>/dev/null || true"
    }
  }
}
```

---

### SessionEnd
Fires when the Claude Code session ends. Useful for cleanup tasks.

**Example:**
```json
{
  "SessionEnd": {
    "cleanup_temp": {
      "enabled": true,
      "command": "rm -f /tmp/structured-prompts-*"
    }
  }
}
```

---

### UserPromptSubmit
Fires when the user submits a prompt. Useful for warnings or confirmations.

**Fields:**
- `includePatterns` - Patterns to match in user's prompt text
- `prompt` - Warning/confirmation message
- `requireConfirmation` - Boolean for yes/no prompt

**Example:**
```json
{
  "UserPromptSubmit": {
    "warn_delete_source": {
      "enabled": true,
      "includePatterns": ["delete src/", "remove src/"],
      "prompt": "WARNING: Deleting source files. Continue?",
      "requireConfirmation": true
    }
  }
}
```

---

### PreCompact
Fires before context compaction. Use to protect important files from being compacted.

**Fields:**
- `excludePatterns` - Files to never compact

**Example:**
```json
{
  "PreCompact": {
    "preserve_core": {
      "enabled": true,
      "excludePatterns": [
        "src/index.ts",
        "src/models/schema.ts",
        "src/database/client.ts"
      ]
    }
  }
}
```

---

### Notification
Fires when Claude Code sends a notification. Can intercept or modify notifications.

---

### SubagentStop
Fires when a sub-agent (spawned by Task tool) stops execution.

**Use case:** Process sub-agent results, trigger follow-up actions.

## Template Variables

Available variables in hook commands:

| Variable | Description | Example |
|----------|-------------|---------|
| `{{workspaceFolder}}` | Project root path | `/Users/user/project` |
| `{{filePath}}` | Path of file being operated on | `/Users/user/project/src/index.ts` |
| `{{fileName}}` | Name of file | `index.ts` |
| `{{fileDirname}}` | Directory of file | `/Users/user/project/src` |
| `{{toolName}}` | Name of tool being used | `Write` |

## JSON Output Format

Use `"outputFormat": "json"` to parse command output as JSON for conditional logic:

```json
{
  "PostToolUse": {
    "conditional_action": {
      "enabled": true,
      "outputFormat": "json",
      "command": "test -f {{filePath}} && echo '{\"exists\": true}' || echo '{\"exists\": false}'"
    }
  }
}
```

## Execution Order

Hooks are executed in this order within each event type:

1. `PreToolUse` hooks (in config order)
2. Tool execution
3. `PostToolUse` hooks (in config order, respecting `runIfPreviousSuccess`)
4. `UserPromptSubmit` hooks
5. `PreCompact` hooks (before context compaction)
6. `SessionEnd` hooks

## Error Handling

- Hooks that fail non-fatally log errors but don't block execution
- Use `waitForExit: true` to detect command failures
- Set `critical: true` to make hook failure block session progress
