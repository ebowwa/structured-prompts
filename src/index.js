"use strict";
/**
 * Structured Prompts - A modular package for managing structured prompts
 *
 * This is the main entry point for the library, exporting the core classes and types.
 *
 * @example
 * ```ts
 * import { SchemaManager, PromptSchema, PromptResponse } from "structured-prompts";
 *
 * const manager = new SchemaManager({ database });
 * const schema = await manager.createPromptSchema({ ... });
 * ```
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VERSION = exports.createDatabase = exports.Database = exports.PromptResponseSchema = exports.PromptSchemaSchema = exports.createSchemaManager = exports.SchemaManager = void 0;
// Core exports (matching Python __init__.py)
var schema_manager_js_1 = require("./managers/schema-manager.js");
Object.defineProperty(exports, "SchemaManager", { enumerable: true, get: function () { return schema_manager_js_1.SchemaManager; } });
Object.defineProperty(exports, "createSchemaManager", { enumerable: true, get: function () { return schema_manager_js_1.createSchemaManager; } });
var schema_js_1 = require("./models/schema.js");
Object.defineProperty(exports, "PromptSchemaSchema", { enumerable: true, get: function () { return schema_js_1.PromptSchemaSchema; } });
Object.defineProperty(exports, "PromptResponseSchema", { enumerable: true, get: function () { return schema_js_1.PromptResponseSchema; } });
// Database exports
var client_js_1 = require("./database/client.js");
Object.defineProperty(exports, "Database", { enumerable: true, get: function () { return client_js_1.Database; } });
Object.defineProperty(exports, "createDatabase", { enumerable: true, get: function () { return client_js_1.createDatabase; } });
// Model exports (includes database types)
__exportStar(require("./models/index.js"), exports);
// Manager exports
__exportStar(require("./managers/index.js"), exports);
// Validation exports
__exportStar(require("./validation/index.js"), exports);
// Capabilities exports
__exportStar(require("./capabilities/index.js"), exports);
// Interface exports
__exportStar(require("./interfaces/index.js"), exports);
// Version
exports.VERSION = "0.1.0";
