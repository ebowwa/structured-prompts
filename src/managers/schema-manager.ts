/**
 * Core schema management functionality for structured prompts
 */

import { z } from "zod";
import type { Database } from "../database/client.js";
import {
  PromptSchema,
  PromptResponse,
  validatePromptSchema,
  validatePromptResponse,
} from "../models/schema.js";

// Error classes for better error handling
export class SchemaNotFoundError extends Error {
  constructor(promptId: string) {
    super(`Schema not found for id: ${promptId}`);
    this.name = "SchemaNotFoundError";
  }
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

export class SchemaManagerError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SchemaManagerError";
  }
}

/**
 * Default values for SchemaManager
 */
const DEFAULTS = {
  promptType: "example_prompt",
  promptText:
    "This is an example prompt. The response schema should be defined " +
    "based on your specific use case and the expected structure of the response.",
  responseSchema: {
    type: "object",
    description: "Dynamic response schema - define based on your needs",
    additionalProperties: true,
  } as const,
};

/**
 * SchemaManager - Manages prompt schemas and their configurations
 */
export class SchemaManager {
  private database: Database | null;
  private defaultPromptType: string;
  private defaultPromptText: string;
  private defaultResponseSchema: Record<string, unknown>;

  constructor(config: {
    database?: Database;
    defaultPromptType?: string;
    defaultPromptText?: string;
    defaultResponseSchema?: Record<string, unknown>;
  } = {}) {
    this.database = config.database ?? null;
    this.defaultPromptType = config.defaultPromptType ?? DEFAULTS.promptType;
    this.defaultPromptText = config.defaultPromptText ?? DEFAULTS.promptText;
    this.defaultResponseSchema = config.defaultResponseSchema ?? DEFAULTS.responseSchema;
  }

  /**
   * Convert database record to PromptSchema
   */
  private dbToPromptSchema(record: Record<string, unknown>): PromptSchema {
    // Map database field names (camelCase) to schema field names
    return validatePromptSchema({
      promptId: record.promptId,
      promptType: record.promptType ?? record.promptTitle ?? this.defaultPromptType,
      promptDescription: record.promptDescription ?? "",
      promptCategories: record.promptCategories ?? [],
      promptText: record.promptText ?? record.mainPrompt ?? this.defaultPromptText,
      modelInstruction: record.modelInstruction ?? record.modelInstruction ?? null,
      additionalMessages: record.additionalMessages ?? null,
      responseSchema: record.responseSchema ?? this.defaultResponseSchema,
      isPublic: record.isPublic ?? false,
      ranking: record.ranking ?? 0,
      lastUsed: record.lastUsed ?? null,
      usageCount: record.usageCount ?? 0,
      createdAt: record.createdAt ?? Math.floor(Date.now() / 1000),
      createdBy: record.createdBy ?? null,
      lastUpdated: record.lastUpdated ?? null,
      lastUpdatedBy: record.lastUpdatedBy ?? null,
      providerConfigs: record.providerConfigs ?? {},
      modelCapabilities: record.modelCapabilities ?? {},
      inputSchema: record.inputSchema ?? null,
      systemPrompts: record.systemPrompts ?? [],
    });
  }

  /**
   * Convert PromptSchema to database insert format
   */
  private promptSchemaToDb(schema: PromptSchema): Record<string, unknown> {
    return {
      promptId: schema.promptId,
      promptTitle: schema.promptType,
      promptDescription: schema.promptDescription,
      promptCategories: schema.promptCategories,
      mainPrompt: schema.promptText,
      modelInstruction: schema.modelInstruction,
      additionalMessages: schema.additionalMessages,
      responseSchema: schema.responseSchema,
      isPublic: schema.isPublic ? 1 : 0,
      ranking: schema.ranking,
      lastUsed: schema.lastUsed,
      usageCount: schema.usageCount,
      createdAt: schema.createdAt,
      createdBy: schema.createdBy,
      lastUpdated: schema.lastUpdated,
      lastUpdatedBy: schema.lastUpdatedBy,
      providerConfigs: schema.providerConfigs,
      modelCapabilities: schema.modelCapabilities,
      inputSchema: schema.inputSchema,
      systemPrompts: schema.systemPrompts,
    };
  }

  /**
   * Get a prompt schema by ID
   */
  async getPromptSchema(promptId: string): Promise<PromptSchema> {
    if (!this.database) {
      throw new SchemaManagerError("Database not configured");
    }

    try {
      const result = await this.database.get_schema(promptId);
      if (!result) {
        throw new SchemaNotFoundError(promptId);
      }
      return this.dbToPromptSchema(result);
    } catch (error) {
      if (error instanceof SchemaNotFoundError) {
        throw error;
      }
      throw new SchemaManagerError(`Failed to get schema: ${error}`);
    }
  }

  /**
   * Create a new prompt schema
   */
  async createPromptSchema(config: {
    promptId: string;
    promptTitle: string;
    promptText: string;
    responseSchema: Record<string, unknown>;
    modelInstruction?: string;
    additionalMessages?: Array<{ role: string; content: string }>;
    [key: string]: unknown;
  }): Promise<PromptSchema> {
    if (!this.database) {
      throw new SchemaManagerError("Database not configured");
    }

    try {
      const schema = validatePromptSchema({
        promptId: config.promptId,
        promptType: config.promptTitle,
        promptDescription: (config as any).promptDescription ?? "",
        promptText: config.promptText,
        responseSchema: config.responseSchema,
        modelInstruction: config.modelInstruction,
        additionalMessages: config.additionalMessages,
        createdAt: Math.floor(Date.now() / 1000),
        // Pass through any other fields
        ...(config as any),
      });

      const dbRecord = this.promptSchemaToDb(schema);
      const result = await this.database.create_schema(dbRecord as any);
      return this.dbToPromptSchema(result);
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new ValidationError(error.message);
      }
      throw new SchemaManagerError(`Failed to create schema: ${error}`);
    }
  }

  /**
   * Update an existing prompt schema
   */
  async updatePromptSchema(config: {
    promptId: string;
    promptTitle?: string;
    promptText?: string;
    responseSchema?: Record<string, unknown>;
    modelInstruction?: string;
    additionalMessages?: Array<{ role: string; content: string }>;
    [key: string]: unknown;
  }): Promise<PromptSchema> {
    if (!this.database) {
      throw new SchemaManagerError("Database not configured");
    }

    try {
      const existing = await this.database.get_schema(config.promptId);
      if (!existing) {
        throw new SchemaNotFoundError(config.promptId);
      }

      const existingSchema = this.dbToPromptSchema(existing);

      // Merge with existing values
      const updatedSchema = validatePromptSchema({
        promptId: config.promptId,
        promptType: config.promptTitle ?? existingSchema.promptType,
        promptDescription: (config as any).promptDescription ?? existingSchema.promptDescription,
        promptText: config.promptText ?? existingSchema.promptText,
        responseSchema: config.responseSchema ?? existingSchema.responseSchema,
        modelInstruction: config.modelInstruction ?? existingSchema.modelInstruction,
        additionalMessages: config.additionalMessages ?? existingSchema.additionalMessages,
        isPublic: existingSchema.isPublic,
        ranking: existingSchema.ranking,
        lastUsed: existingSchema.lastUsed,
        usageCount: existingSchema.usageCount,
        createdAt: existingSchema.createdAt,
        createdBy: existingSchema.createdBy,
        lastUpdated: Math.floor(Date.now() / 1000),
        lastUpdatedBy: (config as any).lastUpdatedBy,
        providerConfigs: existingSchema.providerConfigs,
        modelCapabilities: existingSchema.modelCapabilities,
        inputSchema: (config as any).inputSchema ?? existingSchema.inputSchema,
        systemPrompts: existingSchema.systemPrompts,
      });

      const dbRecord = this.promptSchemaToDb(updatedSchema);
      const result = await this.database.update_schema(dbRecord as any);
      return this.dbToPromptSchema(result);
    } catch (error) {
      if (error instanceof SchemaNotFoundError || error instanceof z.ZodError) {
        throw error;
      }
      throw new SchemaManagerError(`Failed to update schema: ${error}`);
    }
  }

  /**
   * Delete a prompt schema
   */
  async deletePromptSchema(promptId: string): Promise<boolean> {
    if (!this.database) {
      throw new SchemaManagerError("Database not configured");
    }

    try {
      return await this.database.delete_schema(promptId);
    } catch (error) {
      throw new SchemaManagerError(`Failed to delete schema: ${error}`);
    }
  }

  /**
   * List prompt schemas with pagination
   */
  async listPromptSchemas(limit: number = 100, offset: number = 0): Promise<PromptSchema[]> {
    if (!this.database) {
      throw new SchemaManagerError("Database not configured");
    }

    try {
      const records = await this.database.list_schemas(limit, offset);
      return records.map((r) => this.dbToPromptSchema(r));
    } catch (error) {
      throw new SchemaManagerError(`Failed to list schemas: ${error}`);
    }
  }

  /**
   * Set the database connection
   */
  setDatabase(database: Database): void {
    this.database = database;
  }

  /**
   * Get the current database connection
   */
  getDatabase(): Database | null {
    return this.database;
  }
}

/**
 * Create a SchemaManager with a database connection
 */
export async function createSchemaManager(
  database: Database,
  config?: Omit<ConstructorParameters<typeof SchemaManager>[0], "database">
): Promise<SchemaManager> {
  const manager = new SchemaManager({ database, ...config });
  return manager;
}
