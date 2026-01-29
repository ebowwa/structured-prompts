/**
 * Database connection and operations wrapper
 * Supports both SQLite (via Bun) and PostgreSQL
 */

import { Database as BunDatabase } from "bun:sqlite";
import postgres from "postgres";
import { existsSync, mkdirSync } from "fs";
import { dirname } from "path";

// Type imports - we'll use our own schema definitions since we're not using Drizzle
// for SQLite anymore (using Bun's native SQLite)

// Type for database configuration
export interface DatabaseConfig {
  url?: string;
  type?: "sqlite" | "postgres";
}

// Type for result operations
export type DbResult<T> = Promise<T>;

// Union type for schema records (SQLite or PostgreSQL)
export type PromptSchemaRecord = Record<string, unknown>;
export type PromptResponseRecord = Record<string, unknown>;

// Schema insert types
export interface PromptSchemaInsert {
  promptId: string;
  promptTitle: string;
  promptDescription?: string;
  promptCategories?: unknown;
  mainPrompt: string;
  modelInstruction?: string;
  additionalMessages?: unknown;
  responseSchema: Record<string, unknown>;
  isPublic?: boolean;
  ranking?: number;
  lastUsed?: number;
  usageCount?: number;
  createdAt?: number;
  createdBy?: string;
  lastUpdated?: number;
  lastUpdatedBy?: string;
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

/**
 * Database class for managing connections and operations
 */
export class Database {
  private db: BunDatabase | postgres.Sql<{}> | null = null;
  private url: string;
  private type: "sqlite" | "postgres";
  private isConnectedFlag = false;

  constructor(config: DatabaseConfig = {}) {
    this.url = config.url ?? process.env.DATABASE_URL ?? "sqlite:///./structured_prompts.db";

    // Detect database type from URL
    if (this.url.startsWith("sqlite")) {
      this.type = "sqlite";
    } else if (this.url.startsWith("postgres") || this.url.startsWith("postgresql")) {
      this.type = "postgres";
    } else {
      this.type = config.type ?? "sqlite"; // default
    }
  }

  /**
   * Establish database connection and create tables
   */
  async connect(): Promise<void> {
    if (this.isConnectedFlag) {
      return;
    }

    try {
      if (this.type === "sqlite") {
        await this.connectSqlite();
      } else {
        await this.connectPostgres();
      }

      this.isConnectedFlag = true;
    } catch (error) {
      throw new Error(`Failed to connect to database: ${error}`);
    }
  }

  /**
   * Connect to SQLite database using Bun's native SQLite
   */
  private async connectSqlite(): Promise<void> {
    // Extract file path from sqlite URL
    const filePath = this.url.replace(/^sqlite:\/\/\//, "");

    // Ensure directory exists
    const dir = dirname(filePath);
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }

    this.db = new BunDatabase(filePath, { create: true });

    // Create tables
    const db = this.db as BunDatabase;
    db.exec(`
      CREATE TABLE IF NOT EXISTS prompt_schemas (
        prompt_id TEXT PRIMARY KEY,
        prompt_title TEXT NOT NULL,
        prompt_description TEXT,
        prompt_categories TEXT,
        main_prompt TEXT NOT NULL,
        model_instruction TEXT,
        additional_messages TEXT,
        response_schema TEXT NOT NULL,
        is_public INTEGER DEFAULT 0,
        ranking INTEGER DEFAULT 0,
        last_used INTEGER,
        usage_count INTEGER DEFAULT 0,
        created_at INTEGER NOT NULL,
        created_by TEXT,
        last_updated INTEGER,
        last_updated_by TEXT,
        provider_configs TEXT,
        model_capabilities TEXT,
        input_schema TEXT,
        system_prompts TEXT
      );

      CREATE TABLE IF NOT EXISTS prompt_responses (
        response_id TEXT PRIMARY KEY,
        prompt_id TEXT NOT NULL,
        raw_response TEXT NOT NULL,
        created_at INTEGER NOT NULL,
        FOREIGN KEY (prompt_id) REFERENCES prompt_schemas(prompt_id)
      );
    `);
  }

  /**
   * Connect to PostgreSQL database
   */
  private async connectPostgres(): Promise<void> {
    const connectionString = this.url.replace(/^postgresql?:\/\//, "postgres://");
    this.db = postgres(connectionString);

    const client = this.db as postgres.Sql<{}>;

    // Create tables if not exists
    await client`
      CREATE TABLE IF NOT EXISTS prompt_schemas (
        prompt_id TEXT PRIMARY KEY,
        prompt_title TEXT NOT NULL,
        prompt_description TEXT,
        prompt_categories JSONB,
        main_prompt TEXT NOT NULL,
        model_instruction TEXT,
        additional_messages JSONB,
        response_schema JSONB NOT NULL,
        is_public INTEGER DEFAULT 0 NOT NULL,
        ranking INTEGER DEFAULT 0,
        last_used INTEGER,
        usage_count INTEGER DEFAULT 0,
        created_at INTEGER NOT NULL,
        created_by TEXT,
        last_updated INTEGER,
        last_updated_by TEXT,
        provider_configs JSONB,
        model_capabilities JSONB,
        input_schema JSONB,
        system_prompts JSONB
      );
    `;

    await client`
      CREATE TABLE IF NOT EXISTS prompt_responses (
        response_id TEXT PRIMARY KEY,
        prompt_id TEXT NOT NULL REFERENCES prompt_schemas(prompt_id),
        raw_response JSONB NOT NULL,
        created_at INTEGER NOT NULL
      );
    `;
  }

  /**
   * Check if database is connected
   */
  async is_connected(): Promise<boolean> {
    return this.isConnectedFlag;
  }

  /**
   * Close database connection
   */
  async disconnect(): Promise<void> {
    if (this.db) {
      if (this.type === "sqlite") {
        (this.db as BunDatabase).close();
      } else {
        (this.db as postgres.Sql<{}>).end();
      }
    }
    this.isConnectedFlag = false;
    this.db = null;
  }

  /**
   * Get a prompt schema by ID
   */
  async get_schema(promptId: string): Promise<PromptSchemaRecord | null> {
    this.ensureConnected();

    if (this.type === "sqlite") {
      const db = this.db as BunDatabase;
      const stmt = db.prepare(
        "SELECT * FROM prompt_schemas WHERE prompt_id = ?"
      );
      const result = stmt.get(promptId) as Record<string, unknown> | null;

      if (!result) return null;

      // Parse JSON fields
      const parsed = this.parseJsonFields(result, [
        "prompt_categories",
        "additional_messages",
        "response_schema",
        "provider_configs",
        "model_capabilities",
        "input_schema",
        "system_prompts",
      ]);

      // Convert snake_case to camelCase
      return this.snakeToCamel(parsed);
    } else {
      const client = this.db as postgres.Sql<{}>;
      const rows = await client`
        SELECT * FROM prompt_schemas WHERE prompt_id = ${promptId}
      `;

      if (rows.length === 0) return null;
      return rows[0] as PromptSchemaRecord;
    }
  }

  /**
   * Create a new prompt schema
   */
  async create_schema(schema: PromptSchemaInsert): Promise<PromptSchemaRecord> {
    this.ensureConnected();

    const data = {
      ...schema,
      createdAt: schema.createdAt ?? Math.floor(Date.now() / 1000),
    };

    if (this.type === "sqlite") {
      const db = this.db as BunDatabase;
      const stmt = db.prepare(`
        INSERT INTO prompt_schemas (
          prompt_id, prompt_title, prompt_description, prompt_categories,
          main_prompt, model_instruction, additional_messages, response_schema,
          is_public, ranking, last_used, usage_count, created_at, created_by,
          last_updated, last_updated_by, provider_configs, model_capabilities,
          input_schema, system_prompts
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      stmt.run(
        data.promptId,
        data.promptTitle,
        data.promptDescription ?? null,
        JSON.stringify(data.promptCategories ?? []),
        data.mainPrompt,
        data.modelInstruction ?? null,
        JSON.stringify(data.additionalMessages ?? []),
        JSON.stringify(data.responseSchema),
        data.isPublic ? 1 : 0,
        data.ranking ?? 0,
        data.lastUsed ?? null,
        data.usageCount ?? 0,
        data.createdAt,
        data.createdBy ?? null,
        data.lastUpdated ?? null,
        data.lastUpdatedBy ?? null,
        JSON.stringify(data.providerConfigs ?? {}),
        JSON.stringify(data.modelCapabilities ?? {}),
        JSON.stringify(data.inputSchema ?? {}),
        JSON.stringify(data.systemPrompts ?? [])
      );
    } else {
      const client = this.db as postgres.Sql<{}>;
      await client`
        INSERT INTO prompt_schemas (
          prompt_id, prompt_title, prompt_description, prompt_categories,
          main_prompt, model_instruction, additional_messages, response_schema,
          is_public, ranking, last_used, usage_count, created_at, created_by,
          last_updated, last_updated_by, provider_configs, model_capabilities,
          input_schema, system_prompts
        ) VALUES (
          ${data.promptId}, ${data.promptTitle}, ${data.promptDescription ?? null},
          ${JSON.stringify(data.promptCategories ?? [])}, ${data.mainPrompt},
          ${data.modelInstruction ?? null}, ${JSON.stringify(data.additionalMessages ?? [])},
          ${JSON.stringify(data.responseSchema)}, ${data.isPublic ? 1 : 0},
          ${data.ranking ?? 0}, ${data.lastUsed ?? null}, ${data.usageCount ?? 0},
          ${data.createdAt}, ${data.createdBy ?? null}, ${data.lastUpdated ?? null},
          ${data.lastUpdatedBy ?? null}, ${JSON.stringify(data.providerConfigs ?? {})},
          ${JSON.stringify(data.modelCapabilities ?? {})}, ${JSON.stringify(data.inputSchema ?? {})},
          ${JSON.stringify(data.systemPrompts ?? [])}
        )
      `;
    }

    // Fetch the created schema
    const result = await this.get_schema(data.promptId);
    if (!result) {
      throw new Error("Failed to create schema");
    }
    return result as PromptSchemaRecord;
  }

  /**
   * Update an existing prompt schema
   */
  async update_schema(schema: PromptSchemaInsert): Promise<PromptSchemaRecord> {
    this.ensureConnected();

    const data = {
      ...schema,
      lastUpdated: Math.floor(Date.now() / 1000),
    };

    if (this.type === "sqlite") {
      const db = this.db as BunDatabase;
      const stmt = db.prepare(`
        UPDATE prompt_schemas SET
          prompt_title = ?, prompt_description = ?, prompt_categories = ?,
          main_prompt = ?, model_instruction = ?, additional_messages = ?,
          response_schema = ?, is_public = ?, ranking = ?, last_used = ?,
          usage_count = ?, created_at = ?, created_by = ?, last_updated = ?,
          last_updated_by = ?, provider_configs = ?, model_capabilities = ?,
          input_schema = ?, system_prompts = ?
        WHERE prompt_id = ?
      `);

      const params: (string | number | null)[] = [
        data.promptTitle,
        data.promptDescription ?? null,
        JSON.stringify(data.promptCategories ?? []),
        data.mainPrompt,
        data.modelInstruction ?? null,
        JSON.stringify(data.additionalMessages ?? []),
        JSON.stringify(data.responseSchema),
        data.isPublic ? 1 : 0,
        data.ranking ?? 0,
        data.lastUsed ?? null,
        data.usageCount ?? 0,
        data.createdAt ?? Math.floor(Date.now() / 1000),
        data.createdBy ?? null,
        data.lastUpdated,
        data.lastUpdatedBy ?? null,
        JSON.stringify(data.providerConfigs ?? {}),
        JSON.stringify(data.modelCapabilities ?? {}),
        JSON.stringify(data.inputSchema ?? {}),
        JSON.stringify(data.systemPrompts ?? []),
        data.promptId
      ];

      stmt.run(...params);
    } else {
      const client = this.db as postgres.Sql<{}>;
      const createdAt = data.createdAt ?? Math.floor(Date.now() / 1000);
      await client`
        UPDATE prompt_schemas SET
          prompt_title = ${data.promptTitle},
          prompt_description = ${data.promptDescription ?? null},
          prompt_categories = ${JSON.stringify(data.promptCategories ?? [])},
          main_prompt = ${data.mainPrompt},
          model_instruction = ${data.modelInstruction ?? null},
          additional_messages = ${JSON.stringify(data.additionalMessages ?? [])},
          response_schema = ${JSON.stringify(data.responseSchema)},
          is_public = ${data.isPublic ? 1 : 0},
          ranking = ${data.ranking ?? 0},
          last_used = ${data.lastUsed ?? null},
          usage_count = ${data.usageCount ?? 0},
          created_at = ${createdAt},
          created_by = ${data.createdBy ?? null},
          last_updated = ${data.lastUpdated},
          last_updated_by = ${data.lastUpdatedBy ?? null},
          provider_configs = ${JSON.stringify(data.providerConfigs ?? {})},
          model_capabilities = ${JSON.stringify(data.modelCapabilities ?? {})},
          input_schema = ${JSON.stringify(data.inputSchema ?? {})},
          system_prompts = ${JSON.stringify(data.systemPrompts ?? [])}
        WHERE prompt_id = ${data.promptId}
      `;
    }

    // Fetch the updated schema
    const result = await this.get_schema(data.promptId);
    if (!result) {
      throw new Error("Failed to update schema");
    }
    return result as PromptSchemaRecord;
  }

  /**
   * Delete a prompt schema
   */
  async delete_schema(promptId: string): Promise<boolean> {
    this.ensureConnected();

    if (this.type === "sqlite") {
      const db = this.db as BunDatabase;
      const stmt = db.prepare("DELETE FROM prompt_schemas WHERE prompt_id = ?");
      const result = stmt.run(promptId);
      return result.changes > 0;
    } else {
      const client = this.db as postgres.Sql<{}>;
      const result = await client`
        DELETE FROM prompt_schemas WHERE prompt_id = ${promptId}
      `;
      return result.length > 0;
    }
  }

  /**
   * Get prompt response by ID
   */
  async get_response(responseId: string): Promise<PromptResponseRecord | null> {
    this.ensureConnected();

    if (this.type === "sqlite") {
      const db = this.db as BunDatabase;
      const stmt = db.prepare(
        "SELECT * FROM prompt_responses WHERE response_id = ?"
      );
      const result = stmt.get(responseId) as Record<string, unknown> | null;

      if (!result) return null;

      return this.parseJsonFields(result, ["raw_response"]);
    } else {
      const client = this.db as postgres.Sql<{}>;
      const rows = await client`
        SELECT * FROM prompt_responses WHERE response_id = ${responseId}
      `;

      if (rows.length === 0) return null;
      return rows[0] as PromptResponseRecord;
    }
  }

  /**
   * Create a new prompt response
   */
  async create_response(response: PromptResponseInsert): Promise<PromptResponseRecord> {
    this.ensureConnected();

    const data = {
      ...response,
      createdAt: response.createdAt ?? Math.floor(Date.now() / 1000),
    };

    if (this.type === "sqlite") {
      const db = this.db as BunDatabase;
      const stmt = db.prepare(`
        INSERT INTO prompt_responses (response_id, prompt_id, raw_response, created_at)
        VALUES (?, ?, ?, ?)
      `);

      stmt.run(
        data.responseId,
        data.promptId,
        JSON.stringify(data.rawResponse),
        data.createdAt
      );
    } else {
      const client = this.db as postgres.Sql<{}>;
      await client`
        INSERT INTO prompt_responses (response_id, prompt_id, raw_response, created_at)
        VALUES (${data.responseId}, ${data.promptId}, ${JSON.stringify(data.rawResponse)}, ${data.createdAt})
      `;
    }

    // Fetch the created response
    const result = await this.get_response(data.responseId);
    if (!result) {
      throw new Error("Failed to create response");
    }
    return result as PromptResponseRecord;
  }

  /**
   * List prompt schemas with pagination
   */
  async list_schemas(limit: number = 100, offset: number = 0): Promise<PromptSchemaRecord[]> {
    this.ensureConnected();

    if (this.type === "sqlite") {
      const db = this.db as BunDatabase;
      const stmt = db.prepare(`
        SELECT * FROM prompt_schemas
        LIMIT ? OFFSET ?
      `);
      const results = stmt.all(limit, offset) as Record<string, unknown>[];

      return results.map((r) => {
        const parsed = this.parseJsonFields(r, [
          "prompt_categories",
          "additional_messages",
          "response_schema",
          "provider_configs",
          "model_capabilities",
          "input_schema",
          "system_prompts",
        ]);
        return this.snakeToCamel(parsed);
      });
    } else {
      const client = this.db as postgres.Sql<{}>;
      const rows = await client`
        SELECT * FROM prompt_schemas
        LIMIT ${limit}
        OFFSET ${offset}
      `;

      return rows as PromptSchemaRecord[];
    }
  }

  /**
   * Ensure database is connected
   */
  private ensureConnected(): void {
    if (!this.isConnectedFlag || !this.db) {
      throw new Error("Database not connected. Call connect() first.");
    }
  }

  /**
   * Parse JSON fields from database records
   */
  private parseJsonFields<T extends Record<string, unknown>>(
    record: T,
    jsonFields: string[]
  ): T {
    const parsed = { ...record };
    for (const field of jsonFields) {
      const value = (parsed as any)[field];
      if (typeof value === "string") {
        try {
          (parsed as any)[field] = JSON.parse(value);
        } catch {
          // Keep original value if parsing fails
        }
      }
    }
    return parsed;
  }

  /**
   * Convert snake_case database columns to camelCase
   * Also handles SQLite integer booleans
   */
  private snakeToCamel<T extends Record<string, unknown>>(record: T): T {
    const converted: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(record)) {
      // Convert snake_case to camelCase
      const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());

      // Handle SQLite integer booleans
      if (camelKey === "isPublic" && typeof value === "number") {
        converted[camelKey] = value === 1;
      } else {
        converted[camelKey] = value;
      }
    }
    return converted as T;
  }
}

/**
 * Create a database connection with the given configuration
 */
export async function createDatabase(config: DatabaseConfig = {}): Promise<Database> {
  const db = new Database(config);
  await db.connect();
  return db;
}
