"use strict";
/**
 * Database connection and operations wrapper
 * Supports both SQLite (via Bun) and PostgreSQL
 */
var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};
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
exports.Database = void 0;
exports.createDatabase = createDatabase;
var bun_sqlite_1 = require("bun:sqlite");
var postgres_1 = require("postgres");
var fs_1 = require("fs");
var path_1 = require("path");
/**
 * Database class for managing connections and operations
 */
var Database = /** @class */ (function () {
    function Database(config) {
        if (config === void 0) { config = {}; }
        var _a, _b, _c;
        this.db = null;
        this.isConnectedFlag = false;
        this.url = (_b = (_a = config.url) !== null && _a !== void 0 ? _a : process.env.DATABASE_URL) !== null && _b !== void 0 ? _b : "sqlite:///./structured_prompts.db";
        // Detect database type from URL
        if (this.url.startsWith("sqlite")) {
            this.type = "sqlite";
        }
        else if (this.url.startsWith("postgres") || this.url.startsWith("postgresql")) {
            this.type = "postgres";
        }
        else {
            this.type = (_c = config.type) !== null && _c !== void 0 ? _c : "sqlite"; // default
        }
    }
    /**
     * Establish database connection and create tables
     */
    Database.prototype.connect = function () {
        return __awaiter(this, void 0, void 0, function () {
            var error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.isConnectedFlag) {
                            return [2 /*return*/];
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 6, , 7]);
                        if (!(this.type === "sqlite")) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.connectSqlite()];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 5];
                    case 3: return [4 /*yield*/, this.connectPostgres()];
                    case 4:
                        _a.sent();
                        _a.label = 5;
                    case 5:
                        this.isConnectedFlag = true;
                        return [3 /*break*/, 7];
                    case 6:
                        error_1 = _a.sent();
                        throw new Error("Failed to connect to database: ".concat(error_1));
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Connect to SQLite database using Bun's native SQLite
     */
    Database.prototype.connectSqlite = function () {
        return __awaiter(this, void 0, void 0, function () {
            var filePath, dir, db;
            return __generator(this, function (_a) {
                filePath = this.url.replace(/^sqlite:\/\/\//, "");
                dir = (0, path_1.dirname)(filePath);
                if (!(0, fs_1.existsSync)(dir)) {
                    (0, fs_1.mkdirSync)(dir, { recursive: true });
                }
                this.db = new bun_sqlite_1.Database(filePath, { create: true });
                db = this.db;
                db.exec("\n      CREATE TABLE IF NOT EXISTS prompt_schemas (\n        prompt_id TEXT PRIMARY KEY,\n        prompt_title TEXT NOT NULL,\n        prompt_description TEXT,\n        prompt_categories TEXT,\n        main_prompt TEXT NOT NULL,\n        model_instruction TEXT,\n        additional_messages TEXT,\n        response_schema TEXT NOT NULL,\n        is_public INTEGER DEFAULT 0,\n        ranking INTEGER DEFAULT 0,\n        last_used INTEGER,\n        usage_count INTEGER DEFAULT 0,\n        created_at INTEGER NOT NULL,\n        created_by TEXT,\n        last_updated INTEGER,\n        last_updated_by TEXT,\n        provider_configs TEXT,\n        model_capabilities TEXT,\n        input_schema TEXT,\n        system_prompts TEXT\n      );\n\n      CREATE TABLE IF NOT EXISTS prompt_responses (\n        response_id TEXT PRIMARY KEY,\n        prompt_id TEXT NOT NULL,\n        raw_response TEXT NOT NULL,\n        created_at INTEGER NOT NULL,\n        FOREIGN KEY (prompt_id) REFERENCES prompt_schemas(prompt_id)\n      );\n    ");
                return [2 /*return*/];
            });
        });
    };
    /**
     * Connect to PostgreSQL database
     */
    Database.prototype.connectPostgres = function () {
        return __awaiter(this, void 0, void 0, function () {
            var connectionString, client;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        connectionString = this.url.replace(/^postgresql?:\/\//, "postgres://");
                        this.db = (0, postgres_1.default)(connectionString);
                        client = this.db;
                        // Create tables if not exists
                        return [4 /*yield*/, client(templateObject_1 || (templateObject_1 = __makeTemplateObject(["\n      CREATE TABLE IF NOT EXISTS prompt_schemas (\n        prompt_id TEXT PRIMARY KEY,\n        prompt_title TEXT NOT NULL,\n        prompt_description TEXT,\n        prompt_categories JSONB,\n        main_prompt TEXT NOT NULL,\n        model_instruction TEXT,\n        additional_messages JSONB,\n        response_schema JSONB NOT NULL,\n        is_public INTEGER DEFAULT 0 NOT NULL,\n        ranking INTEGER DEFAULT 0,\n        last_used INTEGER,\n        usage_count INTEGER DEFAULT 0,\n        created_at INTEGER NOT NULL,\n        created_by TEXT,\n        last_updated INTEGER,\n        last_updated_by TEXT,\n        provider_configs JSONB,\n        model_capabilities JSONB,\n        input_schema JSONB,\n        system_prompts JSONB\n      );\n    "], ["\n      CREATE TABLE IF NOT EXISTS prompt_schemas (\n        prompt_id TEXT PRIMARY KEY,\n        prompt_title TEXT NOT NULL,\n        prompt_description TEXT,\n        prompt_categories JSONB,\n        main_prompt TEXT NOT NULL,\n        model_instruction TEXT,\n        additional_messages JSONB,\n        response_schema JSONB NOT NULL,\n        is_public INTEGER DEFAULT 0 NOT NULL,\n        ranking INTEGER DEFAULT 0,\n        last_used INTEGER,\n        usage_count INTEGER DEFAULT 0,\n        created_at INTEGER NOT NULL,\n        created_by TEXT,\n        last_updated INTEGER,\n        last_updated_by TEXT,\n        provider_configs JSONB,\n        model_capabilities JSONB,\n        input_schema JSONB,\n        system_prompts JSONB\n      );\n    "])))];
                    case 1:
                        // Create tables if not exists
                        _a.sent();
                        return [4 /*yield*/, client(templateObject_2 || (templateObject_2 = __makeTemplateObject(["\n      CREATE TABLE IF NOT EXISTS prompt_responses (\n        response_id TEXT PRIMARY KEY,\n        prompt_id TEXT NOT NULL REFERENCES prompt_schemas(prompt_id),\n        raw_response JSONB NOT NULL,\n        created_at INTEGER NOT NULL\n      );\n    "], ["\n      CREATE TABLE IF NOT EXISTS prompt_responses (\n        response_id TEXT PRIMARY KEY,\n        prompt_id TEXT NOT NULL REFERENCES prompt_schemas(prompt_id),\n        raw_response JSONB NOT NULL,\n        created_at INTEGER NOT NULL\n      );\n    "])))];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Check if database is connected
     */
    Database.prototype.is_connected = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.isConnectedFlag];
            });
        });
    };
    /**
     * Close database connection
     */
    Database.prototype.disconnect = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (this.db) {
                    if (this.type === "sqlite") {
                        this.db.close();
                    }
                    else {
                        this.db.end();
                    }
                }
                this.isConnectedFlag = false;
                this.db = null;
                return [2 /*return*/];
            });
        });
    };
    /**
     * Get a prompt schema by ID
     */
    Database.prototype.get_schema = function (promptId) {
        return __awaiter(this, void 0, void 0, function () {
            var db, stmt, result, parsed, client, rows;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.ensureConnected();
                        if (!(this.type === "sqlite")) return [3 /*break*/, 1];
                        db = this.db;
                        stmt = db.prepare("SELECT * FROM prompt_schemas WHERE prompt_id = ?");
                        result = stmt.get(promptId);
                        if (!result)
                            return [2 /*return*/, null];
                        parsed = this.parseJsonFields(result, [
                            "prompt_categories",
                            "additional_messages",
                            "response_schema",
                            "provider_configs",
                            "model_capabilities",
                            "input_schema",
                            "system_prompts",
                        ]);
                        // Convert snake_case to camelCase
                        return [2 /*return*/, this.snakeToCamel(parsed)];
                    case 1:
                        client = this.db;
                        return [4 /*yield*/, client(templateObject_3 || (templateObject_3 = __makeTemplateObject(["\n        SELECT * FROM prompt_schemas WHERE prompt_id = ", "\n      "], ["\n        SELECT * FROM prompt_schemas WHERE prompt_id = ", "\n      "])), promptId)];
                    case 2:
                        rows = _a.sent();
                        if (rows.length === 0)
                            return [2 /*return*/, null];
                        return [2 /*return*/, rows[0]];
                }
            });
        });
    };
    /**
     * Create a new prompt schema
     */
    Database.prototype.create_schema = function (schema) {
        return __awaiter(this, void 0, void 0, function () {
            var data, db, stmt, client, result;
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1, _2, _3, _4;
            return __generator(this, function (_5) {
                switch (_5.label) {
                    case 0:
                        this.ensureConnected();
                        data = __assign(__assign({}, schema), { createdAt: (_a = schema.createdAt) !== null && _a !== void 0 ? _a : Math.floor(Date.now() / 1000) });
                        if (!(this.type === "sqlite")) return [3 /*break*/, 1];
                        db = this.db;
                        stmt = db.prepare("\n        INSERT INTO prompt_schemas (\n          prompt_id, prompt_title, prompt_description, prompt_categories,\n          main_prompt, model_instruction, additional_messages, response_schema,\n          is_public, ranking, last_used, usage_count, created_at, created_by,\n          last_updated, last_updated_by, provider_configs, model_capabilities,\n          input_schema, system_prompts\n        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)\n      ");
                        stmt.run(data.promptId, data.promptTitle, (_b = data.promptDescription) !== null && _b !== void 0 ? _b : null, JSON.stringify((_c = data.promptCategories) !== null && _c !== void 0 ? _c : []), data.mainPrompt, (_d = data.modelInstruction) !== null && _d !== void 0 ? _d : null, JSON.stringify((_e = data.additionalMessages) !== null && _e !== void 0 ? _e : []), JSON.stringify(data.responseSchema), data.isPublic ? 1 : 0, (_f = data.ranking) !== null && _f !== void 0 ? _f : 0, (_g = data.lastUsed) !== null && _g !== void 0 ? _g : null, (_h = data.usageCount) !== null && _h !== void 0 ? _h : 0, data.createdAt, (_j = data.createdBy) !== null && _j !== void 0 ? _j : null, (_k = data.lastUpdated) !== null && _k !== void 0 ? _k : null, (_l = data.lastUpdatedBy) !== null && _l !== void 0 ? _l : null, JSON.stringify((_m = data.providerConfigs) !== null && _m !== void 0 ? _m : {}), JSON.stringify((_o = data.modelCapabilities) !== null && _o !== void 0 ? _o : {}), JSON.stringify((_p = data.inputSchema) !== null && _p !== void 0 ? _p : {}), JSON.stringify((_q = data.systemPrompts) !== null && _q !== void 0 ? _q : []));
                        return [3 /*break*/, 3];
                    case 1:
                        client = this.db;
                        return [4 /*yield*/, client(templateObject_4 || (templateObject_4 = __makeTemplateObject(["\n        INSERT INTO prompt_schemas (\n          prompt_id, prompt_title, prompt_description, prompt_categories,\n          main_prompt, model_instruction, additional_messages, response_schema,\n          is_public, ranking, last_used, usage_count, created_at, created_by,\n          last_updated, last_updated_by, provider_configs, model_capabilities,\n          input_schema, system_prompts\n        ) VALUES (\n          ", ", ", ", ", ",\n          ", ", ", ",\n          ", ", ", ",\n          ", ", ", ",\n          ", ", ", ", ", ",\n          ", ", ", ", ", ",\n          ", ", ", ",\n          ", ", ", ",\n          ", "\n        )\n      "], ["\n        INSERT INTO prompt_schemas (\n          prompt_id, prompt_title, prompt_description, prompt_categories,\n          main_prompt, model_instruction, additional_messages, response_schema,\n          is_public, ranking, last_used, usage_count, created_at, created_by,\n          last_updated, last_updated_by, provider_configs, model_capabilities,\n          input_schema, system_prompts\n        ) VALUES (\n          ", ", ", ", ", ",\n          ", ", ", ",\n          ", ", ", ",\n          ", ", ", ",\n          ", ", ", ", ", ",\n          ", ", ", ", ", ",\n          ", ", ", ",\n          ", ", ", ",\n          ", "\n        )\n      "])), data.promptId, data.promptTitle, (_r = data.promptDescription) !== null && _r !== void 0 ? _r : null, JSON.stringify((_s = data.promptCategories) !== null && _s !== void 0 ? _s : []), data.mainPrompt, (_t = data.modelInstruction) !== null && _t !== void 0 ? _t : null, JSON.stringify((_u = data.additionalMessages) !== null && _u !== void 0 ? _u : []), JSON.stringify(data.responseSchema), data.isPublic ? 1 : 0, (_v = data.ranking) !== null && _v !== void 0 ? _v : 0, (_w = data.lastUsed) !== null && _w !== void 0 ? _w : null, (_x = data.usageCount) !== null && _x !== void 0 ? _x : 0, data.createdAt, (_y = data.createdBy) !== null && _y !== void 0 ? _y : null, (_z = data.lastUpdated) !== null && _z !== void 0 ? _z : null, (_0 = data.lastUpdatedBy) !== null && _0 !== void 0 ? _0 : null, JSON.stringify((_1 = data.providerConfigs) !== null && _1 !== void 0 ? _1 : {}), JSON.stringify((_2 = data.modelCapabilities) !== null && _2 !== void 0 ? _2 : {}), JSON.stringify((_3 = data.inputSchema) !== null && _3 !== void 0 ? _3 : {}), JSON.stringify((_4 = data.systemPrompts) !== null && _4 !== void 0 ? _4 : []))];
                    case 2:
                        _5.sent();
                        _5.label = 3;
                    case 3: return [4 /*yield*/, this.get_schema(data.promptId)];
                    case 4:
                        result = _5.sent();
                        if (!result) {
                            throw new Error("Failed to create schema");
                        }
                        return [2 /*return*/, result];
                }
            });
        });
    };
    /**
     * Update an existing prompt schema
     */
    Database.prototype.update_schema = function (schema) {
        return __awaiter(this, void 0, void 0, function () {
            var data, db, stmt, params, client, createdAt, result;
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1, _2, _3;
            return __generator(this, function (_4) {
                switch (_4.label) {
                    case 0:
                        this.ensureConnected();
                        data = __assign(__assign({}, schema), { lastUpdated: Math.floor(Date.now() / 1000) });
                        if (!(this.type === "sqlite")) return [3 /*break*/, 1];
                        db = this.db;
                        stmt = db.prepare("\n        UPDATE prompt_schemas SET\n          prompt_title = ?, prompt_description = ?, prompt_categories = ?,\n          main_prompt = ?, model_instruction = ?, additional_messages = ?,\n          response_schema = ?, is_public = ?, ranking = ?, last_used = ?,\n          usage_count = ?, created_at = ?, created_by = ?, last_updated = ?,\n          last_updated_by = ?, provider_configs = ?, model_capabilities = ?,\n          input_schema = ?, system_prompts = ?\n        WHERE prompt_id = ?\n      ");
                        params = [
                            data.promptTitle,
                            (_a = data.promptDescription) !== null && _a !== void 0 ? _a : null,
                            JSON.stringify((_b = data.promptCategories) !== null && _b !== void 0 ? _b : []),
                            data.mainPrompt,
                            (_c = data.modelInstruction) !== null && _c !== void 0 ? _c : null,
                            JSON.stringify((_d = data.additionalMessages) !== null && _d !== void 0 ? _d : []),
                            JSON.stringify(data.responseSchema),
                            data.isPublic ? 1 : 0,
                            (_e = data.ranking) !== null && _e !== void 0 ? _e : 0,
                            (_f = data.lastUsed) !== null && _f !== void 0 ? _f : null,
                            (_g = data.usageCount) !== null && _g !== void 0 ? _g : 0,
                            (_h = data.createdAt) !== null && _h !== void 0 ? _h : Math.floor(Date.now() / 1000),
                            (_j = data.createdBy) !== null && _j !== void 0 ? _j : null,
                            data.lastUpdated,
                            (_k = data.lastUpdatedBy) !== null && _k !== void 0 ? _k : null,
                            JSON.stringify((_l = data.providerConfigs) !== null && _l !== void 0 ? _l : {}),
                            JSON.stringify((_m = data.modelCapabilities) !== null && _m !== void 0 ? _m : {}),
                            JSON.stringify((_o = data.inputSchema) !== null && _o !== void 0 ? _o : {}),
                            JSON.stringify((_p = data.systemPrompts) !== null && _p !== void 0 ? _p : []),
                            data.promptId
                        ];
                        stmt.run.apply(stmt, params);
                        return [3 /*break*/, 3];
                    case 1:
                        client = this.db;
                        createdAt = (_q = data.createdAt) !== null && _q !== void 0 ? _q : Math.floor(Date.now() / 1000);
                        return [4 /*yield*/, client(templateObject_5 || (templateObject_5 = __makeTemplateObject(["\n        UPDATE prompt_schemas SET\n          prompt_title = ", ",\n          prompt_description = ", ",\n          prompt_categories = ", ",\n          main_prompt = ", ",\n          model_instruction = ", ",\n          additional_messages = ", ",\n          response_schema = ", ",\n          is_public = ", ",\n          ranking = ", ",\n          last_used = ", ",\n          usage_count = ", ",\n          created_at = ", ",\n          created_by = ", ",\n          last_updated = ", ",\n          last_updated_by = ", ",\n          provider_configs = ", ",\n          model_capabilities = ", ",\n          input_schema = ", ",\n          system_prompts = ", "\n        WHERE prompt_id = ", "\n      "], ["\n        UPDATE prompt_schemas SET\n          prompt_title = ", ",\n          prompt_description = ", ",\n          prompt_categories = ", ",\n          main_prompt = ", ",\n          model_instruction = ", ",\n          additional_messages = ", ",\n          response_schema = ", ",\n          is_public = ", ",\n          ranking = ", ",\n          last_used = ", ",\n          usage_count = ", ",\n          created_at = ", ",\n          created_by = ", ",\n          last_updated = ", ",\n          last_updated_by = ", ",\n          provider_configs = ", ",\n          model_capabilities = ", ",\n          input_schema = ", ",\n          system_prompts = ", "\n        WHERE prompt_id = ", "\n      "])), data.promptTitle, (_r = data.promptDescription) !== null && _r !== void 0 ? _r : null, JSON.stringify((_s = data.promptCategories) !== null && _s !== void 0 ? _s : []), data.mainPrompt, (_t = data.modelInstruction) !== null && _t !== void 0 ? _t : null, JSON.stringify((_u = data.additionalMessages) !== null && _u !== void 0 ? _u : []), JSON.stringify(data.responseSchema), data.isPublic ? 1 : 0, (_v = data.ranking) !== null && _v !== void 0 ? _v : 0, (_w = data.lastUsed) !== null && _w !== void 0 ? _w : null, (_x = data.usageCount) !== null && _x !== void 0 ? _x : 0, createdAt, (_y = data.createdBy) !== null && _y !== void 0 ? _y : null, data.lastUpdated, (_z = data.lastUpdatedBy) !== null && _z !== void 0 ? _z : null, JSON.stringify((_0 = data.providerConfigs) !== null && _0 !== void 0 ? _0 : {}), JSON.stringify((_1 = data.modelCapabilities) !== null && _1 !== void 0 ? _1 : {}), JSON.stringify((_2 = data.inputSchema) !== null && _2 !== void 0 ? _2 : {}), JSON.stringify((_3 = data.systemPrompts) !== null && _3 !== void 0 ? _3 : []), data.promptId)];
                    case 2:
                        _4.sent();
                        _4.label = 3;
                    case 3: return [4 /*yield*/, this.get_schema(data.promptId)];
                    case 4:
                        result = _4.sent();
                        if (!result) {
                            throw new Error("Failed to update schema");
                        }
                        return [2 /*return*/, result];
                }
            });
        });
    };
    /**
     * Delete a prompt schema
     */
    Database.prototype.delete_schema = function (promptId) {
        return __awaiter(this, void 0, void 0, function () {
            var db, stmt, result, client, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.ensureConnected();
                        if (!(this.type === "sqlite")) return [3 /*break*/, 1];
                        db = this.db;
                        stmt = db.prepare("DELETE FROM prompt_schemas WHERE prompt_id = ?");
                        result = stmt.run(promptId);
                        return [2 /*return*/, result.changes > 0];
                    case 1:
                        client = this.db;
                        return [4 /*yield*/, client(templateObject_6 || (templateObject_6 = __makeTemplateObject(["\n        DELETE FROM prompt_schemas WHERE prompt_id = ", "\n      "], ["\n        DELETE FROM prompt_schemas WHERE prompt_id = ", "\n      "])), promptId)];
                    case 2:
                        result = _a.sent();
                        return [2 /*return*/, result.length > 0];
                }
            });
        });
    };
    /**
     * Get prompt response by ID
     */
    Database.prototype.get_response = function (responseId) {
        return __awaiter(this, void 0, void 0, function () {
            var db, stmt, result, client, rows;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.ensureConnected();
                        if (!(this.type === "sqlite")) return [3 /*break*/, 1];
                        db = this.db;
                        stmt = db.prepare("SELECT * FROM prompt_responses WHERE response_id = ?");
                        result = stmt.get(responseId);
                        if (!result)
                            return [2 /*return*/, null];
                        return [2 /*return*/, this.parseJsonFields(result, ["raw_response"])];
                    case 1:
                        client = this.db;
                        return [4 /*yield*/, client(templateObject_7 || (templateObject_7 = __makeTemplateObject(["\n        SELECT * FROM prompt_responses WHERE response_id = ", "\n      "], ["\n        SELECT * FROM prompt_responses WHERE response_id = ", "\n      "])), responseId)];
                    case 2:
                        rows = _a.sent();
                        if (rows.length === 0)
                            return [2 /*return*/, null];
                        return [2 /*return*/, rows[0]];
                }
            });
        });
    };
    /**
     * Create a new prompt response
     */
    Database.prototype.create_response = function (response) {
        return __awaiter(this, void 0, void 0, function () {
            var data, db, stmt, client, result;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        this.ensureConnected();
                        data = __assign(__assign({}, response), { createdAt: (_a = response.createdAt) !== null && _a !== void 0 ? _a : Math.floor(Date.now() / 1000) });
                        if (!(this.type === "sqlite")) return [3 /*break*/, 1];
                        db = this.db;
                        stmt = db.prepare("\n        INSERT INTO prompt_responses (response_id, prompt_id, raw_response, created_at)\n        VALUES (?, ?, ?, ?)\n      ");
                        stmt.run(data.responseId, data.promptId, JSON.stringify(data.rawResponse), data.createdAt);
                        return [3 /*break*/, 3];
                    case 1:
                        client = this.db;
                        return [4 /*yield*/, client(templateObject_8 || (templateObject_8 = __makeTemplateObject(["\n        INSERT INTO prompt_responses (response_id, prompt_id, raw_response, created_at)\n        VALUES (", ", ", ", ", ", ", ")\n      "], ["\n        INSERT INTO prompt_responses (response_id, prompt_id, raw_response, created_at)\n        VALUES (", ", ", ", ", ", ", ")\n      "])), data.responseId, data.promptId, JSON.stringify(data.rawResponse), data.createdAt)];
                    case 2:
                        _b.sent();
                        _b.label = 3;
                    case 3: return [4 /*yield*/, this.get_response(data.responseId)];
                    case 4:
                        result = _b.sent();
                        if (!result) {
                            throw new Error("Failed to create response");
                        }
                        return [2 /*return*/, result];
                }
            });
        });
    };
    /**
     * List prompt schemas with pagination
     */
    Database.prototype.list_schemas = function () {
        return __awaiter(this, arguments, void 0, function (limit, offset) {
            var db, stmt, results, client, rows;
            var _this = this;
            if (limit === void 0) { limit = 100; }
            if (offset === void 0) { offset = 0; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.ensureConnected();
                        if (!(this.type === "sqlite")) return [3 /*break*/, 1];
                        db = this.db;
                        stmt = db.prepare("\n        SELECT * FROM prompt_schemas\n        LIMIT ? OFFSET ?\n      ");
                        results = stmt.all(limit, offset);
                        return [2 /*return*/, results.map(function (r) {
                                var parsed = _this.parseJsonFields(r, [
                                    "prompt_categories",
                                    "additional_messages",
                                    "response_schema",
                                    "provider_configs",
                                    "model_capabilities",
                                    "input_schema",
                                    "system_prompts",
                                ]);
                                return _this.snakeToCamel(parsed);
                            })];
                    case 1:
                        client = this.db;
                        return [4 /*yield*/, client(templateObject_9 || (templateObject_9 = __makeTemplateObject(["\n        SELECT * FROM prompt_schemas\n        LIMIT ", "\n        OFFSET ", "\n      "], ["\n        SELECT * FROM prompt_schemas\n        LIMIT ", "\n        OFFSET ", "\n      "])), limit, offset)];
                    case 2:
                        rows = _a.sent();
                        return [2 /*return*/, rows];
                }
            });
        });
    };
    /**
     * Ensure database is connected
     */
    Database.prototype.ensureConnected = function () {
        if (!this.isConnectedFlag || !this.db) {
            throw new Error("Database not connected. Call connect() first.");
        }
    };
    /**
     * Parse JSON fields from database records
     */
    Database.prototype.parseJsonFields = function (record, jsonFields) {
        var parsed = __assign({}, record);
        for (var _i = 0, jsonFields_1 = jsonFields; _i < jsonFields_1.length; _i++) {
            var field = jsonFields_1[_i];
            var value = parsed[field];
            if (typeof value === "string") {
                try {
                    parsed[field] = JSON.parse(value);
                }
                catch (_a) {
                    // Keep original value if parsing fails
                }
            }
        }
        return parsed;
    };
    /**
     * Convert snake_case database columns to camelCase
     * Also handles SQLite integer booleans
     */
    Database.prototype.snakeToCamel = function (record) {
        var converted = {};
        for (var _i = 0, _a = Object.entries(record); _i < _a.length; _i++) {
            var _b = _a[_i], key = _b[0], value = _b[1];
            // Convert snake_case to camelCase
            var camelKey = key.replace(/_([a-z])/g, function (_, letter) { return letter.toUpperCase(); });
            // Handle SQLite integer booleans
            if (camelKey === "isPublic" && typeof value === "number") {
                converted[camelKey] = value === 1;
            }
            else {
                converted[camelKey] = value;
            }
        }
        return converted;
    };
    return Database;
}());
exports.Database = Database;
/**
 * Create a database connection with the given configuration
 */
function createDatabase() {
    return __awaiter(this, arguments, void 0, function (config) {
        var db;
        if (config === void 0) { config = {}; }
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    db = new Database(config);
                    return [4 /*yield*/, db.connect()];
                case 1:
                    _a.sent();
                    return [2 /*return*/, db];
            }
        });
    });
}
var templateObject_1, templateObject_2, templateObject_3, templateObject_4, templateObject_5, templateObject_6, templateObject_7, templateObject_8, templateObject_9;
