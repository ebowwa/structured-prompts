/**
 * Structured Prompts - Demo Script
 *
 * This script demonstrates the main features of the library:
 * - Database connection
 * - Schema creation and retrieval
 * - Schema updates
 * - Schema listing and deletion
 * - Validation
 * - Model capabilities
 */

import { Database, SchemaManager } from "./src/index.ts";
import { validateJsonInput, validateTextInput, InputType } from "./src/validation/index.ts";
import { getModelConfig, shouldUseThinkingMode, ModelCapability } from "./src/capabilities/index.ts";

const DB_URL = "sqlite:///./demo.db";

async function main() {
  console.log("╔════════════════════════════════════════════════════════════╗");
  console.log("║   Structured Prompts TypeScript - Interactive Demo          ║");
  console.log("╚════════════════════════════════════════════════════════════╝\n");

  // ============================================================
  // STEP 1: Database Connection
  // ============================================================
  console.log("📦 STEP 1: Connecting to database...");
  const db = new Database({ url: DB_URL });
  await db.connect();
  console.log("   ✓ Connected to", DB_URL);

  const manager = new SchemaManager({ database: db });
  console.log("   ✓ SchemaManager created\n");

  // ============================================================
  // STEP 2: Create a Prompt Schema
  // ============================================================
  console.log("📝 STEP 2: Creating prompt schema...");

  const codeReviewSchema = await manager.createPromptSchema({
    promptId: "code-review-assistant",
    promptTitle: "Code Review",
    promptDescription: "AI-powered code review assistant",
    promptText: "You are an expert code reviewer. Analyze code for bugs, security issues, and improvements.",
    promptCategories: ["development", "code-review", "ai-assistant"],
    responseSchema: {
      type: "object",
      properties: {
        summary: { type: "string", description: "Brief review summary" },
        issues: {
          type: "array",
          items: {
            type: "object",
            properties: {
              severity: { type: "string", enum: ["low", "medium", "high", "critical"] },
              description: { type: "string" },
              line: { type: "number" }
            }
          }
        },
        rating: { type: "number", minimum: 1, maximum: 10 }
      }
    },
    modelCapabilities: {
      supportsFunctionCalling: true,
      supportsVision: false,
      maxTokens: 4000
    },
    isPublic: true,
    ranking: 0.9
  });

  console.log("   ✓ Created schema:", codeReviewSchema.promptId);
  console.log("   └─ Title:", codeReviewSchema.promptType);
  console.log("   └─ Categories:", codeReviewSchema.promptCategories);
  console.log("   └─ Is Public:", codeReviewSchema.isPublic);
  console.log("   └─ Ranking:", codeReviewSchema.ranking, "\n");

  // ============================================================
  // STEP 3: Create Another Schema
  // ============================================================
  console.log("📝 STEP 3: Creating second schema...");

  const testGenSchema = await manager.createPromptSchema({
    promptId: "test-generator",
    promptTitle: "Test Generator",
    promptText: "Generate comprehensive unit tests for the given code.",
    promptCategories: ["testing", "development"],
    responseSchema: {
      type: "object",
      properties: {
        testCases: {
          type: "array",
          items: {
            type: "object",
            properties: {
              description: { type: "string" },
              input: { type: "string" },
              expected: { type: "string" }
            }
          }
        },
        coverage: { type: "number" }
      }
    },
    isPublic: false,
    ranking: 0.7
  });

  console.log("   ✓ Created schema:", testGenSchema.promptId);
  console.log("   └─ Is Public:", testGenSchema.isPublic, "\n");

  // ============================================================
  // STEP 4: List All Schemas
  // ============================================================
  console.log("📋 STEP 4: Listing all schemas...");
  const schemas = await manager.listPromptSchemas(10, 0);
  console.log(`   ✓ Found ${schemas.length} schema(s):`);
  schemas.forEach((s: any) => {
    console.log(`      └─ ${s.promptId} (${s.promptType}) - Public: ${s.isPublic}`);
  });
  console.log();

  // ============================================================
  // STEP 5: Retrieve Specific Schema
  // ============================================================
  console.log("🔍 STEP 5: Retrieving 'code-review-assistant' schema...");
  const retrieved = await manager.getPromptSchema("code-review-assistant");
  console.log("   ✓ Retrieved schema:");
  console.log("   └─ Prompt:", retrieved.promptText.substring(0, 50) + "...");
  console.log("   └─ Response Schema:", JSON.stringify(retrieved.responseSchema).substring(0, 80) + "...\n");

  // ============================================================
  // STEP 6: Update Schema
  // ============================================================
  console.log("✏️  STEP 6: Updating schema...");
  await manager.updatePromptSchema({
    promptId: "code-review-assistant",
    modelInstruction: "Focus on security vulnerabilities, performance issues, and code quality."
  });
  const updated = await manager.getPromptSchema("code-review-assistant");
  console.log("   ✓ Schema updated");
  console.log("   └─ Model Instruction:", updated.modelInstruction, "\n");

  // ============================================================
  // STEP 7: Test Validation
  // ============================================================
  console.log("✓ STEP 7: Testing validation...");

  // JSON validation
  const jsonResult = validateJsonInput(
    { name: "test", count: 5 },
    { type: "object", properties: { name: { type: "string" }, count: { type: "number" } } }
  );
  console.log("   ✓ JSON Validation:", jsonResult.isValid ? "Valid" : "Invalid");

  // Text validation
  const textResult = validateTextInput(
    "hello world",
    { minLength: 3, maxLength: 50, pattern: "^[a-z ]+$" }
  );
  console.log("   ✓ Text Validation:", textResult.isValid ? "Valid" : "Invalid");
  console.log();

  // ============================================================
  // STEP 8: Test Model Capabilities
  // ============================================================
  console.log("🤖 STEP 8: Testing model capabilities...");

  const claudeConfig = getModelConfig("claude-3-opus");
  if (claudeConfig) {
    console.log("   ✓ Claude 3 Opus Config:");
    console.log("      └─ Capabilities:", claudeConfig.capabilities.length, "capabilities");
    console.log("      └─ Max Thinking Tokens:", claudeConfig.maxThinkingTokens);
    console.log("      └─ Supports Thinking:", claudeConfig.capabilities.includes(ModelCapability.THINKING));

    const useThinking = shouldUseThinkingMode(
      "Solve this complex mathematical proof",
      claudeConfig
    );
    console.log("      └─ Should use thinking mode for 'mathematical proof':", useThinking);
  }
  console.log();

  // ============================================================
  // STEP 9: Cleanup
  // ============================================================
  console.log("🧹 STEP 9: Cleaning up...");
  await manager.deletePromptSchema("code-review-assistant");
  console.log("   ✓ Deleted 'code-review-assistant'");
  await manager.deletePromptSchema("test-generator");
  console.log("   ✓ Deleted 'test-generator'");

  await db.disconnect();
  console.log("   ✓ Database disconnected\n");

  // ============================================================
  // FINISH
  // ============================================================
  console.log("╔════════════════════════════════════════════════════════════╗");
  console.log("║                    ✅ Demo Complete!                        ║");
  console.log("╚════════════════════════════════════════════════════════════╝");
}

// Run the demo
main().catch((error) => {
  console.error("❌ Demo failed:", error);
  process.exit(1);
});
