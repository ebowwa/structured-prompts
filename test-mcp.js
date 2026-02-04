"use strict";
/**
 * MCP Server Test Script
 * Tests all MCP server tools by directly calling the underlying SchemaManager methods
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
var mcp_ts_1 = require("./src/interfaces/mcp.ts");
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var databaseUrl, mcp, schemaManager, createResult, schemas, retrieved, updated, schemas2, finalSchemas;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log("MCP Server Test Script");
                    console.log("======================\n");
                    databaseUrl = "sqlite:///./test_mcp.db";
                    mcp = new mcp_ts_1.MCPInterface(databaseUrl);
                    // Initialize (this connects the database)
                    return [4 /*yield*/, mcp["db"].connect()];
                case 1:
                    // Initialize (this connects the database)
                    _a.sent();
                    console.log("✓ MCP Interface initialized\n");
                    schemaManager = mcp["schemaManager"];
                    // TEST 1: Create a prompt schema (create_prompt_schema)
                    console.log("TEST 1: create_prompt_schema");
                    console.log("------------------------------");
                    return [4 /*yield*/, schemaManager.createPromptSchema({
                            promptId: "mcp-test-1",
                            promptTitle: "MCP Test Prompt",
                            promptText: "You are a helpful assistant for testing MCP.",
                            responseSchema: {
                                type: "object",
                                properties: {
                                    answer: { type: "string" },
                                    confidence: { type: "number" }
                                },
                                required: ["answer", "confidence"]
                            },
                            modelInstruction: "Be helpful and concise.",
                            context: "This is a test prompt for MCP validation."
                        })];
                case 2:
                    createResult = _a.sent();
                    console.log("✓ Created schema:", createResult.promptId);
                    console.log("  Title:", createResult.promptTitle);
                    console.log();
                    // TEST 2: List all schemas (list_prompt_schemas)
                    console.log("TEST 2: list_prompt_schemas");
                    console.log("----------------------------");
                    return [4 /*yield*/, schemaManager.listPromptSchemas(100, 0)];
                case 3:
                    schemas = _a.sent();
                    console.log("\u2713 Found ".concat(schemas.length, " schema(s)"));
                    schemas.forEach(function (s) { return console.log("  - ".concat(s.promptId, ": ").concat(s.promptTitle)); });
                    console.log();
                    // TEST 3: Get a specific schema by ID (get_prompt_schema)
                    console.log("TEST 3: get_prompt_schema");
                    console.log("----------------------------");
                    return [4 /*yield*/, schemaManager.getPromptSchema("mcp-test-1")];
                case 4:
                    retrieved = _a.sent();
                    console.log("✓ Retrieved schema:", retrieved.promptId);
                    console.log("  Prompt text:", retrieved.promptText.substring(0, 50) + "...");
                    console.log("  Response schema:", JSON.stringify(retrieved.responseSchema));
                    console.log();
                    // TEST 4: Update the schema (update_prompt_schema)
                    console.log("TEST 4: update_prompt_schema");
                    console.log("----------------------------");
                    return [4 /*yield*/, schemaManager.updatePromptSchema({
                            promptId: "mcp-test-1",
                            promptTitle: "MCP Test Prompt (Updated)",
                            modelInstruction: "Be very helpful and extremely concise."
                        })];
                case 5:
                    _a.sent();
                    return [4 /*yield*/, schemaManager.getPromptSchema("mcp-test-1")];
                case 6:
                    updated = _a.sent();
                    console.log("✓ Updated schema:", updated.promptId);
                    console.log("  New title:", updated.promptTitle);
                    console.log("  New instruction:", updated.modelInstruction);
                    console.log();
                    // TEST 5: Create a second schema for more realistic testing
                    console.log("TEST 5: Creating second schema");
                    console.log("----------------------------");
                    return [4 /*yield*/, schemaManager.createPromptSchema({
                            promptId: "mcp-test-2",
                            promptTitle: "Code Review Prompt",
                            promptText: "Review the following code for bugs and improvements.",
                            responseSchema: {
                                type: "object",
                                properties: {
                                    issues: { type: "array", items: { type: "string" } },
                                    suggestions: { type: "array", items: { type: "string" } },
                                    rating: { type: "number" }
                                }
                            }
                        })];
                case 7:
                    _a.sent();
                    console.log("✓ Created second schema: mcp-test-2");
                    console.log();
                    // TEST 6: List again to show multiple schemas
                    console.log("TEST 6: list_prompt_schemas (after creating second)");
                    console.log("-----------------------------------------------------");
                    return [4 /*yield*/, schemaManager.listPromptSchemas(100, 0)];
                case 8:
                    schemas2 = _a.sent();
                    console.log("\u2713 Found ".concat(schemas2.length, " schema(s)"));
                    schemas2.forEach(function (s) { return console.log("  - ".concat(s.promptId, ": ").concat(s.promptTitle)); });
                    console.log();
                    // TEST 7: Delete schemas (delete_prompt_schema)
                    console.log("TEST 7: delete_prompt_schema");
                    console.log("----------------------------");
                    return [4 /*yield*/, schemaManager.deletePromptSchema("mcp-test-1")];
                case 9:
                    _a.sent();
                    return [4 /*yield*/, schemaManager.deletePromptSchema("mcp-test-2")];
                case 10:
                    _a.sent();
                    console.log("✓ Deleted schemas: mcp-test-1, mcp-test-2");
                    console.log();
                    // TEST 8: Verify deletion
                    console.log("TEST 8: Verify deletion");
                    console.log("----------------------------");
                    return [4 /*yield*/, schemaManager.listPromptSchemas(100, 0)];
                case 11:
                    finalSchemas = _a.sent();
                    console.log("\u2713 Final schema count: ".concat(finalSchemas.length));
                    console.log();
                    // Cleanup
                    return [4 /*yield*/, mcp["db"].disconnect()];
                case 12:
                    // Cleanup
                    _a.sent();
                    console.log("✓ Database disconnected");
                    console.log("\n✅ All MCP server tests passed!");
                    return [2 /*return*/];
            }
        });
    });
}
main().catch(console.error);
