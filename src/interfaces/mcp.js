"use strict";
/**
 * Model Context Protocol (MCP) interface for structured prompts
 * Port of Python interfaces/mcp.py using @modelcontextprotocol/sdk
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
exports.MCPInterface = void 0;
exports.main = main;
var index_js_1 = require("@modelcontextprotocol/sdk/server/index.js");
var stdio_js_1 = require("@modelcontextprotocol/sdk/server/stdio.js");
var types_js_1 = require("@modelcontextprotocol/sdk/types.js");
var schema_manager_js_1 = require("../managers/schema-manager.js");
/**
 * MCP server interface for structured prompts management
 */
var MCPInterface = /** @class */ (function () {
    function MCPInterface(databaseUrl) {
        this.isInitialized = false;
        // Import Database dynamically to avoid top-level await
        var DbClass = require("../database/client.js").Database;
        this.db = new DbClass({ url: databaseUrl });
        this.schemaManager = new schema_manager_js_1.SchemaManager({ database: this.db });
        // Create the server
        this.server = new index_js_1.Server({
            name: "structured-prompts",
            version: "0.1.0",
        }, {
            capabilities: {
                tools: {},
            },
        });
        this.setupHandlers();
    }
    /**
     * Set up MCP tool handlers
     */
    MCPInterface.prototype.setupHandlers = function () {
        var _this = this;
        // List tools handler
        this.server.setRequestHandler(types_js_1.ListToolsRequestSchema, function () { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, {
                        tools: [
                            {
                                name: "create_prompt_schema",
                                description: "Create a new prompt schema",
                                inputSchema: {
                                    type: "object",
                                    properties: {
                                        prompt_id: {
                                            type: "string",
                                            description: "Unique identifier for the prompt",
                                        },
                                        prompt_title: {
                                            type: "string",
                                            description: "Title of the prompt",
                                        },
                                        main_prompt: {
                                            type: "string",
                                            description: "The main prompt text",
                                        },
                                        response_schema: {
                                            type: "object",
                                            description: "JSON schema for response validation",
                                        },
                                        system_instructions: {
                                            type: "string",
                                            description: "System instructions for the LLM",
                                        },
                                        context: {
                                            type: "string",
                                            description: "Additional context for the prompt",
                                        },
                                        model_capabilities: {
                                            type: "object",
                                            description: "Model-specific capabilities",
                                        },
                                        input_schema: {
                                            type: "object",
                                            description: "Schema for validating user inputs",
                                        },
                                        system_prompts: {
                                            type: "array",
                                            description: "Collection of conditional system prompts",
                                        },
                                    },
                                    required: ["prompt_id", "prompt_title", "main_prompt", "response_schema"],
                                },
                            },
                            {
                                name: "get_prompt_schema",
                                description: "Retrieve a prompt schema by ID",
                                inputSchema: {
                                    type: "object",
                                    properties: {
                                        prompt_id: {
                                            type: "string",
                                            description: "ID of the prompt to retrieve",
                                        },
                                    },
                                    required: ["prompt_id"],
                                },
                            },
                            {
                                name: "list_prompt_schemas",
                                description: "List all available prompt schemas",
                                inputSchema: {
                                    type: "object",
                                    properties: {
                                        limit: {
                                            type: "number",
                                            description: "Maximum number of schemas to return",
                                            default: 100,
                                        },
                                        offset: {
                                            type: "number",
                                            description: "Number of schemas to skip",
                                            default: 0,
                                        },
                                    },
                                },
                            },
                            {
                                name: "update_prompt_schema",
                                description: "Update an existing prompt schema",
                                inputSchema: {
                                    type: "object",
                                    properties: {
                                        prompt_id: {
                                            type: "string",
                                            description: "ID of the prompt to update",
                                        },
                                        prompt_title: {
                                            type: "string",
                                            description: "New title",
                                        },
                                        main_prompt: {
                                            type: "string",
                                            description: "New main prompt",
                                        },
                                        response_schema: {
                                            type: "object",
                                            description: "New response schema",
                                        },
                                        system_instructions: {
                                            type: "string",
                                            description: "New system instructions",
                                        },
                                        context: {
                                            type: "string",
                                            description: "New context",
                                        },
                                    },
                                    required: ["prompt_id"],
                                },
                            },
                            {
                                name: "delete_prompt_schema",
                                description: "Delete a prompt schema",
                                inputSchema: {
                                    type: "object",
                                    properties: {
                                        prompt_id: {
                                            type: "string",
                                            description: "ID of the prompt to delete",
                                        },
                                    },
                                    required: ["prompt_id"],
                                },
                            },
                        ],
                    }];
            });
        }); });
        // Call tool handler
        this.server.setRequestHandler(types_js_1.CallToolRequestSchema, function (request) { return __awaiter(_this, void 0, void 0, function () {
            var _a, name, args, _b, schema, schema, limit, offset, schemas, promptId, existing, error_1;
            var _c, _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        _a = request.params, name = _a.name, args = _a.arguments;
                        return [4 /*yield*/, this.db.is_connected()];
                    case 1:
                        if (!!(_e.sent())) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.db.connect()];
                    case 2:
                        _e.sent();
                        _e.label = 3;
                    case 3:
                        _e.trys.push([3, 17, , 18]);
                        _b = name;
                        switch (_b) {
                            case "create_prompt_schema": return [3 /*break*/, 4];
                            case "get_prompt_schema": return [3 /*break*/, 6];
                            case "list_prompt_schemas": return [3 /*break*/, 8];
                            case "update_prompt_schema": return [3 /*break*/, 10];
                            case "delete_prompt_schema": return [3 /*break*/, 13];
                        }
                        return [3 /*break*/, 15];
                    case 4: return [4 /*yield*/, this.schemaManager.createPromptSchema({
                            promptId: args.prompt_id,
                            promptTitle: args.prompt_title,
                            promptText: args.main_prompt,
                            responseSchema: args.response_schema,
                            modelInstruction: args.system_instructions,
                            additionalMessages: args.context,
                            modelCapabilities: args.model_capabilities,
                            inputSchema: args.input_schema,
                            systemPrompts: args.system_prompts,
                        })];
                    case 5:
                        schema = _e.sent();
                        return [2 /*return*/, {
                                content: [
                                    {
                                        type: "text",
                                        text: "Created prompt schema with ID: ".concat(schema.promptId),
                                    },
                                ],
                            }];
                    case 6: return [4 /*yield*/, this.schemaManager.getPromptSchema(args.prompt_id)];
                    case 7:
                        schema = _e.sent();
                        return [2 /*return*/, {
                                content: [
                                    {
                                        type: "text",
                                        text: JSON.stringify(schema, null, 2),
                                    },
                                ],
                            }];
                    case 8:
                        limit = (_c = args.limit) !== null && _c !== void 0 ? _c : 100;
                        offset = (_d = args.offset) !== null && _d !== void 0 ? _d : 0;
                        return [4 /*yield*/, this.schemaManager.listPromptSchemas(limit, offset)];
                    case 9:
                        schemas = _e.sent();
                        return [2 /*return*/, {
                                content: [
                                    {
                                        type: "text",
                                        text: JSON.stringify(schemas, null, 2),
                                    },
                                ],
                            }];
                    case 10:
                        promptId = args.prompt_id;
                        return [4 /*yield*/, this.schemaManager.getPromptSchema(promptId)];
                    case 11:
                        existing = _e.sent();
                        return [4 /*yield*/, this.schemaManager.updatePromptSchema({
                                promptId: promptId,
                                promptTitle: args.prompt_title,
                                promptText: args.main_prompt,
                                responseSchema: args.response_schema,
                                modelInstruction: args.system_instructions,
                            })];
                    case 12:
                        _e.sent();
                        return [2 /*return*/, {
                                content: [
                                    {
                                        type: "text",
                                        text: "Updated prompt schema: ".concat(promptId),
                                    },
                                ],
                            }];
                    case 13: return [4 /*yield*/, this.schemaManager.deletePromptSchema(args.prompt_id)];
                    case 14:
                        _e.sent();
                        return [2 /*return*/, {
                                content: [
                                    {
                                        type: "text",
                                        text: "Deleted prompt schema: ".concat(args.prompt_id),
                                    },
                                ],
                            }];
                    case 15: return [2 /*return*/, {
                            content: [
                                {
                                    type: "text",
                                    text: "Unknown tool: ".concat(name),
                                },
                            ],
                            isError: true,
                        }];
                    case 16: return [3 /*break*/, 18];
                    case 17:
                        error_1 = _e.sent();
                        return [2 /*return*/, {
                                content: [
                                    {
                                        type: "text",
                                        text: "Error: ".concat(error_1.message),
                                    },
                                ],
                                isError: true,
                            }];
                    case 18: return [2 /*return*/];
                }
            });
        }); });
    };
    /**
     * Run the MCP server
     */
    MCPInterface.prototype.run = function () {
        return __awaiter(this, void 0, void 0, function () {
            var transport;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.isInitialized) {
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, this.db.is_connected()];
                    case 1:
                        if (!!(_a.sent())) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.db.connect()];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3:
                        transport = new stdio_js_1.StdioServerTransport();
                        return [4 /*yield*/, this.server.connect(transport)];
                    case 4:
                        _a.sent();
                        this.isInitialized = true;
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Stop the MCP server
     */
    MCPInterface.prototype.stop = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.db.disconnect()];
                    case 1:
                        _a.sent();
                        this.isInitialized = false;
                        return [2 /*return*/];
                }
            });
        });
    };
    return MCPInterface;
}());
exports.MCPInterface = MCPInterface;
/**
 * Main entry point for the MCP server
 */
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var databaseUrl, mcpInterface;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    databaseUrl = process.env.DATABASE_URL;
                    mcpInterface = new MCPInterface(databaseUrl);
                    return [4 /*yield*/, mcpInterface.run()];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
// Run if executed directly
if (import.meta.main) {
    main().catch(function (error) {
        console.error("MCP server error:", error);
        process.exit(1);
    });
}
