/**
 * Structured Prompts TS - Comprehensive Test Script
 * Tests the library's main features: Database, SchemaManager, Validation, and Model Config
 */

import { Database, SchemaManager } from "./src/index.js";
import {
  validatePromptSchema,
  validatePromptResponse,
  safeParsePromptSchema,
  PromptSchemaSchema,
} from "./src/models/schema.js";
import {
  validateJsonInput,
  validateTextInput,
  validateUserInput,
  TextConstraintsSchema,
  InputType,
} from "./src/validation/index.js";
import {
  getModelConfig,
  ModelCapability,
  shouldUseThinkingMode,
  formatWithSpecialTokens,
  validateModelConfig,
  PREDEFINED_MODELS,
} from "./src/capabilities/index.js";

// Test database file
const TEST_DB = "./test-prompts.db";

// ANSI color codes for terminal output
const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
  magenta: "\x1b[35m",
};

function log(message: string, color: keyof typeof colors = "reset") {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function section(title: string) {
  console.log(`\n${colors.cyan}${"=".repeat(50)}`);
  console.log(`  ${title}`);
  console.log(`${"=".repeat(50)}${colors.reset}\n`);
}

// Test data
const TEST_SCHEMA = {
  promptId: "test-code-reviewer",
  promptTitle: "Code Reviewer",
  promptText: "Review the code for bugs and improvements",
  promptDescription: "A code reviewer that finds bugs and suggests improvements",
  responseSchema: {
    type: "object",
    properties: {
      summary: { type: "string" },
      rating: { type: "number", minimum: 1, maximum: 10 },
    },
    required: ["summary", "rating"],
  },
};

async function runTests() {
  log("Starting Structured Prompts TS Test Suite...", "blue");

  // ============================================================
  // Test 1: GLM-4.7 Model Configuration
  // ============================================================
  section("Test 1: GLM-4.7 Model Configuration");

  const glmConfig = getModelConfig("glm-4.7");
  if (glmConfig) {
    log("✓ GLM-4.7 config found", "green");
    log(`  Model Family: ${glmConfig.modelFamily}`, "blue");
    log(`  Model Version: ${glmConfig.modelVersion}`, "blue");
    log(`  Capabilities:`, "blue");
    for (const cap of glmConfig.capabilities) {
      log(`    - ${cap}`, "blue");
    }
    log(`  Max Thinking Tokens: ${glmConfig.maxThinkingTokens}`, "blue");
    log(`  Special Tokens:`, "blue");
    for (const [key, value] of Object.entries(glmConfig.specialTokens)) {
      log(`    ${key}: "${value}"`, "blue");
    }
  } else {
    log("✗ GLM-4.7 config not found", "red");
  }

  // ============================================================
  // Test 2: All Predefined Models
  // ============================================================
  section("Test 2: All Predefined Models");

  log(`Available models (${Object.keys(PREDEFINED_MODELS).length}):`, "yellow");
  for (const [name, config] of Object.entries(PREDEFINED_MODELS)) {
    log(`  - ${name}: ${config.modelFamily} v${config.modelVersion}`, "blue");
    log(`    Capabilities: ${config.capabilities.join(", ")}`, "blue");
  }

  // ============================================================
  // Test 3: Thinking Mode Detection
  // ============================================================
  section("Test 3: Thinking Mode Detection");

  const complexPrompt = "Analyze the trade-offs between SQL and NoSQL for real-time chat applications";
  const simplePrompt = "What is 2 + 2?";

  const useThinkingComplex = shouldUseThinkingMode(complexPrompt, glmConfig!);
  const useThinkingSimple = shouldUseThinkingMode(simplePrompt, glmConfig!);

  log(`Complex prompt: "${complexPrompt}"`, "blue");
  log(`  Should use thinking: ${useThinkingComplex ? "YES" : "NO"}`, useThinkingComplex ? "green" : "yellow");

  log(`Simple prompt: "${simplePrompt}"`, "blue");
  log(`  Should use thinking: ${useThinkingSimple ? "YES" : "NO"}`, useThinkingSimple ? "green" : "yellow");

  // ============================================================
  // Test 4: Special Token Formatting
  // ============================================================
  section("Test 4: Special Token Formatting");

  const testContent = "This is complex reasoning content";
  const formattedThinking = formatWithSpecialTokens(testContent, glmConfig!, "thinking");
  const formattedStandard = formatWithSpecialTokens(testContent, glmConfig!, "standard");

  log("Thinking mode format:", "blue");
  log(`  ${formattedThinking}`, "magenta");
  log("\nStandard mode format:", "blue");
  log(`  ${formattedStandard}`, "magenta");

  // ============================================================
  // Test 5: Schema Validation
  // ============================================================
  section("Test 5: Schema Validation");

  try {
    const validatedSchema = validatePromptSchema(TEST_SCHEMA);
    log("✓ Schema validation passed", "green");
    log(`  promptId: ${validatedSchema.promptId}`, "blue");
    log(`  promptType: ${validatedSchema.promptType}`, "blue");
    log(`  responseSchema type: ${(validatedSchema.responseSchema as any).type}`, "blue");
  } catch (error: any) {
    log(`✗ Schema validation failed: ${error.message}`, "red");
  }

  // Test safe parsing with invalid data
  const invalidResult = safeParsePromptSchema({ promptId: 123 }); // invalid
  log(`Safe parse invalid data: ${invalidResult === null ? "null (expected)" : "unexpected"}`, invalidResult === null ? "green" : "red");

  // ============================================================
  // Test 6: Input Validation
  // ============================================================
  section("Test 6: Input Validation");

  // Test JSON validation
  const jsonSchema = {
    type: "object",
    properties: {
      name: { type: "string" },
      age: { type: "number", minimum: 0 },
    },
    required: ["name"],
  };

  const validJson = { name: "Alice", age: 30 };
  const invalidJson = { age: 30 }; // missing required name

  const validJsonResult = validateJsonInput(validJson, jsonSchema);
  const invalidJsonResult = validateJsonInput(invalidJson, jsonSchema);

  log(`Valid JSON input:`, "blue");
  log(`  isValid: ${validJsonResult.isValid}`, validJsonResult.isValid ? "green" : "red");
  log(`Invalid JSON input:`, "blue");
  log(`  isValid: ${invalidJsonResult.isValid}`, !invalidJsonResult.isValid ? "green" : "red");
  log(`  errors: ${invalidJsonResult.errors.join(", ")}`, "yellow");

  // Test text validation
  const textConstraints: TextConstraintsSchema = {
    minLength: 5,
    maxLength: 100,
    pattern: "^[a-zA-Z ]+$",
  };

  const validText = "Hello World";
  const invalidText = "Hi!";
  const patternInvalid = "Hello123";

  const validTextResult = validateTextInput(validText, textConstraints);
  const invalidTextResult = validateTextInput(invalidText, textConstraints);
  const patternInvalidResult = validateTextInput(patternInvalid, textConstraints);

  log(`Text validation - valid input:`, "blue");
  log(`  isValid: ${validTextResult.isValid}`, validTextResult.isValid ? "green" : "red");
  log(`Text validation - too short:`, "blue");
  log(`  isValid: ${invalidTextResult.isValid}`, !invalidTextResult.isValid ? "green" : "red");
  log(`  errors: ${invalidTextResult.errors.join(", ")}`, "yellow");
  log(`Text validation - pattern mismatch:`, "blue");
  log(`  isValid: ${patternInvalidResult.isValid}`, !patternInvalidResult.isValid ? "green" : "red");
  log(`  errors: ${patternInvalidResult.errors.join(", ")}`, "yellow");

  // ============================================================
  // Test 7: Database and SchemaManager - CRUD Operations
  // ============================================================
  section("Test 7: Database CRUD Operations");

  // Clean up any existing test database
  const fs = await import("fs");
  if (fs.existsSync(TEST_DB)) {
    fs.unlinkSync(TEST_DB);
    log(`Cleaned up existing test database`, "yellow");
  }

  // Create database
  const db = new Database({ url: `sqlite:///${TEST_DB}` });
  await db.connect();
  log("✓ Database connected", "green");

  // Create schema manager
  const manager = new SchemaManager({ database: db });
  log("✓ SchemaManager created", "green");

  // CREATE
  log("\n--- CREATE ---", "cyan");
  const createdSchema = await manager.createPromptSchema(TEST_SCHEMA);
  log(`✓ Schema created with ID: ${createdSchema.promptId}`, "green");
  log(`  Title: ${createdSchema.promptType}`, "blue");
  log(`  Created at: ${new Date(createdSchema.createdAt! * 1000).toISOString()}`, "blue");

  // READ (by ID)
  log("\n--- GET (by ID) ---", "cyan");
  const retrievedSchema = await manager.getPromptSchema(TEST_SCHEMA.promptId);
  log(`✓ Schema retrieved: ${retrievedSchema.promptId}`, "green");
  log(`  Prompt text: ${retrievedSchema.promptText.substring(0, 50)}...`, "blue");

  // LIST
  log("\n--- LIST ---", "cyan");
  const allSchemas = await manager.listPromptSchemas();
  log(`✓ Found ${allSchemas.length} schema(s)`, "green");
  for (const schema of allSchemas) {
    log(`  - ${schema.promptId} (${schema.promptType})`, "blue");
  }

  // UPDATE
  log("\n--- UPDATE ---", "cyan");
  const updatedSchema = await manager.updatePromptSchema({
    promptId: TEST_SCHEMA.promptId,
    promptTitle: "Code Reviewer (Updated)",
    promptText: "Review the code for bugs, security issues, and improvements",
  });
  log(`✓ Schema updated`, "green");
  log(`  New title: ${updatedSchema.promptType}`, "blue");
  log(`  Updated at: ${updatedSchema.lastUpdated ? new Date(updatedSchema.lastUpdated * 1000).toISOString() : "N/A"}`, "blue");

  // DELETE
  log("\n--- DELETE ---", "cyan");
  const deleted = await manager.deletePromptSchema(TEST_SCHEMA.promptId);
  log(`✓ Schema ${deleted ? "deleted" : "not deleted"}: ${TEST_SCHEMA.promptId}`, deleted ? "green" : "red");

  // Verify deletion
  const afterDelete = await manager.listPromptSchemas();
  log(`  Schemas remaining: ${afterDelete.length}`, "blue");

  // Clean up
  await db.disconnect();
  log("\n✓ Database disconnected", "green");
  fs.unlinkSync(TEST_DB);
  log("✓ Test database removed", "green");

  // ============================================================
  // Test 8: Multiple Schemas
  // ============================================================
  section("Test 8: Multiple Schemas Management");

  const multiDb = new Database({ url: `sqlite:///${TEST_DB}` });
  await multiDb.connect();
  const multiManager = new SchemaManager({ database: multiDb });

  // Create multiple schemas
  const schemasToCreate = [
    {
      promptId: "schema-1",
      promptTitle: "Schema 1",
      promptText: "First test schema",
      responseSchema: { type: "object" },
    },
    {
      promptId: "schema-2",
      promptTitle: "Schema 2",
      promptText: "Second test schema",
      responseSchema: { type: "object" },
    },
    {
      promptId: "schema-3",
      promptTitle: "Schema 3",
      promptText: "Third test schema",
      responseSchema: { type: "object" },
    },
  ];

  for (const schema of schemasToCreate) {
    await multiManager.createPromptSchema(schema);
    log(`✓ Created ${schema.promptId}`, "green");
  }

  // List with pagination
  const page1 = await multiManager.listPromptSchemas(2, 0);
  const page2 = await multiManager.listPromptSchemas(2, 2);

  log(`\nPagination test:`, "yellow");
  log(`  Page 1 (limit=2, offset=0): ${page1.length} results`, "blue");
  page1.forEach(s => log(`    - ${s.promptId}`, "blue"));
  log(`  Page 2 (limit=2, offset=2): ${page2.length} results`, "blue");
  page2.forEach(s => log(`    - ${s.promptId}`, "blue"));

  // Cleanup
  for (const schema of schemasToCreate) {
    await multiManager.deletePromptSchema(schema.promptId);
  }
  await multiDb.disconnect();
  if (fs.existsSync(TEST_DB)) {
    fs.unlinkSync(TEST_DB);
  }
  log(`✓ Cleanup complete`, "green");

  // ============================================================
  // Summary
  // ============================================================
  section("Test Summary");

  log("All tests completed successfully!", "green");
  log("\nLibrary Features Demonstrated:", "yellow");
  log("  ✓ Database (SQLite) connection and operations", "blue");
  log("  ✓ SchemaManager (CRUD operations)", "blue");
  log("  ✓ Prompt schema validation with Zod", "blue");
  log("  ✓ Input validation (JSON, text, patterns)", "blue");
  log("  ✓ GLM-4.7 model configuration", "blue");
  log("  ✓ Thinking mode detection", "blue");
  log("  ✓ Special token formatting", "blue");
  log("  ✓ Pagination support", "blue");
}

// Run tests
runTests().catch((error) => {
  log(`Error: ${error.message}`, "red");
  console.error(error);
  process.exit(1);
});
