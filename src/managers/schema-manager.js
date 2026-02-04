"use strict";
/**
 * Core schema management functionality for structured prompts
 */
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
exports.SchemaManager = exports.SchemaManagerError = exports.ValidationError = exports.SchemaNotFoundError = void 0;
exports.createSchemaManager = createSchemaManager;
var zod_1 = require("zod");
var schema_js_1 = require("../models/schema.js");
// Error classes for better error handling
var SchemaNotFoundError = /** @class */ (function (_super) {
    __extends(SchemaNotFoundError, _super);
    function SchemaNotFoundError(promptId) {
        var _this = _super.call(this, "Schema not found for id: ".concat(promptId)) || this;
        _this.name = "SchemaNotFoundError";
        return _this;
    }
    return SchemaNotFoundError;
}(Error));
exports.SchemaNotFoundError = SchemaNotFoundError;
var ValidationError = /** @class */ (function (_super) {
    __extends(ValidationError, _super);
    function ValidationError(message) {
        var _this = _super.call(this, message) || this;
        _this.name = "ValidationError";
        return _this;
    }
    return ValidationError;
}(Error));
exports.ValidationError = ValidationError;
var SchemaManagerError = /** @class */ (function (_super) {
    __extends(SchemaManagerError, _super);
    function SchemaManagerError(message) {
        var _this = _super.call(this, message) || this;
        _this.name = "SchemaManagerError";
        return _this;
    }
    return SchemaManagerError;
}(Error));
exports.SchemaManagerError = SchemaManagerError;
/**
 * Default values for SchemaManager
 */
var DEFAULTS = {
    promptType: "example_prompt",
    promptText: "This is an example prompt. The response schema should be defined " +
        "based on your specific use case and the expected structure of the response.",
    responseSchema: {
        type: "object",
        description: "Dynamic response schema - define based on your needs",
        additionalProperties: true,
    },
};
/**
 * SchemaManager - Manages prompt schemas and their configurations
 */
var SchemaManager = /** @class */ (function () {
    function SchemaManager(config) {
        if (config === void 0) { config = {}; }
        var _a, _b, _c, _d;
        this.database = (_a = config.database) !== null && _a !== void 0 ? _a : null;
        this.defaultPromptType = (_b = config.defaultPromptType) !== null && _b !== void 0 ? _b : DEFAULTS.promptType;
        this.defaultPromptText = (_c = config.defaultPromptText) !== null && _c !== void 0 ? _c : DEFAULTS.promptText;
        this.defaultResponseSchema = (_d = config.defaultResponseSchema) !== null && _d !== void 0 ? _d : DEFAULTS.responseSchema;
    }
    /**
     * Convert database record to PromptSchema
     */
    SchemaManager.prototype.dbToPromptSchema = function (record) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x;
        // Map database field names (camelCase) to schema field names
        return (0, schema_js_1.validatePromptSchema)({
            promptId: record.promptId,
            promptType: (_b = (_a = record.promptType) !== null && _a !== void 0 ? _a : record.promptTitle) !== null && _b !== void 0 ? _b : this.defaultPromptType,
            promptDescription: (_c = record.promptDescription) !== null && _c !== void 0 ? _c : "",
            promptCategories: (_d = record.promptCategories) !== null && _d !== void 0 ? _d : [],
            promptText: (_f = (_e = record.promptText) !== null && _e !== void 0 ? _e : record.mainPrompt) !== null && _f !== void 0 ? _f : this.defaultPromptText,
            modelInstruction: (_h = (_g = record.modelInstruction) !== null && _g !== void 0 ? _g : record.modelInstruction) !== null && _h !== void 0 ? _h : null,
            additionalMessages: (_j = record.additionalMessages) !== null && _j !== void 0 ? _j : null,
            responseSchema: (_k = record.responseSchema) !== null && _k !== void 0 ? _k : this.defaultResponseSchema,
            isPublic: (_l = record.isPublic) !== null && _l !== void 0 ? _l : false,
            ranking: (_m = record.ranking) !== null && _m !== void 0 ? _m : 0,
            lastUsed: (_o = record.lastUsed) !== null && _o !== void 0 ? _o : null,
            usageCount: (_p = record.usageCount) !== null && _p !== void 0 ? _p : 0,
            createdAt: (_q = record.createdAt) !== null && _q !== void 0 ? _q : Math.floor(Date.now() / 1000),
            createdBy: (_r = record.createdBy) !== null && _r !== void 0 ? _r : null,
            lastUpdated: (_s = record.lastUpdated) !== null && _s !== void 0 ? _s : null,
            lastUpdatedBy: (_t = record.lastUpdatedBy) !== null && _t !== void 0 ? _t : null,
            providerConfigs: (_u = record.providerConfigs) !== null && _u !== void 0 ? _u : {},
            modelCapabilities: (_v = record.modelCapabilities) !== null && _v !== void 0 ? _v : {},
            inputSchema: (_w = record.inputSchema) !== null && _w !== void 0 ? _w : null,
            systemPrompts: (_x = record.systemPrompts) !== null && _x !== void 0 ? _x : [],
        });
    };
    /**
     * Convert PromptSchema to database insert format
     */
    SchemaManager.prototype.promptSchemaToDb = function (schema) {
        return {
            promptId: schema.promptId,
            promptTitle: schema.promptType,
            promptDescription: schema.promptDescription,
            promptCategories: schema.promptCategories,
            mainPrompt: schema.promptText,
            modelInstruction: schema.modelInstruction,
            additionalMessages: schema.additionalMessages,
            responseSchema: schema.responseSchema,
            isPublic: schema.isPublic ? 1 : 0,
            ranking: schema.ranking,
            lastUsed: schema.lastUsed,
            usageCount: schema.usageCount,
            createdAt: schema.createdAt,
            createdBy: schema.createdBy,
            lastUpdated: schema.lastUpdated,
            lastUpdatedBy: schema.lastUpdatedBy,
            providerConfigs: schema.providerConfigs,
            modelCapabilities: schema.modelCapabilities,
            inputSchema: schema.inputSchema,
            systemPrompts: schema.systemPrompts,
        };
    };
    /**
     * Get a prompt schema by ID
     */
    SchemaManager.prototype.getPromptSchema = function (promptId) {
        return __awaiter(this, void 0, void 0, function () {
            var result, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.database) {
                            throw new SchemaManagerError("Database not configured");
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.database.get_schema(promptId)];
                    case 2:
                        result = _a.sent();
                        if (!result) {
                            throw new SchemaNotFoundError(promptId);
                        }
                        return [2 /*return*/, this.dbToPromptSchema(result)];
                    case 3:
                        error_1 = _a.sent();
                        if (error_1 instanceof SchemaNotFoundError) {
                            throw error_1;
                        }
                        throw new SchemaManagerError("Failed to get schema: ".concat(error_1));
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Create a new prompt schema
     */
    SchemaManager.prototype.createPromptSchema = function (config) {
        return __awaiter(this, void 0, void 0, function () {
            var schema, dbRecord, result, error_2;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!this.database) {
                            throw new SchemaManagerError("Database not configured");
                        }
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 3, , 4]);
                        schema = (0, schema_js_1.validatePromptSchema)(__assign({ promptId: config.promptId, promptType: config.promptTitle, promptDescription: (_a = config.promptDescription) !== null && _a !== void 0 ? _a : "", promptText: config.promptText, responseSchema: config.responseSchema, modelInstruction: config.modelInstruction, additionalMessages: config.additionalMessages, createdAt: Math.floor(Date.now() / 1000) }, config));
                        dbRecord = this.promptSchemaToDb(schema);
                        return [4 /*yield*/, this.database.create_schema(dbRecord)];
                    case 2:
                        result = _b.sent();
                        return [2 /*return*/, this.dbToPromptSchema(result)];
                    case 3:
                        error_2 = _b.sent();
                        if (error_2 instanceof zod_1.z.ZodError) {
                            throw new ValidationError(error_2.message);
                        }
                        throw new SchemaManagerError("Failed to create schema: ".concat(error_2));
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Update an existing prompt schema
     */
    SchemaManager.prototype.updatePromptSchema = function (config) {
        return __awaiter(this, void 0, void 0, function () {
            var existing, existingSchema, updatedSchema, dbRecord, result, error_3;
            var _a, _b, _c, _d, _e, _f, _g;
            return __generator(this, function (_h) {
                switch (_h.label) {
                    case 0:
                        if (!this.database) {
                            throw new SchemaManagerError("Database not configured");
                        }
                        _h.label = 1;
                    case 1:
                        _h.trys.push([1, 4, , 5]);
                        return [4 /*yield*/, this.database.get_schema(config.promptId)];
                    case 2:
                        existing = _h.sent();
                        if (!existing) {
                            throw new SchemaNotFoundError(config.promptId);
                        }
                        existingSchema = this.dbToPromptSchema(existing);
                        updatedSchema = (0, schema_js_1.validatePromptSchema)({
                            promptId: config.promptId,
                            promptType: (_a = config.promptTitle) !== null && _a !== void 0 ? _a : existingSchema.promptType,
                            promptDescription: (_b = config.promptDescription) !== null && _b !== void 0 ? _b : existingSchema.promptDescription,
                            promptText: (_c = config.promptText) !== null && _c !== void 0 ? _c : existingSchema.promptText,
                            responseSchema: (_d = config.responseSchema) !== null && _d !== void 0 ? _d : existingSchema.responseSchema,
                            modelInstruction: (_e = config.modelInstruction) !== null && _e !== void 0 ? _e : existingSchema.modelInstruction,
                            additionalMessages: (_f = config.additionalMessages) !== null && _f !== void 0 ? _f : existingSchema.additionalMessages,
                            isPublic: existingSchema.isPublic,
                            ranking: existingSchema.ranking,
                            lastUsed: existingSchema.lastUsed,
                            usageCount: existingSchema.usageCount,
                            createdAt: existingSchema.createdAt,
                            createdBy: existingSchema.createdBy,
                            lastUpdated: Math.floor(Date.now() / 1000),
                            lastUpdatedBy: config.lastUpdatedBy,
                            providerConfigs: existingSchema.providerConfigs,
                            modelCapabilities: existingSchema.modelCapabilities,
                            inputSchema: (_g = config.inputSchema) !== null && _g !== void 0 ? _g : existingSchema.inputSchema,
                            systemPrompts: existingSchema.systemPrompts,
                        });
                        dbRecord = this.promptSchemaToDb(updatedSchema);
                        return [4 /*yield*/, this.database.update_schema(dbRecord)];
                    case 3:
                        result = _h.sent();
                        return [2 /*return*/, this.dbToPromptSchema(result)];
                    case 4:
                        error_3 = _h.sent();
                        if (error_3 instanceof SchemaNotFoundError || error_3 instanceof zod_1.z.ZodError) {
                            throw error_3;
                        }
                        throw new SchemaManagerError("Failed to update schema: ".concat(error_3));
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Delete a prompt schema
     */
    SchemaManager.prototype.deletePromptSchema = function (promptId) {
        return __awaiter(this, void 0, void 0, function () {
            var error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.database) {
                            throw new SchemaManagerError("Database not configured");
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.database.delete_schema(promptId)];
                    case 2: return [2 /*return*/, _a.sent()];
                    case 3:
                        error_4 = _a.sent();
                        throw new SchemaManagerError("Failed to delete schema: ".concat(error_4));
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * List prompt schemas with pagination
     */
    SchemaManager.prototype.listPromptSchemas = function () {
        return __awaiter(this, arguments, void 0, function (limit, offset) {
            var records, error_5;
            var _this = this;
            if (limit === void 0) { limit = 100; }
            if (offset === void 0) { offset = 0; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.database) {
                            throw new SchemaManagerError("Database not configured");
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.database.list_schemas(limit, offset)];
                    case 2:
                        records = _a.sent();
                        return [2 /*return*/, records.map(function (r) { return _this.dbToPromptSchema(r); })];
                    case 3:
                        error_5 = _a.sent();
                        throw new SchemaManagerError("Failed to list schemas: ".concat(error_5));
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Set the database connection
     */
    SchemaManager.prototype.setDatabase = function (database) {
        this.database = database;
    };
    /**
     * Get the current database connection
     */
    SchemaManager.prototype.getDatabase = function () {
        return this.database;
    };
    return SchemaManager;
}());
exports.SchemaManager = SchemaManager;
/**
 * Create a SchemaManager with a database connection
 */
function createSchemaManager(database, config) {
    return __awaiter(this, void 0, void 0, function () {
        var manager;
        return __generator(this, function (_a) {
            manager = new SchemaManager(__assign({ database: database }, config));
            return [2 /*return*/, manager];
        });
    });
}
