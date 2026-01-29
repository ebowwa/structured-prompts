/**
 * Input validation schemas and utilities
 * Port of Python input_validation.py using Zod
 */

import { z } from "zod";

// ====================================================================
// Enums
// ====================================================================

/**
 * Types of user inputs
 */
export enum InputType {
  TEXT = "text",
  JSON = "json",
  CODE = "code",
  STRUCTURED = "structured",
  MULTIMODAL = "multimodal",
}

// ====================================================================
// Schemas
// ====================================================================

/**
 * Text constraints schema
 */
export const TextConstraintsSchema = z.object({
  minLength: z.number().optional(),
  maxLength: z.number().optional(),
  pattern: z.string().optional(), // Regex pattern
  allowedFormats: z.array(z.string()).optional().default([]),
  forbiddenPatterns: z.array(z.string()).optional().default([]),
  language: z.string().optional(),
});

export type TextConstraints = z.infer<typeof TextConstraintsSchema>;

/**
 * Input validation configuration schema
 */
export const InputValidationSchema = z.object({
  inputType: z.nativeEnum(InputType).optional().default(InputType.TEXT),
  requiredFields: z.array(z.string()).optional().default([]),
  jsonSchema: z.record(z.any()).optional().describe("JSON Schema for structured validation"),
  textConstraints: z.record(z.any()).optional().default({}).describe("Constraints for text input"),
  examples: z.array(z.record(z.any())).optional().default([]).describe("Example valid inputs"),
  errorMessages: z.record(z.string()).optional().default({}).describe("Custom error messages"),
});

export type InputValidation = z.infer<typeof InputValidationSchema>;

/**
 * Validation result schema
 */
export const ValidationResultSchema = z.object({
  isValid: z.boolean(),
  errors: z.array(z.string()).optional().default([]),
  warnings: z.array(z.string()).optional().default([]),
  transformedInput: z.any().optional(),
  metadata: z.record(z.any()).optional().default({}),
});

export type ValidationResult = z.infer<typeof ValidationResultSchema>;

// ====================================================================
// Validation Functions
// ====================================================================

/**
 * Validate JSON input against a schema
 */
export function validateJsonInput(
  userInput: string | Record<string, unknown>,
  schema: Record<string, unknown>
): ValidationResult {
  const result: ValidationResult = {
    isValid: true,
    errors: [],
    warnings: [],
    transformedInput: null,
    metadata: {},
  };

  try {
    // Parse if string
    let parsed: Record<string, unknown>;
    if (typeof userInput === "string") {
      try {
        parsed = JSON.parse(userInput);
      } catch (e) {
        result.isValid = false;
        result.errors = [`Invalid JSON: ${(e as Error).message}`];
        return result;
      }
    } else {
      parsed = userInput;
    }

    // Validate against schema using Zod dynamic schema
    const zodSchema = jsonSchemaToZod(schema);
    const zodResult = zodSchema.safeParse(parsed);

    if (zodResult.success) {
      result.transformedInput = zodResult.data;
    } else {
      result.isValid = false;
      result.errors = zodResult.error.errors.map((e) => e.message);
    }
  } catch (error) {
    result.isValid = false;
    result.errors = [`Schema validation failed: ${(error as Error).message}`];
  }

  return result;
}

/**
 * Convert JSON Schema to Zod schema (simplified)
 */
function jsonSchemaToZod(jsonSchema: Record<string, unknown>): z.ZodTypeAny {
  const type = jsonSchema.type as string;

  switch (type) {
    case "string":
      let stringSchema = z.string();
      if (jsonSchema.minLength) {
        stringSchema = stringSchema.min((jsonSchema.minLength as number));
      }
      if (jsonSchema.maxLength) {
        stringSchema = stringSchema.max((jsonSchema.maxLength as number));
      }
      if (jsonSchema.pattern) {
        stringSchema = stringSchema.regex(new RegExp(jsonSchema.pattern as string));
      }
      return stringSchema;

    case "number":
    case "integer":
      let numberSchema = z.number();
      if (jsonSchema.minimum !== undefined) {
        numberSchema = numberSchema.min(jsonSchema.minimum as number);
      }
      if (jsonSchema.maximum !== undefined) {
        numberSchema = numberSchema.max(jsonSchema.maximum as number);
      }
      return numberSchema;

    case "boolean":
      return z.boolean();

    case "array":
      const itemSchema = jsonSchema.items
        ? jsonSchemaToZod(jsonSchema.items as Record<string, unknown>)
        : z.any();
      return z.array(itemSchema);

    case "object":
      const properties = jsonSchema.properties as Record<string, Record<string, unknown>> | undefined;
      const required = jsonSchema.required as string[] | undefined;

      if (!properties) {
        return z.record(z.any());
      }

      const shape: Record<string, z.ZodTypeAny> = {};
      for (const [key, value] of Object.entries(properties)) {
        const fieldSchema = jsonSchemaToZod(value);
        // Make optional if not in required
        shape[key] = required?.includes(key) ? fieldSchema : fieldSchema.optional();
      }

      return z.object(shape);

    default:
      return z.any();
  }
}

/**
 * Validate text input against constraints
 */
export function validateTextInput(
  userInput: string,
  constraints: TextConstraints
): ValidationResult {
  const result: ValidationResult = {
    isValid: true,
    errors: [],
    warnings: [],
    transformedInput: userInput,
    metadata: {},
  };

  // Length validation
  if (constraints.minLength !== undefined && userInput.length < constraints.minLength) {
    result.isValid = false;
    result.errors.push(`Input too short (min: ${constraints.minLength})`);
  }

  if (constraints.maxLength !== undefined && userInput.length > constraints.maxLength) {
    result.isValid = false;
    result.errors.push(`Input too long (max: ${constraints.maxLength})`);
  }

  // Pattern validation
  if (constraints.pattern) {
    const regex = new RegExp(constraints.pattern);
    if (!regex.test(userInput)) {
      result.isValid = false;
      result.errors.push("Input doesn't match required pattern");
    }
  }

  // Forbidden patterns
  for (const pattern of constraints.forbiddenPatterns ?? []) {
    if (userInput.includes(pattern)) {
      result.isValid = false;
      result.errors.push(`Input contains forbidden pattern: ${pattern}`);
    }
  }

  return result;
}

/**
 * Validate code input
 */
export function validateCodeInput(
  userInput: string,
  language: string,
  additionalChecks?: Record<string, unknown>
): ValidationResult {
  const result: ValidationResult = {
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
        } catch (e) {
          result.isValid = false;
          result.errors.push(`JavaScript syntax error: ${(e as Error).message}`);
        }
        break;

      case "json":
        JSON.parse(userInput);
        break;

      default:
        // No validation for other languages
        break;
    }
  } catch (e) {
    result.isValid = false;
    result.errors.push(`${language} syntax error: ${(e as Error).message}`);
  }

  return result;
}

/**
 * Main validation function - validates input based on config
 */
export function validateUserInput(
  userInput: unknown,
  validationConfig: InputValidation
): ValidationResult {
  // If input type is JSON with schema
  if (validationConfig.inputType === InputType.JSON && validationConfig.jsonSchema) {
    return validateJsonInput(
      typeof userInput === "string" ? userInput : (userInput as Record<string, unknown>),
      validationConfig.jsonSchema
    );
  }

  // If input type is TEXT
  if (validationConfig.inputType === InputType.TEXT) {
    const constraints = TextConstraintsSchema.parse(validationConfig.textConstraints ?? {});
    return validateTextInput(String(userInput), constraints);
  }

  // If input type is CODE
  if (validationConfig.inputType === InputType.CODE) {
    const language = (validationConfig.textConstraints?.language as string) ?? "python";
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
export const COMMON_INPUT_SCHEMAS = {
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
} as const;
