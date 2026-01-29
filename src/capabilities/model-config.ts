/**
 * Model-specific capabilities and configurations
 * Port of Python model_capabilities.py
 */

import { z } from "zod";

// ====================================================================
// Enums
// ====================================================================

/**
 * Supported model capabilities
 */
export enum ModelCapability {
  THINKING = "thinking", // Supports thinking/reasoning mode
  FUNCTION_CALLING = "function_calling",
  VISION = "vision",
  CODE_EXECUTION = "code_execution",
  WEB_SEARCH = "web_search",
  LONG_CONTEXT = "long_context", // 100k+ tokens
  STRUCTURED_OUTPUT = "structured_output", // Native JSON mode
}

/**
 * Token format types
 */
export enum TokenFormat {
  PLAIN = "plain",
  ANTHROPIC = "anthropic", // <thinking>, etc.
  OPENAI = "openai", // System/User/Assistant roles
  GOOGLE = "google", // Gemini format
  CUSTOM = "custom",
}

// ====================================================================
// Schemas
// ====================================================================

/**
 * System prompt condition schema
 */
export const SystemPromptConditionSchema = z.object({
  capabilityRequired: z.nativeEnum(ModelCapability).optional(),
  userInputContains: z.array(z.string()).optional(),
  promptCategory: z.string().optional(),
  alwaysApply: z.boolean().optional().default(false),
});

export type SystemPromptCondition = z.infer<typeof SystemPromptConditionSchema>;

/**
 * System prompt schema
 */
export const SystemPromptSchema = z.object({
  id: z.string().describe("Unique identifier"),
  name: z.string().describe("Human-readable name"),
  content: z.string().describe("System prompt content"),
  priority: z.number().optional().default(0).describe("Priority for ordering (higher = first)"),
  condition: SystemPromptConditionSchema.optional().default({}),
  tokenFormat: z.nativeEnum(TokenFormat).optional().default(TokenFormat.PLAIN),
});

export type SystemPrompt = z.infer<typeof SystemPromptSchema>;

/**
 * Model-specific configuration schema
 */
export const ModelConfigSchema = z.object({
  modelFamily: z.string().describe("Model family (e.g., claude, gpt, gemini)"),
  modelVersion: z.string().optional().describe("Specific model version"),
  capabilities: z.array(z.nativeEnum(ModelCapability)).optional().default([]),
  specialTokens: z
    .record(z.string())
    .optional()
    .default({})
    .describe("Special tokens for this model"),
  tokenFormat: z.nativeEnum(TokenFormat).optional().default(TokenFormat.PLAIN),
  optimalThinkingPrompts: z
    .array(z.string())
    .optional()
    .default([])
    .describe("Prompts that benefit from thinking mode"),
  maxThinkingTokens: z
    .number()
    .optional()
    .describe("Maximum tokens for thinking (if supported)"),
  requiresSpecialFormatting: z.boolean().optional().default(false),
});

export type ModelConfig = z.infer<typeof ModelConfigSchema>;

/**
 * Prompt optimization settings schema
 */
export const PromptOptimizationSchema = z.object({
  preferThinkingMode: z
    .boolean()
    .optional()
    .default(false)
    .describe("Whether this prompt benefits from thinking/reasoning"),
  thinkingInstruction: z.string().optional().describe("Custom instruction for thinking mode"),
  modelPreferences: z
    .record(z.custom<ModelConfig>((val) => ModelConfigSchema.safeParse(val).success))
    .optional()
    .default({})
    .describe("Preferred configurations per model family"),
  fallbackBehavior: z
    .string()
    .optional()
    .default("use_standard")
    .describe("Behavior when preferred model unavailable"),
});

export type PromptOptimization = z.infer<typeof PromptOptimizationSchema>;

// ====================================================================
// Predefined Model Configurations
// ====================================================================

/**
 * Predefined model configurations
 */
export const PREDEFINED_MODELS: Record<string, ModelConfig> = {
  "glm-4.7": {
    modelFamily: "glm",
    modelVersion: "4.7",
    capabilities: [
      ModelCapability.FUNCTION_CALLING,
      ModelCapability.VISION,
      ModelCapability.LONG_CONTEXT,
      ModelCapability.STRUCTURED_OUTPUT,
      ModelCapability.THINKING,
      ModelCapability.WEB_SEARCH,
    ],
    specialTokens: {
      thinking_start: "<thinking>",
      thinking_end: "</thinking>",
      answer_start: "<answer>",
      answer_end: "</answer>",
    },
    tokenFormat: TokenFormat.OPENAI,
    optimalThinkingPrompts: [
      "complex reasoning",
      "mathematical proof",
      "code architecture",
      "scientific analysis",
      "data analysis",
    ],
    requiresSpecialFormatting: false,
    maxThinkingTokens: 128000,
  },
  "claude-3-opus": {
    modelFamily: "claude",
    modelVersion: "3-opus",
    capabilities: [
      ModelCapability.FUNCTION_CALLING,
      ModelCapability.VISION,
      ModelCapability.LONG_CONTEXT,
      ModelCapability.STRUCTURED_OUTPUT,
    ],
    specialTokens: {
      thinking_start: "<thinking>",
      thinking_end: "</thinking>",
      answer_start: "<answer>",
      answer_end: "</answer>",
    },
    tokenFormat: TokenFormat.ANTHROPIC,
    optimalThinkingPrompts: [],
    requiresSpecialFormatting: false,
    maxThinkingTokens: 100000,
  },
  "gpt-4": {
    modelFamily: "gpt",
    modelVersion: "4",
    capabilities: [
      ModelCapability.FUNCTION_CALLING,
      ModelCapability.VISION,
      ModelCapability.STRUCTURED_OUTPUT,
    ],
    specialTokens: {},
    tokenFormat: TokenFormat.OPENAI,
    optimalThinkingPrompts: [],
    requiresSpecialFormatting: false,
  },
  "gemini-pro": {
    modelFamily: "gemini",
    modelVersion: "pro",
    capabilities: [
      ModelCapability.FUNCTION_CALLING,
      ModelCapability.VISION,
      ModelCapability.WEB_SEARCH,
      ModelCapability.CODE_EXECUTION,
    ],
    specialTokens: {},
    tokenFormat: TokenFormat.GOOGLE,
    optimalThinkingPrompts: [],
    requiresSpecialFormatting: false,
  },
  o1: {
    modelFamily: "openai",
    modelVersion: "o1",
    capabilities: [ModelCapability.THINKING, ModelCapability.LONG_CONTEXT],
    specialTokens: {},
    tokenFormat: TokenFormat.OPENAI,
    optimalThinkingPrompts: [
      "complex reasoning",
      "mathematical proof",
      "code architecture",
      "scientific analysis",
    ],
    requiresSpecialFormatting: false,
  },
};

// ====================================================================
// Helper Functions
// ====================================================================

/**
 * Get predefined model configuration
 */
export function getModelConfig(modelName: string): ModelConfig | undefined {
  return PREDEFINED_MODELS[modelName];
}

/**
 * Format content with model-specific special tokens
 */
export function formatWithSpecialTokens(
  content: string,
  modelConfig: ModelConfig,
  mode: "standard" | "thinking" = "standard"
): string {
  if (Object.keys(modelConfig.specialTokens ?? {}).length === 0) {
    return content;
  }

  if (mode === "thinking" && modelConfig.specialTokens?.thinking_start) {
    return `${modelConfig.specialTokens.thinking_start}\n${content}\n${modelConfig.specialTokens.thinking_end}`;
  }

  return content;
}

/**
 * Determine if thinking mode should be used
 */
export function shouldUseThinkingMode(
  prompt: string,
  modelConfig: ModelConfig,
  optimization?: PromptOptimization
): boolean {
  // Check if model supports thinking
  if (!modelConfig.capabilities.includes(ModelCapability.THINKING)) {
    return false;
  }

  // Check if optimization prefers thinking mode
  if (optimization?.preferThinkingMode) {
    return true;
  }

  // Check if prompt matches optimal thinking patterns
  const promptLower = prompt.toLowerCase();
  for (const pattern of modelConfig.optimalThinkingPrompts ?? []) {
    if (promptLower.includes(pattern.toLowerCase())) {
      return true;
    }
  }

  return false;
}

/**
 * Validate a model config against the schema
 */
export function validateModelConfig(data: unknown): ModelConfig {
  return ModelConfigSchema.parse(data);
}

/**
 * Validate a system prompt against the schema
 */
export function validateSystemPrompt(data: unknown): SystemPrompt {
  return SystemPromptSchema.parse(data);
}

/**
 * Validate prompt optimization settings
 */
export function validatePromptOptimization(data: unknown): PromptOptimization {
  return PromptOptimizationSchema.parse(data);
}
