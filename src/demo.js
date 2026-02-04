"use strict";
/**
 * Structured Prompts TS - Comprehensive Demo
 * Tests all major functionality of the library
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
var index_js_2 = require("./validation/index.js");
var index_js_3 = require("./capabilities/index.js");
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var db, manager, codeReviewSchema, testGeneratorSchema, allSchemas, _i, allSchemas_1, schema, retrievedSchema, updatedSchema, jsonInput, jsonResult, textConstraints, textResult, invalidTextResult, codeResult, invalidCodeResult, glmConfig, supportsThinking, shouldThink, formatted, deleted1, deleted2;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    console.log("=== Structured Prompts TS Demo ===\n");
                    // ============================================================
                    // Task 1 & 2: Create Database and First Schema
                    // ============================================================
                    console.log("Task 1: Creating database connection...");
                    db = new index_js_1.Database({ url: "sqlite:///./demo.db" });
                    return [4 /*yield*/, db.connect()];
                case 1:
                    _b.sent();
                    console.log("✓ Database connected\n");
                    manager = new index_js_1.SchemaManager({ database: db });
                    console.log("Task 1: Creating 'code-review-1' schema...");
                    return [4 /*yield*/, manager.createPromptSchema({
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
                        })];
                case 2:
                    codeReviewSchema = _b.sent();
                    console.log("✓ Created schema:", codeReviewSchema.promptId);
                    console.log("  Title:", codeReviewSchema.promptType);
                    console.log("");
                    // ============================================================
                    // Task 3: Add a Second Schema
                    // ============================================================
                    console.log("Task 3: Creating 'test-generator-1' schema...");
                    return [4 /*yield*/, manager.createPromptSchema({
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
                        })];
                case 3:
                    testGeneratorSchema = _b.sent();
                    console.log("✓ Created schema:", testGeneratorSchema.promptId);
                    console.log("  Title:", testGeneratorSchema.promptType);
                    console.log("  Public:", testGeneratorSchema.isPublic);
                    console.log("  Categories:", testGeneratorSchema.promptCategories);
                    console.log("");
                    // ============================================================
                    // Task 4: List and Retrieve Schemas
                    // ============================================================
                    console.log("Task 4: Listing all schemas...");
                    return [4 /*yield*/, manager.listPromptSchemas()];
                case 4:
                    allSchemas = _b.sent();
                    console.log("✓ Found", allSchemas.length, "schemas:");
                    for (_i = 0, allSchemas_1 = allSchemas; _i < allSchemas_1.length; _i++) {
                        schema = allSchemas_1[_i];
                        console.log("  -", schema.promptId, "(", schema.promptType, ")");
                    }
                    console.log("");
                    console.log("Task 4: Retrieving 'code-review-1' schema...");
                    return [4 /*yield*/, manager.getPromptSchema("code-review-1")];
                case 5:
                    retrievedSchema = _b.sent();
                    console.log("✓ Retrieved schema:", retrievedSchema.promptId);
                    console.log("  Prompt text:", retrievedSchema.promptText.substring(0, 60) + "...");
                    console.log("");
                    // ============================================================
                    // Task 5: Update a Schema
                    // ============================================================
                    console.log("Task 5: Updating 'code-review-1' schema...");
                    return [4 /*yield*/, manager.updatePromptSchema({
                            promptId: "code-review-1",
                            modelInstruction: "Focus on security vulnerabilities and performance issues.",
                        })];
                case 6:
                    updatedSchema = _b.sent();
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
                    jsonInput = {
                        summary: "Code looks good overall",
                        issues: [
                            { severity: "medium", description: "Missing error handling", location: "line 42" },
                        ],
                        rating: 8,
                    };
                    jsonResult = (0, index_js_2.validateJsonInput)(jsonInput, codeReviewSchema.responseSchema);
                    console.log("  Valid:", jsonResult.isValid);
                    console.log("  Errors:", jsonResult.errors);
                    console.log("");
                    // 6.2: Validate text input with constraints
                    console.log("6.2: Validating text input with constraints...");
                    textConstraints = index_js_2.TextConstraintsSchema.parse({
                        minLength: 10,
                        maxLength: 100,
                        pattern: "^[A-Z].*", // Must start with uppercase
                    });
                    textResult = (0, index_js_2.validateTextInput)("Hello, this is a valid input!", textConstraints);
                    console.log("  Valid:", textResult.isValid);
                    console.log("  Errors:", textResult.errors);
                    console.log("");
                    // 6.3: Test invalid text input
                    console.log("6.3: Testing invalid text input (too short)...");
                    invalidTextResult = (0, index_js_2.validateTextInput)("Hi!", textConstraints);
                    console.log("  Valid:", invalidTextResult.isValid);
                    console.log("  Errors:", invalidTextResult.errors);
                    console.log("");
                    // 6.4: Validate code input
                    console.log("6.4: Validating JavaScript code input...");
                    codeResult = (0, index_js_2.validateCodeInput)("const x = 42; console.log(x);", "javascript");
                    console.log("  Valid:", codeResult.isValid);
                    console.log("  Errors:", codeResult.errors);
                    console.log("");
                    // 6.5: Test invalid code
                    console.log("6.5: Testing invalid JavaScript...");
                    invalidCodeResult = (0, index_js_2.validateCodeInput)("const x = ", "javascript");
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
                    glmConfig = (0, index_js_3.getModelConfig)("glm-4.7");
                    if (glmConfig) {
                        console.log("  Model family:", glmConfig.modelFamily);
                        console.log("  Version:", glmConfig.modelVersion);
                        console.log("  Capabilities:", glmConfig.capabilities);
                        console.log("");
                    }
                    // 7.2: Check if supports thinking mode
                    console.log("7.2: Checking thinking mode support...");
                    supportsThinking = (_a = glmConfig === null || glmConfig === void 0 ? void 0 : glmConfig.capabilities.includes(index_js_3.ModelCapability.THINKING)) !== null && _a !== void 0 ? _a : false;
                    console.log("  GLM-4.7 supports thinking:", supportsThinking);
                    console.log("");
                    // 7.3: Print special tokens
                    console.log("7.3: Printing special tokens...");
                    console.log("  GLM-4.7 special tokens:", glmConfig === null || glmConfig === void 0 ? void 0 : glmConfig.specialTokens);
                    console.log("");
                    // 7.4: Test thinking mode detection
                    console.log("7.4: Testing thinking mode detection...");
                    shouldThink = (0, index_js_3.shouldUseThinkingMode)("Help me with complex reasoning for mathematical proof", glmConfig);
                    console.log("  Should use thinking mode:", shouldThink);
                    console.log("");
                    // 7.5: Test special token formatting
                    console.log("7.5: Testing special token formatting...");
                    formatted = (0, index_js_3.formatWithSpecialTokens)("This is my thinking process", glmConfig, "thinking");
                    console.log("  Formatted output:", formatted);
                    console.log("");
                    // ============================================================
                    // Task 8: Clean Up
                    // ============================================================
                    console.log("Task 8: Cleaning up...");
                    return [4 /*yield*/, manager.deletePromptSchema("code-review-1")];
                case 7:
                    deleted1 = _b.sent();
                    console.log("✓ Deleted 'code-review-1':", deleted1);
                    return [4 /*yield*/, manager.deletePromptSchema("test-generator-1")];
                case 8:
                    deleted2 = _b.sent();
                    console.log("✓ Deleted 'test-generator-1':", deleted2);
                    return [4 /*yield*/, db.disconnect()];
                case 9:
                    _b.sent();
                    console.log("✓ Database disconnected");
                    console.log("");
                    console.log("=== All tests completed successfully! ===");
                    return [2 /*return*/];
            }
        });
    });
}
main().catch(console.error);
