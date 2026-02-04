"use strict";
/**
 * Simple test to verify the module works
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
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var db, manager, schema, retrieved, schemas;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log("Structured Prompts TypeScript Test");
                    console.log("=================================\n");
                    // Create database
                    console.log("Creating database connection...");
                    db = new index_ts_1.Database({ url: "sqlite:///./test.db" });
                    return [4 /*yield*/, db.connect()];
                case 1:
                    _a.sent();
                    console.log("✓ Database connected");
                    // Create schema manager
                    console.log("\nCreating schema manager...");
                    manager = new index_ts_1.SchemaManager({ database: db });
                    console.log("✓ Schema manager created");
                    // Create a prompt schema
                    console.log("\nCreating a test prompt schema...");
                    return [4 /*yield*/, manager.createPromptSchema({
                            promptId: "test-prompt-1",
                            promptTitle: "Test Prompt",
                            promptText: "You are a helpful assistant.",
                            responseSchema: {
                                type: "object",
                                properties: {
                                    answer: { type: "string" }
                                }
                            }
                        })];
                case 2:
                    schema = _a.sent();
                    console.log("✓ Created schema:", schema.promptId);
                    // Get the schema
                    console.log("\nRetrieving the schema...");
                    return [4 /*yield*/, manager.getPromptSchema("test-prompt-1")];
                case 3:
                    retrieved = _a.sent();
                    console.log("✓ Retrieved schema:", retrieved.promptId);
                    // List schemas
                    console.log("\nListing all schemas...");
                    return [4 /*yield*/, manager.listPromptSchemas(10, 0)];
                case 4:
                    schemas = _a.sent();
                    console.log("\u2713 Found ".concat(schemas.length, " schema(s)"));
                    // Delete the schema
                    console.log("\nDeleting the schema...");
                    return [4 /*yield*/, manager.deletePromptSchema("test-prompt-1")];
                case 5:
                    _a.sent();
                    console.log("✓ Schema deleted");
                    // Close database
                    console.log("\nClosing database...");
                    return [4 /*yield*/, db.disconnect()];
                case 6:
                    _a.sent();
                    console.log("✓ Database disconnected");
                    console.log("\n✅ All tests passed!");
                    return [2 /*return*/];
            }
        });
    });
}
main().catch(console.error);
