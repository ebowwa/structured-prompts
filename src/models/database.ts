/**
 * Database type definitions for structured prompts
 */

// Database record types
export interface PromptSchemaDB {
  prompt_id: string;
  prompt_title: string;
  prompt_description: string | null;
  prompt_categories: string | null; // JSON stringified
  main_prompt: string;
  model_instruction: string | null;
  additional_messages: string | null; // JSON stringified
  response_schema: string; // JSON stringified
  is_public: number; // 0 or 1
  ranking: number;
  last_used: number | null;
  usage_count: number;
  created_at: number;
  created_by: string | null;
  last_updated: number | null;
  last_updated_by: string | null;
  provider_configs: string | null; // JSON stringified
  model_capabilities: string | null; // JSON stringified
  input_schema: string | null; // JSON stringified
  system_prompts: string | null; // JSON stringified
}

export interface PromptResponseDB {
  response_id: string;
  prompt_id: string;
  raw_response: string; // JSON stringified
  created_at: number;
}

// Insert types (matches database column names)
export interface PromptSchemaInsert {
  promptId: string;
  promptTitle: string;
  promptDescription?: string | null;
  promptCategories?: unknown;
  mainPrompt: string;
  modelInstruction?: string | null;
  additionalMessages?: unknown;
  responseSchema: Record<string, unknown>;
  isPublic?: boolean;
  ranking?: number;
  lastUsed?: number | null;
  usageCount?: number;
  createdAt?: number;
  createdBy?: string | null;
  lastUpdated?: number | null;
  lastUpdatedBy?: string | null;
  providerConfigs?: Record<string, unknown>;
  modelCapabilities?: Record<string, unknown>;
  inputSchema?: Record<string, unknown>;
  systemPrompts?: unknown;
}

export interface PromptResponseInsert {
  responseId: string;
  promptId: string;
  rawResponse: Record<string, unknown>;
  createdAt?: number;
}
