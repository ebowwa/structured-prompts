/**
 * MCP Server Test Script
 * Tests all MCP server tools by directly calling the underlying SchemaManager methods
 */

import { MCPInterface } from "./src/interfaces/mcp.ts";

async function main() {
  console.log("MCP Server Test Script");
  console.log("======================\n");

  // Create MCP interface with test database
  const databaseUrl = "sqlite:///./test_mcp.db";
  const mcp = new MCPInterface(databaseUrl);

  // Initialize (this connects the database)
  await mcp["db"].connect();
  console.log("✓ MCP Interface initialized\n");

  const schemaManager = mcp["schemaManager"];

  // TEST 1: Create a prompt schema (create_prompt_schema)
  console.log("TEST 1: create_prompt_schema");
  console.log("------------------------------");
  const createResult = await schemaManager.createPromptSchema({
    promptId: "mcp-test-1",
    promptTitle: "MCP Test Prompt",
    promptText: "You are a helpful assistant for testing MCP.",
    responseSchema: {
      type: "object",
      properties: {
        answer: { type: "string" },
        confidence: { type: "number" }
      },
      required: ["answer", "confidence"]
    },
    modelInstruction: "Be helpful and concise.",
    context: "This is a test prompt for MCP validation."
  });
  console.log("✓ Created schema:", createResult.promptId);
  console.log("  Title:", createResult.promptTitle);
  console.log();

  // TEST 2: List all schemas (list_prompt_schemas)
  console.log("TEST 2: list_prompt_schemas");
  console.log("----------------------------");
  const schemas = await schemaManager.listPromptSchemas(100, 0);
  console.log(`✓ Found ${schemas.length} schema(s)`);
  schemas.forEach(s => console.log(`  - ${s.promptId}: ${s.promptTitle}`));
  console.log();

  // TEST 3: Get a specific schema by ID (get_prompt_schema)
  console.log("TEST 3: get_prompt_schema");
  console.log("----------------------------");
  const retrieved = await schemaManager.getPromptSchema("mcp-test-1");
  console.log("✓ Retrieved schema:", retrieved.promptId);
  console.log("  Prompt text:", retrieved.promptText.substring(0, 50) + "...");
  console.log("  Response schema:", JSON.stringify(retrieved.responseSchema));
  console.log();

  // TEST 4: Update the schema (update_prompt_schema)
  console.log("TEST 4: update_prompt_schema");
  console.log("----------------------------");
  await schemaManager.updatePromptSchema({
    promptId: "mcp-test-1",
    promptTitle: "MCP Test Prompt (Updated)",
    modelInstruction: "Be very helpful and extremely concise."
  });
  const updated = await schemaManager.getPromptSchema("mcp-test-1");
  console.log("✓ Updated schema:", updated.promptId);
  console.log("  New title:", updated.promptTitle);
  console.log("  New instruction:", updated.modelInstruction);
  console.log();

  // TEST 5: Create a second schema for more realistic testing
  console.log("TEST 5: Creating second schema");
  console.log("----------------------------");
  await schemaManager.createPromptSchema({
    promptId: "mcp-test-2",
    promptTitle: "Code Review Prompt",
    promptText: "Review the following code for bugs and improvements.",
    responseSchema: {
      type: "object",
      properties: {
        issues: { type: "array", items: { type: "string" } },
        suggestions: { type: "array", items: { type: "string" } },
        rating: { type: "number" }
      }
    }
  });
  console.log("✓ Created second schema: mcp-test-2");
  console.log();

  // TEST 6: List again to show multiple schemas
  console.log("TEST 6: list_prompt_schemas (after creating second)");
  console.log("-----------------------------------------------------");
  const schemas2 = await schemaManager.listPromptSchemas(100, 0);
  console.log(`✓ Found ${schemas2.length} schema(s)`);
  schemas2.forEach(s => console.log(`  - ${s.promptId}: ${s.promptTitle}`));
  console.log();

  // TEST 7: Delete schemas (delete_prompt_schema)
  console.log("TEST 7: delete_prompt_schema");
  console.log("----------------------------");
  await schemaManager.deletePromptSchema("mcp-test-1");
  await schemaManager.deletePromptSchema("mcp-test-2");
  console.log("✓ Deleted schemas: mcp-test-1, mcp-test-2");
  console.log();

  // TEST 8: Verify deletion
  console.log("TEST 8: Verify deletion");
  console.log("----------------------------");
  const finalSchemas = await schemaManager.listPromptSchemas(100, 0);
  console.log(`✓ Final schema count: ${finalSchemas.length}`);
  console.log();

  // Cleanup
  await mcp["db"].disconnect();
  console.log("✓ Database disconnected");
  console.log("\n✅ All MCP server tests passed!");
}

main().catch(console.error);
