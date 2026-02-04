"use strict";
/**
 * Zod schemas and TypeScript types for prompt validation
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PromptResponseSchema = exports.PromptSchemaSchema = exports.MessageSchema = void 0;
exports.validatePromptSchema = validatePromptSchema;
exports.validatePromptResponse = validatePromptResponse;
exports.safeParsePromptSchema = safeParsePromptSchema;
exports.safeParsePromptResponse = safeParsePromptResponse;
var zod_1 = require("zod");
// ====================================================================
// Message Schema
// ====================================================================
exports.MessageSchema = zod_1.z.object({
    role: zod_1.z.enum(["system", "user", "assistant", "tool"]),
    content: zod_1.z.string(),
});
// ====================================================================
// Prompt Schema (Pydantic PromptSchema equivalent)
// ====================================================================
exports.PromptSchemaSchema = zod_1.z.object({
    promptId: zod_1.z.string().describe("Unique identifier for this prompt"),
    promptType: zod_1.z.string().describe("Type/category of the prompt"),
    promptDescription: zod_1.z.string().nullish().default("").describe("Detailed description of the prompt's purpose and usage"),
    promptCategories: zod_1.z.array(zod_1.z.string()).nullish().default([]).describe("Categories/tags for organizing prompts"),
    promptText: zod_1.z.string().describe("The primary prompt/instruction text"),
    modelInstruction: zod_1.z.string().nullish().describe("Specific instructions for model behavior"),
    additionalMessages: zod_1.z.array(exports.MessageSchema).nullish().describe("Additional context messages in role:content format"),
    responseSchema: zod_1.z.record(zod_1.z.any()).nullish().default({}).describe("JSON schema for validating responses"),
    isPublic: zod_1.z.boolean().nullish().default(false).describe("Whether this prompt is publicly accessible"),
    ranking: zod_1.z.number().nullish().default(0).describe("Prompt effectiveness ranking (0-1)"),
    lastUsed: zod_1.z.number().nullish().describe("Timestamp of last usage"),
    usageCount: zod_1.z.number().nullish().default(0).describe("Number of times this prompt has been used"),
    createdAt: zod_1.z.number().nullish().default(function () { return Math.floor(Date.now() / 1000); }).describe("Creation timestamp"),
    createdBy: zod_1.z.string().nullish().describe("User ID of creator"),
    lastUpdated: zod_1.z.number().nullish().describe("Last update timestamp"),
    lastUpdatedBy: zod_1.z.string().nullish().describe("User ID of last updater"),
    providerConfigs: zod_1.z.record(zod_1.z.any()).nullish().default({}).describe("Provider-specific configurations"),
    modelCapabilities: zod_1.z.record(zod_1.z.any()).nullish().default({}).describe("Model-specific capabilities and requirements"),
    inputSchema: zod_1.z.record(zod_1.z.any()).nullish().describe("JSON schema for validating user inputs"),
    systemPrompts: zod_1.z.array(zod_1.z.record(zod_1.z.any())).nullish().default([]).describe("Collection of system prompts with conditions"),
});
// ====================================================================
// Prompt Response (Pydantic PromptResponse equivalent)
// ====================================================================
exports.PromptResponseSchema = zod_1.z.object({
    responseId: zod_1.z.string().nullish().default(function () { return "resp_".concat(Date.now()); }).describe("Unique identifier for this response"),
    promptId: zod_1.z.string().nullish().describe("Reference to the prompt that generated this response"),
    rawResponse: zod_1.z.record(zod_1.z.any()).nullish().default({}).describe("Raw response data with arbitrary structure"),
    createdAt: zod_1.z.number().nullish().default(function () { return Math.floor(Date.now() / 1000); }).describe("Response creation timestamp"),
}).passthrough(); // Allow additional fields
// ====================================================================
// Helper functions
// ====================================================================
/**
 * Validate a prompt schema against the Zod schema
 */
function validatePromptSchema(data) {
    return exports.PromptSchemaSchema.parse(data);
}
/**
 * Validate a prompt response against the Zod schema
 */
function validatePromptResponse(data) {
    return exports.PromptResponseSchema.parse(data);
}
/**
 * Safely parse a prompt schema, returning null if invalid
 */
function safeParsePromptSchema(data) {
    var result = exports.PromptSchemaSchema.safeParse(data);
    return result.success ? result.data : null;
}
/**
 * Safely parse a prompt response, returning null if invalid
 */
function safeParsePromptResponse(data) {
    var result = exports.PromptResponseSchema.safeParse(data);
    return result.success ? result.data : null;
}
