"use strict";
/**
 * Model-specific capabilities and configurations
 * Port of Python model_capabilities.py
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PREDEFINED_MODELS = exports.PromptOptimizationSchema = exports.ModelConfigSchema = exports.SystemPromptSchema = exports.SystemPromptConditionSchema = exports.TokenFormat = exports.ModelCapability = void 0;
exports.getModelConfig = getModelConfig;
exports.formatWithSpecialTokens = formatWithSpecialTokens;
exports.shouldUseThinkingMode = shouldUseThinkingMode;
exports.validateModelConfig = validateModelConfig;
exports.validateSystemPrompt = validateSystemPrompt;
exports.validatePromptOptimization = validatePromptOptimization;
var zod_1 = require("zod");
// ====================================================================
// Enums
// ====================================================================
/**
 * Supported model capabilities
 */
var ModelCapability;
(function (ModelCapability) {
    ModelCapability["THINKING"] = "thinking";
    ModelCapability["FUNCTION_CALLING"] = "function_calling";
    ModelCapability["VISION"] = "vision";
    ModelCapability["CODE_EXECUTION"] = "code_execution";
    ModelCapability["WEB_SEARCH"] = "web_search";
    ModelCapability["LONG_CONTEXT"] = "long_context";
    ModelCapability["STRUCTURED_OUTPUT"] = "structured_output";
})(ModelCapability || (exports.ModelCapability = ModelCapability = {}));
/**
 * Token format types
 */
var TokenFormat;
(function (TokenFormat) {
    TokenFormat["PLAIN"] = "plain";
    TokenFormat["ANTHROPIC"] = "anthropic";
    TokenFormat["OPENAI"] = "openai";
    TokenFormat["GOOGLE"] = "google";
    TokenFormat["CUSTOM"] = "custom";
})(TokenFormat || (exports.TokenFormat = TokenFormat = {}));
// ====================================================================
// Schemas
// ====================================================================
/**
 * System prompt condition schema
 */
exports.SystemPromptConditionSchema = zod_1.z.object({
    capabilityRequired: zod_1.z.nativeEnum(ModelCapability).optional(),
    userInputContains: zod_1.z.array(zod_1.z.string()).optional(),
    promptCategory: zod_1.z.string().optional(),
    alwaysApply: zod_1.z.boolean().optional().default(false),
});
/**
 * System prompt schema
 */
exports.SystemPromptSchema = zod_1.z.object({
    id: zod_1.z.string().describe("Unique identifier"),
    name: zod_1.z.string().describe("Human-readable name"),
    content: zod_1.z.string().describe("System prompt content"),
    priority: zod_1.z.number().optional().default(0).describe("Priority for ordering (higher = first)"),
    condition: exports.SystemPromptConditionSchema.optional().default({}),
    tokenFormat: zod_1.z.nativeEnum(TokenFormat).optional().default(TokenFormat.PLAIN),
});
/**
 * Model-specific configuration schema
 */
exports.ModelConfigSchema = zod_1.z.object({
    modelFamily: zod_1.z.string().describe("Model family (e.g., claude, gpt, gemini)"),
    modelVersion: zod_1.z.string().optional().describe("Specific model version"),
    capabilities: zod_1.z.array(zod_1.z.nativeEnum(ModelCapability)).optional().default([]),
    specialTokens: zod_1.z
        .record(zod_1.z.string())
        .optional()
        .default({})
        .describe("Special tokens for this model"),
    tokenFormat: zod_1.z.nativeEnum(TokenFormat).optional().default(TokenFormat.PLAIN),
    optimalThinkingPrompts: zod_1.z
        .array(zod_1.z.string())
        .optional()
        .default([])
        .describe("Prompts that benefit from thinking mode"),
    maxThinkingTokens: zod_1.z
        .number()
        .optional()
        .describe("Maximum tokens for thinking (if supported)"),
    requiresSpecialFormatting: zod_1.z.boolean().optional().default(false),
});
/**
 * Prompt optimization settings schema
 */
exports.PromptOptimizationSchema = zod_1.z.object({
    preferThinkingMode: zod_1.z
        .boolean()
        .optional()
        .default(false)
        .describe("Whether this prompt benefits from thinking/reasoning"),
    thinkingInstruction: zod_1.z.string().optional().describe("Custom instruction for thinking mode"),
    modelPreferences: zod_1.z
        .record(zod_1.z.custom(function (val) { return exports.ModelConfigSchema.safeParse(val).success; }))
        .optional()
        .default({})
        .describe("Preferred configurations per model family"),
    fallbackBehavior: zod_1.z
        .string()
        .optional()
        .default("use_standard")
        .describe("Behavior when preferred model unavailable"),
});
// ====================================================================
// Predefined Model Configurations
// ====================================================================
/**
 * Predefined model configurations
 */
exports.PREDEFINED_MODELS = {
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
function getModelConfig(modelName) {
    return exports.PREDEFINED_MODELS[modelName];
}
/**
 * Format content with model-specific special tokens
 */
function formatWithSpecialTokens(content, modelConfig, mode) {
    var _a, _b;
    if (mode === void 0) { mode = "standard"; }
    if (Object.keys((_a = modelConfig.specialTokens) !== null && _a !== void 0 ? _a : {}).length === 0) {
        return content;
    }
    if (mode === "thinking" && ((_b = modelConfig.specialTokens) === null || _b === void 0 ? void 0 : _b.thinking_start)) {
        return "".concat(modelConfig.specialTokens.thinking_start, "\n").concat(content, "\n").concat(modelConfig.specialTokens.thinking_end);
    }
    return content;
}
/**
 * Determine if thinking mode should be used
 */
function shouldUseThinkingMode(prompt, modelConfig, optimization) {
    var _a;
    // Check if model supports thinking
    if (!modelConfig.capabilities.includes(ModelCapability.THINKING)) {
        return false;
    }
    // Check if optimization prefers thinking mode
    if (optimization === null || optimization === void 0 ? void 0 : optimization.preferThinkingMode) {
        return true;
    }
    // Check if prompt matches optimal thinking patterns
    var promptLower = prompt.toLowerCase();
    for (var _i = 0, _b = (_a = modelConfig.optimalThinkingPrompts) !== null && _a !== void 0 ? _a : []; _i < _b.length; _i++) {
        var pattern = _b[_i];
        if (promptLower.includes(pattern.toLowerCase())) {
            return true;
        }
    }
    return false;
}
/**
 * Validate a model config against the schema
 */
function validateModelConfig(data) {
    return exports.ModelConfigSchema.parse(data);
}
/**
 * Validate a system prompt against the schema
 */
function validateSystemPrompt(data) {
    return exports.SystemPromptSchema.parse(data);
}
/**
 * Validate prompt optimization settings
 */
function validatePromptOptimization(data) {
    return exports.PromptOptimizationSchema.parse(data);
}
