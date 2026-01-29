/**
 * Structured Prompts - A modular package for managing structured prompts
 *
 * This is the main entry point for the library, exporting the core classes and types.
 *
 * @example
 * ```ts
 * import { SchemaManager, PromptSchema, PromptResponse } from "structured-prompts";
 *
 * const manager = new SchemaManager({ database });
 * const schema = await manager.createPromptSchema({ ... });
 * ```
 */

// Core exports (matching Python __init__.py)
export { SchemaManager, createSchemaManager } from "./managers/schema-manager.js";
export type { PromptSchema, PromptResponse } from "./models/schema.js";
export { PromptSchemaSchema, PromptResponseSchema } from "./models/schema.js";

// Database exports
export { Database, createDatabase } from "./database/client.js";

// Model exports (includes database types)
export * from "./models/index.js";

// Manager exports
export * from "./managers/index.js";

// Validation exports
export * from "./validation/index.js";

// Capabilities exports
export * from "./capabilities/index.js";

// Interface exports
export * from "./interfaces/index.js";

// Version
export const VERSION = "0.1.0";
