# Claude Code Hooks Configuration

This directory contains hooks and configuration for Claude Code when working on the `structured-prompts-ts` project.

## What are Hooks?

Hooks run shell commands at specific points during your Claude Code session. They can:
- Run builds/tests automatically after file changes
- Confirm dangerous operations
- Format code before git commits
- Send notifications about long-running tasks

## Hooks Configuration

### PostToolUse Hooks

| Hook | Description | Trigger |
|-----|-------------|---------|
| `build_after_edit` | Auto-run `bun run build` after editing TypeScript files | After `Write`/`Edit` on `src/**/*.ts` |
| `run_tests_after_edit` | Auto-run tests after editing test files (disabled by default) | After `Write`/`Edit` on `**/*.test.ts` |

### PreToolUse Hooks

| Hook | Description | Trigger |
|-----|-------------|---------|
| `format_before_git` | Build before git operations | Before `Bash` with `git commit*` or `git add *` |
| `confirm_database_deletion` | Confirm before deleting database files | Before `Bash` with `rm *.db` |

### UserPromptSubmit Hooks

| Hook | Description | Trigger |
|-----|-------------|---------|
| `prevent_source_deletion` | Warn about deleting source files | User prompt contains "delete src/" |
| `prevent_package_deletion` | Warn about deleting dependency files | User prompt contains "delete node_modules" |

### PreCompact Hooks

| Hook | Description |
|-----|-------------|
| `preserve_source_maps` | Don't compact generated `.map` files |

## Configuration Files

- **`config.json`** - Main hooks configuration (JSON Schema validated)
- **`LOCAL.md`** - Project-specific local settings with YAML frontmatter
- **`ADVANCED.md`** - Advanced hook patterns (optional)
- **`EVENTS.md`** - Reference documentation for all hook events

## Disabling Hooks

To temporarily disable a hook, set `"enabled": false` in `config.json`:

```json
{
  "hooks": {
    "PostToolUse": {
      "run_tests_after_edit": {
        "enabled": false
      }
    }
  }
}
```

## Customizing Hooks

You can modify the hooks in `config.json` to:
- Change the command that runs
- Add/remove file patterns
- Customize notification messages
- Adjust `waitForExit` behavior

## Example: Adding a Custom Hook

```json
{
  "PostToolUse": {
    "my_custom_hook": {
      "description": "Run my custom script",
      "enabled": true,
      "includeToolNames": ["Write"],
      "includePatterns": ["src/**/*"],
      "command": "echo 'File changed: {{filePath}}' >> changes.log",
      "waitForExit": false
    }
  }
}
```
