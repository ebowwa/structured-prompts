/**
 * structured-prompts - Minimal prompt template registry
 *
 * Stores prompt templates with response schemas.
 * Use with MCP or programmatically.
 */

import { z } from "zod";
import { readFileSync, writeFileSync, existsSync } from "fs";

// ====================================================================
// Types
// ====================================================================

export const PromptSchema = z.object({
  id: z.string(),
  name: z.string(),
  template: z.string(),
  responseSchema: z.record(z.any()).optional(),
  metadata: z.record(z.any()).optional(),
});

export type Prompt = z.infer<typeof PromptSchema>;

// ====================================================================
// Store (in-memory with optional file persistence)
// ====================================================================

class PromptStore {
  private prompts = new Map<string, Prompt>();
  private file?: string;

  constructor(file?: string) {
    this.file = file;
    if (file) this.load();
  }

  private load() {
    if (!this.file || !existsSync(this.file)) return;
    try {
      const data = readFileSync(this.file, 'utf-8');
      const parsed = JSON.parse(data);
      for (const p of parsed) this.prompts.set(p.id, p);
    } catch {}
  }

  private save() {
    if (!this.file) return;
    writeFileSync(this.file, JSON.stringify([...this.prompts.values()], null, 2));
  }

  get(id: string): Prompt | undefined {
    return this.prompts.get(id);
  }

  set(prompt: Prompt): void {
    this.prompts.set(prompt.id, PromptSchema.parse(prompt));
    this.save();
  }

  list(): Prompt[] {
    return [...this.prompts.values()];
  }

  delete(id: string): boolean {
    const result = this.prompts.delete(id);
    if (result) this.save();
    return result;
  }
}

// Singleton store
let store: PromptStore | null = null;

export function getStore(file?: string): PromptStore {
  if (!store) store = new PromptStore(file);
  return store;
}

// ====================================================================
// MCP Interface
// ====================================================================

export async function runMcp(file?: string) {
  const { Server } = await import("@modelcontextprotocol/sdk/server/index.js");
  const { StdioServerTransport } = await import("@modelcontextprotocol/sdk/server/stdio.js");
  const { CallToolRequestSchema, ListToolsRequestSchema } = await import("@modelcontextprotocol/sdk/types.js");

  const store = getStore(file);
  const server = new Server({ name: "structured-prompts", version: "0.2.1" }, { capabilities: { tools: {} } });

  server.setRequestHandler(ListToolsRequestSchema, () => ({
    tools: [
      { name: "get_prompt", description: "Get prompt by ID", inputSchema: { type: "object", properties: { id: { type: "string" } }, required: ["id"] } },
      { name: "set_prompt", description: "Create/update prompt", inputSchema: { type: "object", properties: { id: { type: "string" }, name: { type: "string" }, template: { type: "string" }, responseSchema: { type: "object" } }, required: ["id", "name", "template"] } },
      { name: "list_prompts", description: "List all prompts", inputSchema: { type: "object", properties: {} } },
      { name: "delete_prompt", description: "Delete prompt by ID", inputSchema: { type: "object", properties: { id: { type: "string" } }, required: ["id"] } },
    ],
  }));

  server.setRequestHandler(CallToolRequestSchema, async (req) => {
    const { name, arguments: args } = req.params;
    try {
      switch (name) {
        case "get_prompt": {
          const p = store.get(args!.id as string);
          return { content: [{ type: "text", text: p ? JSON.stringify(p, null, 2) : "Not found" }] };
        }
        case "set_prompt": {
          store.set({ id: args!.id as string, name: args!.name as string, template: args!.template as string, responseSchema: args!.responseSchema as any });
          return { content: [{ type: "text", text: `Saved: ${args!.id}` }] };
        }
        case "list_prompts": {
          return { content: [{ type: "text", text: JSON.stringify(store.list(), null, 2) }] };
        }
        case "delete_prompt": {
          const ok = store.delete(args!.id as string);
          return { content: [{ type: "text", text: ok ? "Deleted" : "Not found" }] };
        }
        default:
          return { content: [{ type: "text", text: `Unknown: ${name}` }], isError: true };
      }
    } catch (e: any) {
      return { content: [{ type: "text", text: e.message }], isError: true };
    }
  });

  await server.connect(new StdioServerTransport());
}

// Run MCP if executed directly
if (import.meta.main) runMcp(process.env.PROMPTS_FILE);

// Re-export from seed
export { seedPrompts, SEED_PROMPTS } from "./seed.js";
