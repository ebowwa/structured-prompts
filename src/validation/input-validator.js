"use strict";
/**
 * Input validation schemas and utilities
 * Port of Python input_validation.py using Zod
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.COMMON_INPUT_SCHEMAS = exports.ValidationResultSchema = exports.InputValidationSchema = exports.TextConstraintsSchema = exports.InputType = void 0;
exports.validateJsonInput = validateJsonInput;
exports.validateTextInput = validateTextInput;
exports.validateCodeInput = validateCodeInput;
exports.validateUserInput = validateUserInput;
var zod_1 = require("zod");
// ====================================================================
// Enums
// ====================================================================
/**
 * Types of user inputs
 */
var InputType;
(function (InputType) {
    InputType["TEXT"] = "text";
    InputType["JSON"] = "json";
    InputType["CODE"] = "code";
    InputType["STRUCTURED"] = "structured";
    InputType["MULTIMODAL"] = "multimodal";
})(InputType || (exports.InputType = InputType = {}));
// ====================================================================
// Schemas
// ====================================================================
/**
 * Text constraints schema
 */
exports.TextConstraintsSchema = zod_1.z.object({
    minLength: zod_1.z.number().optional(),
    maxLength: zod_1.z.number().optional(),
    pattern: zod_1.z.string().optional(), // Regex pattern
    allowedFormats: zod_1.z.array(zod_1.z.string()).optional().default([]),
    forbiddenPatterns: zod_1.z.array(zod_1.z.string()).optional().default([]),
    language: zod_1.z.string().optional(),
});
/**
 * Input validation configuration schema
 */
exports.InputValidationSchema = zod_1.z.object({
    inputType: zod_1.z.nativeEnum(InputType).optional().default(InputType.TEXT),
    requiredFields: zod_1.z.array(zod_1.z.string()).optional().default([]),
    jsonSchema: zod_1.z.record(zod_1.z.any()).optional().describe("JSON Schema for structured validation"),
    textConstraints: zod_1.z.record(zod_1.z.any()).optional().default({}).describe("Constraints for text input"),
    examples: zod_1.z.array(zod_1.z.record(zod_1.z.any())).optional().default([]).describe("Example valid inputs"),
    errorMessages: zod_1.z.record(zod_1.z.string()).optional().default({}).describe("Custom error messages"),
});
/**
 * Validation result schema
 */
exports.ValidationResultSchema = zod_1.z.object({
    isValid: zod_1.z.boolean(),
    errors: zod_1.z.array(zod_1.z.string()).optional().default([]),
    warnings: zod_1.z.array(zod_1.z.string()).optional().default([]),
    transformedInput: zod_1.z.any().optional(),
    metadata: zod_1.z.record(zod_1.z.any()).optional().default({}),
});
// ====================================================================
// Validation Functions
// ====================================================================
/**
 * Validate JSON input against a schema
 */
function validateJsonInput(userInput, schema) {
    var result = {
        isValid: true,
        errors: [],
        warnings: [],
        transformedInput: null,
        metadata: {},
    };
    try {
        // Parse if string
        var parsed = void 0;
        if (typeof userInput === "string") {
            try {
                parsed = JSON.parse(userInput);
            }
            catch (e) {
                result.isValid = false;
                result.errors = ["Invalid JSON: ".concat(e.message)];
                return result;
            }
        }
        else {
            parsed = userInput;
        }
        // Validate against schema using Zod dynamic schema
        var zodSchema = jsonSchemaToZod(schema);
        var zodResult = zodSchema.safeParse(parsed);
        if (zodResult.success) {
            result.transformedInput = zodResult.data;
        }
        else {
            result.isValid = false;
            result.errors = zodResult.error.errors.map(function (e) { return e.message; });
        }
    }
    catch (error) {
        result.isValid = false;
        result.errors = ["Schema validation failed: ".concat(error.message)];
    }
    return result;
}
/**
 * Convert JSON Schema to Zod schema (simplified)
 */
function jsonSchemaToZod(jsonSchema) {
    var type = jsonSchema.type;
    switch (type) {
        case "string":
            var stringSchema = zod_1.z.string();
            if (jsonSchema.minLength) {
                stringSchema = stringSchema.min(jsonSchema.minLength);
            }
            if (jsonSchema.maxLength) {
                stringSchema = stringSchema.max(jsonSchema.maxLength);
            }
            if (jsonSchema.pattern) {
                stringSchema = stringSchema.regex(new RegExp(jsonSchema.pattern));
            }
            return stringSchema;
        case "number":
        case "integer":
            var numberSchema = zod_1.z.number();
            if (jsonSchema.minimum !== undefined) {
                numberSchema = numberSchema.min(jsonSchema.minimum);
            }
            if (jsonSchema.maximum !== undefined) {
                numberSchema = numberSchema.max(jsonSchema.maximum);
            }
            return numberSchema;
        case "boolean":
            return zod_1.z.boolean();
        case "array":
            var itemSchema = jsonSchema.items
                ? jsonSchemaToZod(jsonSchema.items)
                : zod_1.z.any();
            return zod_1.z.array(itemSchema);
        case "object":
            var properties = jsonSchema.properties;
            var required = jsonSchema.required;
            if (!properties) {
                return zod_1.z.record(zod_1.z.any());
            }
            var shape = {};
            for (var _i = 0, _a = Object.entries(properties); _i < _a.length; _i++) {
                var _b = _a[_i], key = _b[0], value = _b[1];
                var fieldSchema = jsonSchemaToZod(value);
                // Make optional if not in required
                shape[key] = (required === null || required === void 0 ? void 0 : required.includes(key)) ? fieldSchema : fieldSchema.optional();
            }
            return zod_1.z.object(shape);
        default:
            return zod_1.z.any();
    }
}
/**
 * Validate text input against constraints
 */
function validateTextInput(userInput, constraints) {
    var _a;
    var result = {
        isValid: true,
        errors: [],
        warnings: [],
        transformedInput: userInput,
        metadata: {},
    };
    // Length validation
    if (constraints.minLength !== undefined && userInput.length < constraints.minLength) {
        result.isValid = false;
        result.errors.push("Input too short (min: ".concat(constraints.minLength, ")"));
    }
    if (constraints.maxLength !== undefined && userInput.length > constraints.maxLength) {
        result.isValid = false;
        result.errors.push("Input too long (max: ".concat(constraints.maxLength, ")"));
    }
    // Pattern validation
    if (constraints.pattern) {
        var regex = new RegExp(constraints.pattern);
        if (!regex.test(userInput)) {
            result.isValid = false;
            result.errors.push("Input doesn't match required pattern");
        }
    }
    // Forbidden patterns
    for (var _i = 0, _b = (_a = constraints.forbiddenPatterns) !== null && _a !== void 0 ? _a : []; _i < _b.length; _i++) {
        var pattern = _b[_i];
        if (userInput.includes(pattern)) {
            result.isValid = false;
            result.errors.push("Input contains forbidden pattern: ".concat(pattern));
        }
    }
    return result;
}
/**
 * Validate code input
 */
function validateCodeInput(userInput, language, additionalChecks) {
    var result = {
        isValid: true,
        errors: [],
        warnings: [],
        transformedInput: userInput,
        metadata: {},
    };
    // Basic syntax validation based on language
    try {
        switch (language) {
            case "python":
                // Use Bun's built-in Python syntax check (not available, skip)
                // In practice, you'd use a separate service or library
                break;
            case "javascript":
            case "js":
            case "typescript":
            case "ts":
                // Use Bun's built-in JS/TS validation
                try {
                    // eslint-disable-next-line no-new
                    new Function(userInput);
                }
                catch (e) {
                    result.isValid = false;
                    result.errors.push("JavaScript syntax error: ".concat(e.message));
                }
                break;
            case "json":
                JSON.parse(userInput);
                break;
            default:
                // No validation for other languages
                break;
        }
    }
    catch (e) {
        result.isValid = false;
        result.errors.push("".concat(language, " syntax error: ").concat(e.message));
    }
    return result;
}
/**
 * Main validation function - validates input based on config
 */
function validateUserInput(userInput, validationConfig) {
    var _a, _b, _c;
    // If input type is JSON with schema
    if (validationConfig.inputType === InputType.JSON && validationConfig.jsonSchema) {
        return validateJsonInput(typeof userInput === "string" ? userInput : userInput, validationConfig.jsonSchema);
    }
    // If input type is TEXT
    if (validationConfig.inputType === InputType.TEXT) {
        var constraints = exports.TextConstraintsSchema.parse((_a = validationConfig.textConstraints) !== null && _a !== void 0 ? _a : {});
        return validateTextInput(String(userInput), constraints);
    }
    // If input type is CODE
    if (validationConfig.inputType === InputType.CODE) {
        var language = (_c = (_b = validationConfig.textConstraints) === null || _b === void 0 ? void 0 : _b.language) !== null && _c !== void 0 ? _c : "python";
        return validateCodeInput(String(userInput), language, validationConfig.textConstraints);
    }
    // Default: accept any input
    return {
        isValid: true,
        errors: [],
        warnings: [],
        transformedInput: userInput,
        metadata: {},
    };
}
// ====================================================================
// Common Input Schemas
// ====================================================================
/**
 * Example schemas for common use cases
 */
exports.COMMON_INPUT_SCHEMAS = {
    keyValuePairs: {
        type: "object",
        additionalProperties: { type: "string" },
    },
    arrayOfStrings: {
        type: "array",
        items: { type: "string" },
    },
    structuredQuery: {
        type: "object",
        properties: {
            query: { type: "string" },
            filters: { type: "object" },
            limit: { type: "integer", minimum: 1, maximum: 100 },
        },
        required: ["query"],
    },
    codeSnippet: {
        type: "object",
        properties: {
            language: { type: "string", enum: ["python", "javascript", "java", "go"] },
            code: { type: "string" },
        },
        required: ["language", "code"],
    },
};
