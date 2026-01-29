/**
 * Zod schemas and TypeScript types for prompt validation
 */

import { z } from "zod";

// ====================================================================
// Message Schema
// ====================================================================

export const MessageSchema = z.object({
  role: z.enum(["system", "user", "assistant", "tool"]),
  content: z.string(),
});

export type Message = z.infer<typeof MessageSchema>;

// ====================================================================
// Prompt Schema (Pydantic PromptSchema equivalent)
// ====================================================================

export const PromptSchemaSchema = z.object({
  promptId: z.string().describe("Unique identifier for this prompt"),
  promptType: z.string().describe("Type/category of the prompt"),
  promptDescription: z.string().nullish().default("").describe("Detailed description of the prompt's purpose and usage"),
  promptCategories: z.array(z.string()).nullish().default([]).describe("Categories/tags for organizing prompts"),
  promptText: z.string().describe("The primary prompt/instruction text"),
  modelInstruction: z.string().nullish().describe("Specific instructions for model behavior"),
  additionalMessages: z.array(MessageSchema).nullish().describe("Additional context messages in role:content format"),
  responseSchema: z.record(z.any()).nullish().default({}).describe("JSON schema for validating responses"),
  isPublic: z.boolean().nullish().default(false).describe("Whether this prompt is publicly accessible"),
  ranking: z.number().nullish().default(0).describe("Prompt effectiveness ranking (0-1)"),
  lastUsed: z.number().nullish().describe("Timestamp of last usage"),
  usageCount: z.number().nullish().default(0).describe("Number of times this prompt has been used"),
  createdAt: z.number().nullish().default(() => Math.floor(Date.now() / 1000)).describe("Creation timestamp"),
  createdBy: z.string().nullish().describe("User ID of creator"),
  lastUpdated: z.number().nullish().describe("Last update timestamp"),
  lastUpdatedBy: z.string().nullish().describe("User ID of last updater"),
  providerConfigs: z.record(z.any()).nullish().default({}).describe("Provider-specific configurations"),
  modelCapabilities: z.record(z.any()).nullish().default({}).describe("Model-specific capabilities and requirements"),
  inputSchema: z.record(z.any()).nullish().describe("JSON schema for validating user inputs"),
  systemPrompts: z.array(z.record(z.any())).nullish().default([]).describe("Collection of system prompts with conditions"),
});

export type PromptSchema = z.infer<typeof PromptSchemaSchema>;

// ====================================================================
// Prompt Response (Pydantic PromptResponse equivalent)
// ====================================================================

export const PromptResponseSchema = z.object({
  responseId: z.string().nullish().default(() => `resp_${Date.now()}`).describe("Unique identifier for this response"),
  promptId: z.string().nullish().describe("Reference to the prompt that generated this response"),
  rawResponse: z.record(z.any()).nullish().default({}).describe("Raw response data with arbitrary structure"),
  createdAt: z.number().nullish().default(() => Math.floor(Date.now() / 1000)).describe("Response creation timestamp"),
}).passthrough(); // Allow additional fields

export type PromptResponse = z.infer<typeof PromptResponseSchema>;

// ====================================================================
// Helper functions
// ====================================================================

/**
 * Validate a prompt schema against the Zod schema
 */
export function validatePromptSchema(data: unknown): PromptSchema {
  return PromptSchemaSchema.parse(data);
}

/**
 * Validate a prompt response against the Zod schema
 */
export function validatePromptResponse(data: unknown): PromptResponse {
  return PromptResponseSchema.parse(data);
}

/**
 * Safely parse a prompt schema, returning null if invalid
 */
export function safeParsePromptSchema(data: unknown): PromptSchema | null {
  const result = PromptSchemaSchema.safeParse(data);
  return result.success ? result.data : null;
}

/**
 * Safely parse a prompt response, returning null if invalid
 */
export function safeParsePromptResponse(data: unknown): PromptResponse | null {
  const result = PromptResponseSchema.safeParse(data);
  return result.success ? result.data : null;
}
