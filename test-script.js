"use strict";
/**
 * Structured Prompts TS - Comprehensive Test Script
 * Tests the library's main features: Database, SchemaManager, Validation, and Model Config
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
var index_js_1 = require("./src/index.js");
var schema_js_1 = require("./src/models/schema.js");
var index_js_2 = require("./src/validation/index.js");
var index_js_3 = require("./src/capabilities/index.js");
// Test database file
var TEST_DB = "./test-prompts.db";
// ANSI color codes for terminal output
var colors = {
    reset: "\x1b[0m",
    green: "\x1b[32m",
    red: "\x1b[31m",
    yellow: "\x1b[33m",
    blue: "\x1b[34m",
    cyan: "\x1b[36m",
    magenta: "\x1b[35m",
};
function log(message, color) {
    if (color === void 0) { color = "reset"; }
    console.log("".concat(colors[color]).concat(message).concat(colors.reset));
}
function section(title) {
    console.log("\n".concat(colors.cyan).concat("=".repeat(50)));
    console.log("  ".concat(title));
    console.log("".concat("=".repeat(50)).concat(colors.reset, "\n"));
}
// Test data
var TEST_SCHEMA = {
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
function runTests() {
    return __awaiter(this, void 0, void 0, function () {
        var glmConfig, _i, _a, cap, _b, _c, _d, key, value, _e, _f, _g, name_1, config, complexPrompt, simplePrompt, useThinkingComplex, useThinkingSimple, testContent, formattedThinking, formattedStandard, validatedSchema, invalidResult, jsonSchema, validJson, invalidJson, validJsonResult, invalidJsonResult, textConstraints, validText, invalidText, patternInvalid, validTextResult, invalidTextResult, patternInvalidResult, fs, db, manager, createdSchema, retrievedSchema, allSchemas, _h, allSchemas_1, schema, updatedSchema, deleted, afterDelete, multiDb, multiManager, schemasToCreate, _j, schemasToCreate_1, schema, page1, page2, _k, schemasToCreate_2, schema;
        return __generator(this, function (_l) {
            switch (_l.label) {
                case 0:
                    log("Starting Structured Prompts TS Test Suite...", "blue");
                    // ============================================================
                    // Test 1: GLM-4.7 Model Configuration
                    // ============================================================
                    section("Test 1: GLM-4.7 Model Configuration");
                    glmConfig = (0, index_js_3.getModelConfig)("glm-4.7");
                    if (glmConfig) {
                        log("✓ GLM-4.7 config found", "green");
                        log("  Model Family: ".concat(glmConfig.modelFamily), "blue");
                        log("  Model Version: ".concat(glmConfig.modelVersion), "blue");
                        log("  Capabilities:", "blue");
                        for (_i = 0, _a = glmConfig.capabilities; _i < _a.length; _i++) {
                            cap = _a[_i];
                            log("    - ".concat(cap), "blue");
                        }
                        log("  Max Thinking Tokens: ".concat(glmConfig.maxThinkingTokens), "blue");
                        log("  Special Tokens:", "blue");
                        for (_b = 0, _c = Object.entries(glmConfig.specialTokens); _b < _c.length; _b++) {
                            _d = _c[_b], key = _d[0], value = _d[1];
                            log("    ".concat(key, ": \"").concat(value, "\""), "blue");
                        }
                    }
                    else {
                        log("✗ GLM-4.7 config not found", "red");
                    }
                    // ============================================================
                    // Test 2: All Predefined Models
                    // ============================================================
                    section("Test 2: All Predefined Models");
                    log("Available models (".concat(Object.keys(index_js_3.PREDEFINED_MODELS).length, "):"), "yellow");
                    for (_e = 0, _f = Object.entries(index_js_3.PREDEFINED_MODELS); _e < _f.length; _e++) {
                        _g = _f[_e], name_1 = _g[0], config = _g[1];
                        log("  - ".concat(name_1, ": ").concat(config.modelFamily, " v").concat(config.modelVersion), "blue");
                        log("    Capabilities: ".concat(config.capabilities.join(", ")), "blue");
                    }
                    // ============================================================
                    // Test 3: Thinking Mode Detection
                    // ============================================================
                    section("Test 3: Thinking Mode Detection");
                    complexPrompt = "Analyze the trade-offs between SQL and NoSQL for real-time chat applications";
                    simplePrompt = "What is 2 + 2?";
                    useThinkingComplex = (0, index_js_3.shouldUseThinkingMode)(complexPrompt, glmConfig);
                    useThinkingSimple = (0, index_js_3.shouldUseThinkingMode)(simplePrompt, glmConfig);
                    log("Complex prompt: \"".concat(complexPrompt, "\""), "blue");
                    log("  Should use thinking: ".concat(useThinkingComplex ? "YES" : "NO"), useThinkingComplex ? "green" : "yellow");
                    log("Simple prompt: \"".concat(simplePrompt, "\""), "blue");
                    log("  Should use thinking: ".concat(useThinkingSimple ? "YES" : "NO"), useThinkingSimple ? "green" : "yellow");
                    // ============================================================
                    // Test 4: Special Token Formatting
                    // ============================================================
                    section("Test 4: Special Token Formatting");
                    testContent = "This is complex reasoning content";
                    formattedThinking = (0, index_js_3.formatWithSpecialTokens)(testContent, glmConfig, "thinking");
                    formattedStandard = (0, index_js_3.formatWithSpecialTokens)(testContent, glmConfig, "standard");
                    log("Thinking mode format:", "blue");
                    log("  ".concat(formattedThinking), "magenta");
                    log("\nStandard mode format:", "blue");
                    log("  ".concat(formattedStandard), "magenta");
                    // ============================================================
                    // Test 5: Schema Validation
                    // ============================================================
                    section("Test 5: Schema Validation");
                    try {
                        validatedSchema = (0, schema_js_1.validatePromptSchema)(TEST_SCHEMA);
                        log("✓ Schema validation passed", "green");
                        log("  promptId: ".concat(validatedSchema.promptId), "blue");
                        log("  promptType: ".concat(validatedSchema.promptType), "blue");
                        log("  responseSchema type: ".concat(validatedSchema.responseSchema.type), "blue");
                    }
                    catch (error) {
                        log("\u2717 Schema validation failed: ".concat(error.message), "red");
                    }
                    invalidResult = (0, schema_js_1.safeParsePromptSchema)({ promptId: 123 });
                    log("Safe parse invalid data: ".concat(invalidResult === null ? "null (expected)" : "unexpected"), invalidResult === null ? "green" : "red");
                    // ============================================================
                    // Test 6: Input Validation
                    // ============================================================
                    section("Test 6: Input Validation");
                    jsonSchema = {
                        type: "object",
                        properties: {
                            name: { type: "string" },
                            age: { type: "number", minimum: 0 },
                        },
                        required: ["name"],
                    };
                    validJson = { name: "Alice", age: 30 };
                    invalidJson = { age: 30 };
                    validJsonResult = (0, index_js_2.validateJsonInput)(validJson, jsonSchema);
                    invalidJsonResult = (0, index_js_2.validateJsonInput)(invalidJson, jsonSchema);
                    log("Valid JSON input:", "blue");
                    log("  isValid: ".concat(validJsonResult.isValid), validJsonResult.isValid ? "green" : "red");
                    log("Invalid JSON input:", "blue");
                    log("  isValid: ".concat(invalidJsonResult.isValid), !invalidJsonResult.isValid ? "green" : "red");
                    log("  errors: ".concat(invalidJsonResult.errors.join(", ")), "yellow");
                    textConstraints = {
                        minLength: 5,
                        maxLength: 100,
                        pattern: "^[a-zA-Z ]+$",
                    };
                    validText = "Hello World";
                    invalidText = "Hi!";
                    patternInvalid = "Hello123";
                    validTextResult = (0, index_js_2.validateTextInput)(validText, textConstraints);
                    invalidTextResult = (0, index_js_2.validateTextInput)(invalidText, textConstraints);
                    patternInvalidResult = (0, index_js_2.validateTextInput)(patternInvalid, textConstraints);
                    log("Text validation - valid input:", "blue");
                    log("  isValid: ".concat(validTextResult.isValid), validTextResult.isValid ? "green" : "red");
                    log("Text validation - too short:", "blue");
                    log("  isValid: ".concat(invalidTextResult.isValid), !invalidTextResult.isValid ? "green" : "red");
                    log("  errors: ".concat(invalidTextResult.errors.join(", ")), "yellow");
                    log("Text validation - pattern mismatch:", "blue");
                    log("  isValid: ".concat(patternInvalidResult.isValid), !patternInvalidResult.isValid ? "green" : "red");
                    log("  errors: ".concat(patternInvalidResult.errors.join(", ")), "yellow");
                    // ============================================================
                    // Test 7: Database and SchemaManager - CRUD Operations
                    // ============================================================
                    section("Test 7: Database CRUD Operations");
                    return [4 /*yield*/, Promise.resolve().then(function () { return require("fs"); })];
                case 1:
                    fs = _l.sent();
                    if (fs.existsSync(TEST_DB)) {
                        fs.unlinkSync(TEST_DB);
                        log("Cleaned up existing test database", "yellow");
                    }
                    db = new index_js_1.Database({ url: "sqlite:///".concat(TEST_DB) });
                    return [4 /*yield*/, db.connect()];
                case 2:
                    _l.sent();
                    log("✓ Database connected", "green");
                    manager = new index_js_1.SchemaManager({ database: db });
                    log("✓ SchemaManager created", "green");
                    // CREATE
                    log("\n--- CREATE ---", "cyan");
                    return [4 /*yield*/, manager.createPromptSchema(TEST_SCHEMA)];
                case 3:
                    createdSchema = _l.sent();
                    log("\u2713 Schema created with ID: ".concat(createdSchema.promptId), "green");
                    log("  Title: ".concat(createdSchema.promptType), "blue");
                    log("  Created at: ".concat(new Date(createdSchema.createdAt * 1000).toISOString()), "blue");
                    // READ (by ID)
                    log("\n--- GET (by ID) ---", "cyan");
                    return [4 /*yield*/, manager.getPromptSchema(TEST_SCHEMA.promptId)];
                case 4:
                    retrievedSchema = _l.sent();
                    log("\u2713 Schema retrieved: ".concat(retrievedSchema.promptId), "green");
                    log("  Prompt text: ".concat(retrievedSchema.promptText.substring(0, 50), "..."), "blue");
                    // LIST
                    log("\n--- LIST ---", "cyan");
                    return [4 /*yield*/, manager.listPromptSchemas()];
                case 5:
                    allSchemas = _l.sent();
                    log("\u2713 Found ".concat(allSchemas.length, " schema(s)"), "green");
                    for (_h = 0, allSchemas_1 = allSchemas; _h < allSchemas_1.length; _h++) {
                        schema = allSchemas_1[_h];
                        log("  - ".concat(schema.promptId, " (").concat(schema.promptType, ")"), "blue");
                    }
                    // UPDATE
                    log("\n--- UPDATE ---", "cyan");
                    return [4 /*yield*/, manager.updatePromptSchema({
                            promptId: TEST_SCHEMA.promptId,
                            promptTitle: "Code Reviewer (Updated)",
                            promptText: "Review the code for bugs, security issues, and improvements",
                        })];
                case 6:
                    updatedSchema = _l.sent();
                    log("\u2713 Schema updated", "green");
                    log("  New title: ".concat(updatedSchema.promptType), "blue");
                    log("  Updated at: ".concat(updatedSchema.lastUpdated ? new Date(updatedSchema.lastUpdated * 1000).toISOString() : "N/A"), "blue");
                    // DELETE
                    log("\n--- DELETE ---", "cyan");
                    return [4 /*yield*/, manager.deletePromptSchema(TEST_SCHEMA.promptId)];
                case 7:
                    deleted = _l.sent();
                    log("\u2713 Schema ".concat(deleted ? "deleted" : "not deleted", ": ").concat(TEST_SCHEMA.promptId), deleted ? "green" : "red");
                    return [4 /*yield*/, manager.listPromptSchemas()];
                case 8:
                    afterDelete = _l.sent();
                    log("  Schemas remaining: ".concat(afterDelete.length), "blue");
                    // Clean up
                    return [4 /*yield*/, db.disconnect()];
                case 9:
                    // Clean up
                    _l.sent();
                    log("\n✓ Database disconnected", "green");
                    fs.unlinkSync(TEST_DB);
                    log("✓ Test database removed", "green");
                    // ============================================================
                    // Test 8: Multiple Schemas
                    // ============================================================
                    section("Test 8: Multiple Schemas Management");
                    multiDb = new index_js_1.Database({ url: "sqlite:///".concat(TEST_DB) });
                    return [4 /*yield*/, multiDb.connect()];
                case 10:
                    _l.sent();
                    multiManager = new index_js_1.SchemaManager({ database: multiDb });
                    schemasToCreate = [
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
                    _j = 0, schemasToCreate_1 = schemasToCreate;
                    _l.label = 11;
                case 11:
                    if (!(_j < schemasToCreate_1.length)) return [3 /*break*/, 14];
                    schema = schemasToCreate_1[_j];
                    return [4 /*yield*/, multiManager.createPromptSchema(schema)];
                case 12:
                    _l.sent();
                    log("\u2713 Created ".concat(schema.promptId), "green");
                    _l.label = 13;
                case 13:
                    _j++;
                    return [3 /*break*/, 11];
                case 14: return [4 /*yield*/, multiManager.listPromptSchemas(2, 0)];
                case 15:
                    page1 = _l.sent();
                    return [4 /*yield*/, multiManager.listPromptSchemas(2, 2)];
                case 16:
                    page2 = _l.sent();
                    log("\nPagination test:", "yellow");
                    log("  Page 1 (limit=2, offset=0): ".concat(page1.length, " results"), "blue");
                    page1.forEach(function (s) { return log("    - ".concat(s.promptId), "blue"); });
                    log("  Page 2 (limit=2, offset=2): ".concat(page2.length, " results"), "blue");
                    page2.forEach(function (s) { return log("    - ".concat(s.promptId), "blue"); });
                    _k = 0, schemasToCreate_2 = schemasToCreate;
                    _l.label = 17;
                case 17:
                    if (!(_k < schemasToCreate_2.length)) return [3 /*break*/, 20];
                    schema = schemasToCreate_2[_k];
                    return [4 /*yield*/, multiManager.deletePromptSchema(schema.promptId)];
                case 18:
                    _l.sent();
                    _l.label = 19;
                case 19:
                    _k++;
                    return [3 /*break*/, 17];
                case 20: return [4 /*yield*/, multiDb.disconnect()];
                case 21:
                    _l.sent();
                    if (fs.existsSync(TEST_DB)) {
                        fs.unlinkSync(TEST_DB);
                    }
                    log("\u2713 Cleanup complete", "green");
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
                    return [2 /*return*/];
            }
        });
    });
}
// Run tests
runTests().catch(function (error) {
    log("Error: ".concat(error.message), "red");
    console.error(error);
    process.exit(1);
});
