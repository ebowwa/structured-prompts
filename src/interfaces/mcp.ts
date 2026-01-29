/**
 * Model Context Protocol (MCP) interface for structured prompts
 * Port of Python interfaces/mcp.py using @modelcontextprotocol/sdk
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

import type { Database } from "../database/client.js";
import { SchemaManager } from "../managers/schema-manager.js";
import type { PromptSchema } from "../models/schema.js";

/**
 * MCP server interface for structured prompts management
 */
export class MCPInterface {
  private server: Server;
  private db: Database;
  private schemaManager: SchemaManager;
  private isInitialized = false;

  constructor(databaseUrl?: string) {
    // Import Database dynamically to avoid top-level await
    const { Database: DbClass } = require("../database/client.js");
    this.db = new DbClass({ url: databaseUrl });

    this.schemaManager = new SchemaManager({ database: this.db });

    // Create the server
    this.server = new Server(
      {
        name: "structured-prompts",
        version: "0.1.0",
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupHandlers();
  }

  /**
   * Set up MCP tool handlers
   */
  private setupHandlers(): void {
    // List tools handler
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: "create_prompt_schema",
            description: "Create a new prompt schema",
            inputSchema: {
              type: "object",
              properties: {
                prompt_id: {
                  type: "string",
                  description: "Unique identifier for the prompt",
                },
                prompt_title: {
                  type: "string",
                  description: "Title of the prompt",
                },
                main_prompt: {
                  type: "string",
                  description: "The main prompt text",
                },
                response_schema: {
                  type: "object",
                  description: "JSON schema for response validation",
                },
                system_instructions: {
                  type: "string",
                  description: "System instructions for the LLM",
                },
                context: {
                  type: "string",
                  description: "Additional context for the prompt",
                },
                model_capabilities: {
                  type: "object",
                  description: "Model-specific capabilities",
                },
                input_schema: {
                  type: "object",
                  description: "Schema for validating user inputs",
                },
                system_prompts: {
                  type: "array",
                  description: "Collection of conditional system prompts",
                },
              },
              required: ["prompt_id", "prompt_title", "main_prompt", "response_schema"],
            } as any,
          },
          {
            name: "get_prompt_schema",
            description: "Retrieve a prompt schema by ID",
            inputSchema: {
              type: "object",
              properties: {
                prompt_id: {
                  type: "string",
                  description: "ID of the prompt to retrieve",
                },
              },
              required: ["prompt_id"],
            } as any,
          },
          {
            name: "list_prompt_schemas",
            description: "List all available prompt schemas",
            inputSchema: {
              type: "object",
              properties: {
                limit: {
                  type: "number",
                  description: "Maximum number of schemas to return",
                  default: 100,
                },
                offset: {
                  type: "number",
                  description: "Number of schemas to skip",
                  default: 0,
                },
              },
            } as any,
          },
          {
            name: "update_prompt_schema",
            description: "Update an existing prompt schema",
            inputSchema: {
              type: "object",
              properties: {
                prompt_id: {
                  type: "string",
                  description: "ID of the prompt to update",
                },
                prompt_title: {
                  type: "string",
                  description: "New title",
                },
                main_prompt: {
                  type: "string",
                  description: "New main prompt",
                },
                response_schema: {
                  type: "object",
                  description: "New response schema",
                },
                system_instructions: {
                  type: "string",
                  description: "New system instructions",
                },
                context: {
                  type: "string",
                  description: "New context",
                },
              },
              required: ["prompt_id"],
            } as any,
          },
          {
            name: "delete_prompt_schema",
            description: "Delete a prompt schema",
            inputSchema: {
              type: "object",
              properties: {
                prompt_id: {
                  type: "string",
                  description: "ID of the prompt to delete",
                },
              },
              required: ["prompt_id"],
            } as any,
          },
        ],
      };
    });

    // Call tool handler
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      // Ensure database is connected
      if (!(await this.db.is_connected())) {
        await this.db.connect();
      }

      try {
        switch (name) {
          case "create_prompt_schema": {
            const schema = await this.schemaManager.createPromptSchema({
              promptId: args!.prompt_id as string,
              promptTitle: args!.prompt_title as string,
              promptText: args!.main_prompt as string,
              responseSchema: args!.response_schema as Record<string, unknown>,
              modelInstruction: args!.system_instructions as string | undefined,
              additionalMessages: args!.context as any,
              modelCapabilities: args!.model_capabilities as any,
              inputSchema: args!.input_schema as any,
              systemPrompts: args!.system_prompts as any,
            });
            return {
              content: [
                {
                  type: "text",
                  text: `Created prompt schema with ID: ${schema.promptId}`,
                },
              ],
            };
          }

          case "get_prompt_schema": {
            const schema = await this.schemaManager.getPromptSchema(
              args!.prompt_id as string
            );
            return {
              content: [
                {
                  type: "text",
                  text: JSON.stringify(schema, null, 2),
                },
              ],
            };
          }

          case "list_prompt_schemas": {
            const limit = (args!.limit as number) ?? 100;
            const offset = (args!.offset as number) ?? 0;
            const schemas = await this.schemaManager.listPromptSchemas(
              limit,
              offset
            );
            return {
              content: [
                {
                  type: "text",
                  text: JSON.stringify(schemas, null, 2),
                },
              ],
            };
          }

          case "update_prompt_schema": {
            const promptId = args!.prompt_id as string;
            // Get existing to merge
            const existing = await this.schemaManager.getPromptSchema(promptId);
            await this.schemaManager.updatePromptSchema({
              promptId,
              promptTitle: args!.prompt_title as string | undefined,
              promptText: args!.main_prompt as string | undefined,
              responseSchema: args!.response_schema as Record<string, unknown> | undefined,
              modelInstruction: args!.system_instructions as string | undefined,
            });
            return {
              content: [
                {
                  type: "text",
                  text: `Updated prompt schema: ${promptId}`,
                },
              ],
            };
          }

          case "delete_prompt_schema": {
            await this.schemaManager.deletePromptSchema(args!.prompt_id as string);
            return {
              content: [
                {
                  type: "text",
                  text: `Deleted prompt schema: ${args!.prompt_id as string}`,
                },
              ],
            };
          }

          default:
            return {
              content: [
                {
                  type: "text",
                  text: `Unknown tool: ${name}`,
                },
              ],
              isError: true,
            };
        }
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error: ${(error as Error).message}`,
            },
          ],
          isError: true,
        };
      }
    });
  }

  /**
   * Run the MCP server
   */
  async run(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    // Ensure database is connected
    if (!(await this.db.is_connected())) {
      await this.db.connect();
    }

    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    this.isInitialized = true;
  }

  /**
   * Stop the MCP server
   */
  async stop(): Promise<void> {
    await this.db.disconnect();
    this.isInitialized = false;
  }
}

/**
 * Main entry point for the MCP server
 */
export async function main(): Promise<void> {
  const databaseUrl = process.env.DATABASE_URL;
  const mcpInterface = new MCPInterface(databaseUrl);
  await mcpInterface.run();
}

// Run if executed directly
if (import.meta.main) {
  main().catch((error) => {
    console.error("MCP server error:", error);
    process.exit(1);
  });
}
