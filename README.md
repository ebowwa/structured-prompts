# @ebowwa/structured-prompts

Minimal prompt template registry with MCP interface.

## Usage

```typescript
import { getStore, seedPrompts } from '@ebowwa/structured-prompts';

// Get store (optionally with file path)
const store = getStore('/path/to/prompts.json');

// Seed default prompts
seedPrompts('/path/to/prompts.json');

// CRUD operations
store.set('my-prompt', 'My Prompt', 'Template text here');
const prompt = store.get('my-prompt');
store.delete('my-prompt');
const all = store.list();
```

## MCP Interface

```bash
bun run src/index.ts
```

Runs as an MCP server with tools:
- `get_prompt` - Get prompt by ID
- `set_prompt` - Create/update prompt
- `list_prompts` - List all prompts
- `delete_prompt` - Delete prompt

## API

```typescript
interface Prompt {
  id: string;
  name: string;
  template: string;
  responseSchema?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

function getStore(file?: string): PromptStore;
function seedPrompts(file?: string): void;
async function runMcp(file?: string): Promise<void>;
```

## License

MIT
