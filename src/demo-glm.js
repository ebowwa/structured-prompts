"use strict";
/**
 * Structured Prompts TS - GLM-4.7 Integration Demo
 * Tests real API calls to GLM-4.7 using OpenAI-compatible endpoint
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var index_js_1 = require("./index.js");
var index_js_2 = require("./capabilities/index.js");
var openai_1 = require("openai");
// GLM-4.7 Configuration from Z.AI docs
var GLM_CONFIG = {
    baseURL: "https://api.z.ai/api/coding/paas/v4",
    model: "GLM-4.7",
};
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var db, manager, glmConfig, apiKey, glm, codeSnippet, prompt, response, error_1, complexPrompt, useThinking, thinkingPrompt, thinkingResponse, error_2;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    console.log("=== Structured Prompts TS + GLM-4.7 Demo ===\n");
                    // ============================================================
                    // Setup Database and Schema
                    // ============================================================
                    console.log("Setting up database...");
                    db = new index_js_1.Database({ url: "sqlite:///./demo-glm.db" });
                    return [4 /*yield*/, db.connect()];
                case 1:
                    _b.sent();
                    manager = new index_js_1.SchemaManager({ database: db });
                    // Create a code review schema
                    console.log("Creating code review schema...");
                    return [4 /*yield*/, manager.createPromptSchema({
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
                        })];
                case 2:
                    _b.sent();
                    console.log("✓ Schema created\n");
                    // ============================================================
                    // Get GLM Model Config
                    // ============================================================
                    console.log("GLM-4.7 Model Configuration:");
                    glmConfig = (0, index_js_2.getModelConfig)("glm-4.7");
                    if (glmConfig) {
                        console.log("  Family:", glmConfig.modelFamily);
                        console.log("  Version:", glmConfig.modelVersion);
                        console.log("  Thinking support:", glmConfig.capabilities.includes(index_js_2.ModelCapability.THINKING));
                        console.log("  Max thinking tokens:", glmConfig.maxThinkingTokens);
                        console.log("  Special tokens:", glmConfig.specialTokens);
                    }
                    console.log("");
                    // ============================================================
                    // Real GLM API Call
                    // ============================================================
                    console.log("=== Real GLM-4.7 API Call ===\n");
                    apiKey = process.env.Z_AI_API_KEY || process.env.ZAI_API_KEY || process.env.GLM_API_KEY;
                    if (!!apiKey) return [3 /*break*/, 4];
                    console.error("❌ No API key found. Set Z_AI_API_KEY environment variable.");
                    console.log("Run with: doppler run --project seed --config prd -- bun run src/demo-glm.ts");
                    return [4 /*yield*/, db.disconnect()];
                case 3:
                    _b.sent();
                    return [2 /*return*/];
                case 4:
                    glm = new openai_1.default({
                        baseURL: GLM_CONFIG.baseURL,
                        apiKey: apiKey,
                    });
                    codeSnippet = "\nfunction processUserData(input) {\n  const data = JSON.parse(input);\n  return data.username + \": \" + data.email;\n}\n  ";
                    prompt = "Review this code for security issues and improvements:\n\n```javascript\n".concat(codeSnippet, "\n```\n\nPlease respond with a JSON object containing:\n- summary: brief review\n- issues: array of issues with severity, description, and suggestion\n- rating: overall score (1-10)");
                    console.log("Sending request to GLM-4.7...");
                    console.log("Prompt:", prompt.substring(0, 100) + "...\n");
                    _b.label = 5;
                case 5:
                    _b.trys.push([5, 7, , 8]);
                    return [4 /*yield*/, glm.chat.completions.create({
                            model: GLM_CONFIG.model,
                            messages: [{ role: "user", content: prompt }],
                            temperature: 0.7,
                        })];
                case 6:
                    response = _b.sent();
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
                    return [3 /*break*/, 8];
                case 7:
                    error_1 = _b.sent();
                    console.error("❌ API Error:", error_1.message);
                    if (error_1.response) {
                        console.error("Response:", error_1.response.data);
                    }
                    return [3 /*break*/, 8];
                case 8:
                    // ============================================================
                    // Test with Thinking Mode
                    // ============================================================
                    console.log("\n=== Testing Thinking Mode ===\n");
                    complexPrompt = "Analyze the trade-offs between using SQL vs NoSQL for a real-time chat application.";
                    useThinking = (0, index_js_2.shouldUseThinkingMode)(complexPrompt, glmConfig);
                    console.log("Should use thinking mode:", useThinking);
                    if (useThinking) {
                        thinkingPrompt = (0, index_js_2.formatWithSpecialTokens)(complexPrompt, glmConfig, "thinking");
                        console.log("Formatted prompt:", thinkingPrompt);
                    }
                    _b.label = 9;
                case 9:
                    _b.trys.push([9, 11, , 12]);
                    return [4 /*yield*/, glm.chat.completions.create({
                            model: GLM_CONFIG.model,
                            messages: [{ role: "user", content: complexPrompt }],
                            temperature: 0.5,
                        })];
                case 10:
                    thinkingResponse = _b.sent();
                    console.log("\n✓ Thinking mode response:");
                    console.log(((_a = thinkingResponse.choices[0].message.content) === null || _a === void 0 ? void 0 : _a.substring(0, 500)) + "...");
                    return [3 /*break*/, 12];
                case 11:
                    error_2 = _b.sent();
                    console.error("❌ Thinking mode error:", error_2.message);
                    return [3 /*break*/, 12];
                case 12:
                    // ============================================================
                    // Cleanup
                    // ============================================================
                    console.log("\n=== Cleanup ===");
                    return [4 /*yield*/, manager.deletePromptSchema("code-review-glm")];
                case 13:
                    _b.sent();
                    console.log("✓ Deleted test schema");
                    return [4 /*yield*/, db.disconnect()];
                case 14:
                    _b.sent();
                    console.log("✓ Database disconnected");
                    console.log("\n=== Demo Complete ===");
                    return [2 /*return*/];
            }
        });
    });
}
main().catch(console.error);
