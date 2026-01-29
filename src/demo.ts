/**
 * Structured Prompts TS - Comprehensive Demo
 * Tests all major functionality of the library
 */

import { Database, SchemaManager } from "./index.js";
import {
  validateJsonInput,
  validateTextInput,
  validateCodeInput,
  TextConstraintsSchema,
  InputType,
  COMMON_INPUT_SCHEMAS,
} from "./validation/index.js";
import {
  getModelConfig,
  ModelCapability,
  shouldUseThinkingMode,
  formatWithSpecialTokens,
} from "./capabilities/index.js";

async function main() {
  console.log("=== Structured Prompts TS Demo ===\n");

  // ============================================================
  // Task 1 & 2: Create Database and First Schema
  // ============================================================
  console.log("Task 1: Creating database connection...");
  const db = new Database({ url: "sqlite:///./demo.db" });
  await db.connect();
  console.log("✓ Database connected\n");

  const manager = new SchemaManager({ database: db });

  console.log("Task 1: Creating 'code-review-1' schema...");
  const codeReviewSchema = await manager.createPromptSchema({
    promptId: "code-review-1",
    promptTitle: "Code Review Assistant",
    promptText: "You are an expert code reviewer. Analyze the given code for bugs, security issues, and improvements.",
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
              location: { type: "string" },
            },
          },
        },
        rating: { type: "number", minimum: 1, maximum: 10 },
      },
    },
    modelCapabilities: {
      supportsFunctionCalling: true,
      supportsVision: false,
    },
  });
  console.log("✓ Created schema:", codeReviewSchema.promptId);
  console.log("  Title:", codeReviewSchema.promptType);
  console.log("");

  // ============================================================
  // Task 3: Add a Second Schema
  // ============================================================
  console.log("Task 3: Creating 'test-generator-1' schema...");
  const testGeneratorSchema = await manager.createPromptSchema({
    promptId: "test-generator-1",
    promptTitle: "Test Generator",
    promptText: "Generate comprehensive unit tests for the given code.",
    promptDescription: "Creates unit tests with coverage tracking",
    promptCategories: ["testing", "code-generation", "quality"],
    responseSchema: {
      type: "object",
      properties: {
        testCases: {
          type: "array",
          items: {
            type: "object",
            properties: {
              testName: { type: "string" },
              description: { type: "string" },
              input: { type: "object" },
              expectedOutput: { type: "object" },
            },
          },
        },
        coverage: { type: "number", minimum: 0, maximum: 100 },
        framework: { type: "string" },
      },
      required: ["testCases", "coverage"],
    },
    isPublic: true,
  });
  console.log("✓ Created schema:", testGeneratorSchema.promptId);
  console.log("  Title:", testGeneratorSchema.promptType);
  console.log("  Public:", testGeneratorSchema.isPublic);
  console.log("  Categories:", testGeneratorSchema.promptCategories);
  console.log("");

  // ============================================================
  // Task 4: List and Retrieve Schemas
  // ============================================================
  console.log("Task 4: Listing all schemas...");
  const allSchemas = await manager.listPromptSchemas();
  console.log("✓ Found", allSchemas.length, "schemas:");
  for (const schema of allSchemas) {
    console.log("  -", schema.promptId, "(", schema.promptType, ")");
  }
  console.log("");

  console.log("Task 4: Retrieving 'code-review-1' schema...");
  const retrievedSchema = await manager.getPromptSchema("code-review-1");
  console.log("✓ Retrieved schema:", retrievedSchema.promptId);
  console.log("  Prompt text:", retrievedSchema.promptText.substring(0, 60) + "...");
  console.log("");

  // ============================================================
  // Task 5: Update a Schema
  // ============================================================
  console.log("Task 5: Updating 'code-review-1' schema...");
  const updatedSchema = await manager.updatePromptSchema({
    promptId: "code-review-1",
    modelInstruction: "Focus on security vulnerabilities and performance issues.",
  });
  console.log("✓ Updated schema:", updatedSchema.promptId);
  console.log("  Model instruction:", updatedSchema.modelInstruction);
  console.log("");

  // ============================================================
  // Task 6: Test Validation
  // ============================================================
  console.log("Task 6: Testing validation functions...");
  console.log("");

  // 6.1: Validate JSON input against a schema
  console.log("6.1: Validating JSON input against schema...");
  const jsonInput = {
    summary: "Code looks good overall",
    issues: [
      { severity: "medium", description: "Missing error handling", location: "line 42" },
    ],
    rating: 8,
  };
  const jsonResult = validateJsonInput(jsonInput, codeReviewSchema.responseSchema);
  console.log("  Valid:", jsonResult.isValid);
  console.log("  Errors:", jsonResult.errors);
  console.log("");

  // 6.2: Validate text input with constraints
  console.log("6.2: Validating text input with constraints...");
  const textConstraints = TextConstraintsSchema.parse({
    minLength: 10,
    maxLength: 100,
    pattern: "^[A-Z].*", // Must start with uppercase
  });
  const textResult = validateTextInput("Hello, this is a valid input!", textConstraints);
  console.log("  Valid:", textResult.isValid);
  console.log("  Errors:", textResult.errors);
  console.log("");

  // 6.3: Test invalid text input
  console.log("6.3: Testing invalid text input (too short)...");
  const invalidTextResult = validateTextInput("Hi!", textConstraints);
  console.log("  Valid:", invalidTextResult.isValid);
  console.log("  Errors:", invalidTextResult.errors);
  console.log("");

  // 6.4: Validate code input
  console.log("6.4: Validating JavaScript code input...");
  const codeResult = validateCodeInput("const x = 42; console.log(x);", "javascript");
  console.log("  Valid:", codeResult.isValid);
  console.log("  Errors:", codeResult.errors);
  console.log("");

  // 6.5: Test invalid code
  console.log("6.5: Testing invalid JavaScript...");
  const invalidCodeResult = validateCodeInput("const x = ", "javascript");
  console.log("  Valid:", invalidCodeResult.isValid);
  console.log("  Errors:", invalidCodeResult.errors);
  console.log("");

  // ============================================================
  // Task 7: Test Model Capabilities
  // ============================================================
  console.log("Task 7: Testing model capabilities...");
  console.log("");

  // 7.1: Get predefined model config
  console.log("7.1: Getting 'glm-4.7' config...");
  const glmConfig = getModelConfig("glm-4.7");
  if (glmConfig) {
    console.log("  Model family:", glmConfig.modelFamily);
    console.log("  Version:", glmConfig.modelVersion);
    console.log("  Capabilities:", glmConfig.capabilities);
    console.log("");
  }

  // 7.2: Check if supports thinking mode
  console.log("7.2: Checking thinking mode support...");
  const supportsThinking = glmConfig?.capabilities.includes(ModelCapability.THINKING) ?? false;
  console.log("  GLM-4.7 supports thinking:", supportsThinking);
  console.log("");

  // 7.3: Print special tokens
  console.log("7.3: Printing special tokens...");
  console.log("  GLM-4.7 special tokens:", glmConfig?.specialTokens);
  console.log("");

  // 7.4: Test thinking mode detection
  console.log("7.4: Testing thinking mode detection...");
  const shouldThink = shouldUseThinkingMode(
    "Help me with complex reasoning for mathematical proof",
    glmConfig!
  );
  console.log("  Should use thinking mode:", shouldThink);
  console.log("");

  // 7.5: Test special token formatting
  console.log("7.5: Testing special token formatting...");
  const formatted = formatWithSpecialTokens(
    "This is my thinking process",
    glmConfig!,
    "thinking"
  );
  console.log("  Formatted output:", formatted);
  console.log("");

  // ============================================================
  // Task 8: Clean Up
  // ============================================================
  console.log("Task 8: Cleaning up...");
  const deleted1 = await manager.deletePromptSchema("code-review-1");
  console.log("✓ Deleted 'code-review-1':", deleted1);

  const deleted2 = await manager.deletePromptSchema("test-generator-1");
  console.log("✓ Deleted 'test-generator-1':", deleted2);

  await db.disconnect();
  console.log("✓ Database disconnected");
  console.log("");

  console.log("=== All tests completed successfully! ===");
}

main().catch(console.error);
