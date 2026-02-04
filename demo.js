"use strict";
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
var index_ts_1 = require("./src/index.ts");
var index_ts_2 = require("./src/validation/index.ts");
var index_ts_3 = require("./src/capabilities/index.ts");
var DB_URL = "sqlite:///./demo.db";
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var db, manager, codeReviewSchema, testGenSchema, schemas, retrieved, updated, jsonResult, textResult, claudeConfig, useThinking;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log("╔════════════════════════════════════════════════════════════╗");
                    console.log("║   Structured Prompts TypeScript - Interactive Demo          ║");
                    console.log("╚════════════════════════════════════════════════════════════╝\n");
                    // ============================================================
                    // STEP 1: Database Connection
                    // ============================================================
                    console.log("📦 STEP 1: Connecting to database...");
                    db = new index_ts_1.Database({ url: DB_URL });
                    return [4 /*yield*/, db.connect()];
                case 1:
                    _a.sent();
                    console.log("   ✓ Connected to", DB_URL);
                    manager = new index_ts_1.SchemaManager({ database: db });
                    console.log("   ✓ SchemaManager created\n");
                    // ============================================================
                    // STEP 2: Create a Prompt Schema
                    // ============================================================
                    console.log("📝 STEP 2: Creating prompt schema...");
                    return [4 /*yield*/, manager.createPromptSchema({
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
                        })];
                case 2:
                    codeReviewSchema = _a.sent();
                    console.log("   ✓ Created schema:", codeReviewSchema.promptId);
                    console.log("   └─ Title:", codeReviewSchema.promptType);
                    console.log("   └─ Categories:", codeReviewSchema.promptCategories);
                    console.log("   └─ Is Public:", codeReviewSchema.isPublic);
                    console.log("   └─ Ranking:", codeReviewSchema.ranking, "\n");
                    // ============================================================
                    // STEP 3: Create Another Schema
                    // ============================================================
                    console.log("📝 STEP 3: Creating second schema...");
                    return [4 /*yield*/, manager.createPromptSchema({
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
                        })];
                case 3:
                    testGenSchema = _a.sent();
                    console.log("   ✓ Created schema:", testGenSchema.promptId);
                    console.log("   └─ Is Public:", testGenSchema.isPublic, "\n");
                    // ============================================================
                    // STEP 4: List All Schemas
                    // ============================================================
                    console.log("📋 STEP 4: Listing all schemas...");
                    return [4 /*yield*/, manager.listPromptSchemas(10, 0)];
                case 4:
                    schemas = _a.sent();
                    console.log("   \u2713 Found ".concat(schemas.length, " schema(s):"));
                    schemas.forEach(function (s) {
                        console.log("      \u2514\u2500 ".concat(s.promptId, " (").concat(s.promptType, ") - Public: ").concat(s.isPublic));
                    });
                    console.log();
                    // ============================================================
                    // STEP 5: Retrieve Specific Schema
                    // ============================================================
                    console.log("🔍 STEP 5: Retrieving 'code-review-assistant' schema...");
                    return [4 /*yield*/, manager.getPromptSchema("code-review-assistant")];
                case 5:
                    retrieved = _a.sent();
                    console.log("   ✓ Retrieved schema:");
                    console.log("   └─ Prompt:", retrieved.promptText.substring(0, 50) + "...");
                    console.log("   └─ Response Schema:", JSON.stringify(retrieved.responseSchema).substring(0, 80) + "...\n");
                    // ============================================================
                    // STEP 6: Update Schema
                    // ============================================================
                    console.log("✏️  STEP 6: Updating schema...");
                    return [4 /*yield*/, manager.updatePromptSchema({
                            promptId: "code-review-assistant",
                            modelInstruction: "Focus on security vulnerabilities, performance issues, and code quality."
                        })];
                case 6:
                    _a.sent();
                    return [4 /*yield*/, manager.getPromptSchema("code-review-assistant")];
                case 7:
                    updated = _a.sent();
                    console.log("   ✓ Schema updated");
                    console.log("   └─ Model Instruction:", updated.modelInstruction, "\n");
                    // ============================================================
                    // STEP 7: Test Validation
                    // ============================================================
                    console.log("✓ STEP 7: Testing validation...");
                    jsonResult = (0, index_ts_2.validateJsonInput)({ name: "test", count: 5 }, { type: "object", properties: { name: { type: "string" }, count: { type: "number" } } });
                    console.log("   ✓ JSON Validation:", jsonResult.isValid ? "Valid" : "Invalid");
                    textResult = (0, index_ts_2.validateTextInput)("hello world", { minLength: 3, maxLength: 50, pattern: "^[a-z ]+$" });
                    console.log("   ✓ Text Validation:", textResult.isValid ? "Valid" : "Invalid");
                    console.log();
                    // ============================================================
                    // STEP 8: Test Model Capabilities
                    // ============================================================
                    console.log("🤖 STEP 8: Testing model capabilities...");
                    claudeConfig = (0, index_ts_3.getModelConfig)("claude-3-opus");
                    if (claudeConfig) {
                        console.log("   ✓ Claude 3 Opus Config:");
                        console.log("      └─ Capabilities:", claudeConfig.capabilities.length, "capabilities");
                        console.log("      └─ Max Thinking Tokens:", claudeConfig.maxThinkingTokens);
                        console.log("      └─ Supports Thinking:", claudeConfig.capabilities.includes(index_ts_3.ModelCapability.THINKING));
                        useThinking = (0, index_ts_3.shouldUseThinkingMode)("Solve this complex mathematical proof", claudeConfig);
                        console.log("      └─ Should use thinking mode for 'mathematical proof':", useThinking);
                    }
                    console.log();
                    // ============================================================
                    // STEP 9: Cleanup
                    // ============================================================
                    console.log("🧹 STEP 9: Cleaning up...");
                    return [4 /*yield*/, manager.deletePromptSchema("code-review-assistant")];
                case 8:
                    _a.sent();
                    console.log("   ✓ Deleted 'code-review-assistant'");
                    return [4 /*yield*/, manager.deletePromptSchema("test-generator")];
                case 9:
                    _a.sent();
                    console.log("   ✓ Deleted 'test-generator'");
                    return [4 /*yield*/, db.disconnect()];
                case 10:
                    _a.sent();
                    console.log("   ✓ Database disconnected\n");
                    // ============================================================
                    // FINISH
                    // ============================================================
                    console.log("╔════════════════════════════════════════════════════════════╗");
                    console.log("║                    ✅ Demo Complete!                        ║");
                    console.log("╚════════════════════════════════════════════════════════════╝");
                    return [2 /*return*/];
            }
        });
    });
}
// Run the demo
main().catch(function (error) {
    console.error("❌ Demo failed:", error);
    process.exit(1);
});
