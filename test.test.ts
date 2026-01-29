/**
 * Simple test to verify the module works
 */

import { Database, SchemaManager } from "./src/index.ts";
import { PromptSchemaSchema } from "./src/models/schema.ts";

async function main() {
  console.log("Structured Prompts TypeScript Test");
  console.log("=================================\n");

  // Create database
  console.log("Creating database connection...");
  const db = new Database({ url: "sqlite:///./test.db" });
  await db.connect();
  console.log("✓ Database connected");

  // Create schema manager
  console.log("\nCreating schema manager...");
  const manager = new SchemaManager({ database: db });
  console.log("✓ Schema manager created");

  // Create a prompt schema
  console.log("\nCreating a test prompt schema...");
  const schema = await manager.createPromptSchema({
    promptId: "test-prompt-1",
    promptTitle: "Test Prompt",
    promptText: "You are a helpful assistant.",
    responseSchema: {
      type: "object",
      properties: {
        answer: { type: "string" }
      }
    }
  });
  console.log("✓ Created schema:", schema.promptId);

  // Get the schema
  console.log("\nRetrieving the schema...");
  const retrieved = await manager.getPromptSchema("test-prompt-1");
  console.log("✓ Retrieved schema:", retrieved.promptId);

  // List schemas
  console.log("\nListing all schemas...");
  const schemas = await manager.listPromptSchemas(10, 0);
  console.log(`✓ Found ${schemas.length} schema(s)`);

  // Delete the schema
  console.log("\nDeleting the schema...");
  await manager.deletePromptSchema("test-prompt-1");
  console.log("✓ Schema deleted");

  // Close database
  console.log("\nClosing database...");
  await db.disconnect();
  console.log("✓ Database disconnected");

  console.log("\n✅ All tests passed!");
}

main().catch(console.error);
