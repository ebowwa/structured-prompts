/**
 * Structured Prompts TS - GLM-4.7 Integration Demo
 * Tests real API calls to GLM-4.7 using OpenAI-compatible endpoint
 */

import { Database, SchemaManager } from "./index.js";
import {
  validateJsonInput,
  validateTextInput,
  TextConstraintsSchema,
} from "./validation/index.js";
import {
  getModelConfig,
  ModelCapability,
  shouldUseThinkingMode,
  formatWithSpecialTokens,
} from "./capabilities/index.js";
import OpenAI from "openai";

// GLM-4.7 Configuration from Z.AI docs
const GLM_CONFIG = {
  baseURL: "https://api.z.ai/api/coding/paas/v4",
  model: "GLM-4.7",
};

async function main() {
  console.log("=== Structured Prompts TS + GLM-4.7 Demo ===\n");

  // ============================================================
  // Setup Database and Schema
  // ============================================================
  console.log("Setting up database...");
  const db = new Database({ url: "sqlite:///./demo-glm.db" });
  await db.connect();
  const manager = new SchemaManager({ database: db });

  // Create a code review schema
  console.log("Creating code review schema...");
  await manager.createPromptSchema({
    promptId: "code-review-glm",
    promptTitle: "GLM Code Reviewer",
    promptText: "You are an expert code reviewer. Analyze the given code for bugs, security issues, and improvements.",
    responseSchema: {
      type: "object",
      properties: {
        summary: { type: "string" },
        issues: {
          type: "array",
          items: {
            type: "object",
            properties: {
              severity: { type: "string", enum: ["low", "medium", "high", "critical"] },
              description: { type: "string" },
              suggestion: { type: "string" },
            },
          },
        },
        rating: { type: "number", minimum: 1, maximum: 10 },
      },
      required: ["summary", "rating"],
    },
    modelCapabilities: {
      supportsFunctionCalling: true,
      supportsVision: true,
      supportsThinking: true,
    },
  });
  console.log("✓ Schema created\n");

  // ============================================================
  // Get GLM Model Config
  // ============================================================
  console.log("GLM-4.7 Model Configuration:");
  const glmConfig = getModelConfig("glm-4.7");
  if (glmConfig) {
    console.log("  Family:", glmConfig.modelFamily);
    console.log("  Version:", glmConfig.modelVersion);
    console.log("  Thinking support:", glmConfig.capabilities.includes(ModelCapability.THINKING));
    console.log("  Max thinking tokens:", glmConfig.maxThinkingTokens);
    console.log("  Special tokens:", glmConfig.specialTokens);
  }
  console.log("");

  // ============================================================
  // Real GLM API Call
  // ============================================================
  console.log("=== Real GLM-4.7 API Call ===\n");

  const apiKey = process.env.Z_AI_API_KEY || process.env.ZAI_API_KEY || process.env.GLM_API_KEY;
  if (!apiKey) {
    console.error("❌ No API key found. Set Z_AI_API_KEY environment variable.");
    console.log("Run with: doppler run --project seed --config prd -- bun run src/demo-glm.ts");
    await db.disconnect();
    return;
  }

  const glm = new OpenAI({
    baseURL: GLM_CONFIG.baseURL,
    apiKey: apiKey,
  });

  // Test prompt
  const codeSnippet = `
function processUserData(input) {
  const data = JSON.parse(input);
  return data.username + ": " + data.email;
}
  `;

  const prompt = `Review this code for security issues and improvements:

\`\`\`javascript
${codeSnippet}
\`\`\`

Please respond with a JSON object containing:
- summary: brief review
- issues: array of issues with severity, description, and suggestion
- rating: overall score (1-10)`;

  console.log("Sending request to GLM-4.7...");
  console.log("Prompt:", prompt.substring(0, 100) + "...\n");

  try {
    const response = await glm.chat.completions.create({
      model: GLM_CONFIG.model,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    });

    console.log("✓ Response received:\n");
    console.log("--- GLM-4.7 Response ---");
    console.log(response.choices[0].message.content);
    console.log("--- End Response ---\n");

    // Usage stats
    if (response.usage) {
      console.log("Token Usage:");
      console.log("  Prompt tokens:", response.usage.prompt_tokens);
      console.log("  Completion tokens:", response.usage.completion_tokens);
      console.log("  Total tokens:", response.usage.total_tokens);
    }

  } catch (error: any) {
    console.error("❌ API Error:", error.message);
    if (error.response) {
      console.error("Response:", error.response.data);
    }
  }

  // ============================================================
  // Test with Thinking Mode
  // ============================================================
  console.log("\n=== Testing Thinking Mode ===\n");

  const complexPrompt = "Analyze the trade-offs between using SQL vs NoSQL for a real-time chat application.";
  const useThinking = shouldUseThinkingMode(complexPrompt, glmConfig!);

  console.log("Should use thinking mode:", useThinking);

  if (useThinking) {
    const thinkingPrompt = formatWithSpecialTokens(complexPrompt, glmConfig!, "thinking");
    console.log("Formatted prompt:", thinkingPrompt);
  }

  try {
    const thinkingResponse = await glm.chat.completions.create({
      model: GLM_CONFIG.model,
      messages: [{ role: "user", content: complexPrompt }],
      temperature: 0.5,
    });

    console.log("\n✓ Thinking mode response:");
    console.log(thinkingResponse.choices[0].message.content?.substring(0, 500) + "...");
  } catch (error: any) {
    console.error("❌ Thinking mode error:", error.message);
  }

  // ============================================================
  // Cleanup
  // ============================================================
  console.log("\n=== Cleanup ===");
  await manager.deletePromptSchema("code-review-glm");
  console.log("✓ Deleted test schema");
  await db.disconnect();
  console.log("✓ Database disconnected");
  console.log("\n=== Demo Complete ===");
}

main().catch(console.error);
