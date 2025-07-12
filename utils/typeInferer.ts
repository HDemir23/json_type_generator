export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

export type TypeDefinition = {
  name: string;
  fields: Record<string, string>;
};

export interface TypeInferenceOptions {
  sampleSize?: number;
  nullable?: boolean;
  strict?: boolean;
  maxDepth?: number;
}

const defaultOptions: TypeInferenceOptions = {
  sampleSize: 3,
  nullable: false,
  strict: false,
  maxDepth: 10,
};

// Track all discovered types for nested object generation
const discoveredTypes = new Map<string, TypeDefinition>();

export function inferType(
  value: JsonValue,
  options: TypeInferenceOptions = {},
  depth = 0,
  parentKey = ""
): string {
  const opts = { ...defaultOptions, ...options };

  // Prevent deep recursion
  if (depth > opts.maxDepth!) {
    return "any";
  }

  if (value === null) {
    return opts.nullable ? "null" : "any";
  }

  if (Array.isArray(value)) {
    if (value.length === 0) {
      return "any[]";
    }

    // Optimize for large arrays by sampling
    const sampleSize = Math.min(opts.sampleSize!, value.length);
    const sample = value.slice(0, sampleSize);

    // Check if all elements have the same type
    const types = sample.map((item) =>
      inferType(item, opts, depth + 1, parentKey)
    );
    const uniqueTypes = [...new Set(types)];

    if (uniqueTypes.length === 1) {
      const elementType = uniqueTypes[0];
      return elementType + "[]";
    } else {
      // Mixed types - use union or any
      if (opts.strict) {
        return `(${uniqueTypes.join(" | ")})[]`;
      } else {
        return "any[]";
      }
    }
  }

  const type = typeof value;
  switch (type) {
    case "string":
      return "string";
    case "number":
      return "number";
    case "boolean":
      return "boolean";
    case "object": {
      if (value === null) return "null";

      // For objects, generate a type name and store the structure
      if (value && typeof value === "object" && !Array.isArray(value)) {
        const keys = Object.keys(value);
        if (keys.length > 0) {
          // Generate a type name based on parent key or content
          let typeName = parentKey
            ? parentKey.charAt(0).toUpperCase() + parentKey.slice(1)
            : "Object";

          // If this looks like a user object, name it appropriately
          if (
            keys.includes("id") &&
            keys.includes("name") &&
            keys.includes("email")
          ) {
            typeName = "User";
          } else if (keys.includes("id")) {
            typeName = "Entity";
          } else if (parentKey) {
            typeName = parentKey.charAt(0).toUpperCase() + parentKey.slice(1);
          }

          // Store the type definition for later generation
          const typeDef = extractFields(
            value as Record<string, JsonValue>,
            typeName,
            opts
          );
          discoveredTypes.set(typeName, typeDef);

          return typeName;
        }
      }
      return "object";
    }
    default:
      return "any";
  }
}

export function extractFields(
  obj: Record<string, JsonValue>,
  name = "Root",
  options: TypeInferenceOptions = {}
): TypeDefinition {
  const fields: Record<string, string> = {};

  for (const [key, val] of Object.entries(obj)) {
    try {
      fields[key] = inferType(val, options, 0, key);
    } catch (error) {
      console.warn(`Warning: Failed to infer type for field '${key}':`, error);
      fields[key] = "any";
    }
  }

  return { name, fields };
}

// Get all discovered types for nested object generation
export function getDiscoveredTypes(): TypeDefinition[] {
  return Array.from(discoveredTypes.values());
}

// Clear discovered types cache
export function clearDiscoveredTypes(): void {
  discoveredTypes.clear();
}

// Memoization cache for type inference
const typeCache = new Map<string, string>();

export function inferTypeWithCache(
  value: JsonValue,
  options: TypeInferenceOptions = {}
): string {
  const cacheKey = JSON.stringify({ value, options });

  if (typeCache.has(cacheKey)) {
    return typeCache.get(cacheKey)!;
  }

  const result = inferType(value, options);
  typeCache.set(cacheKey, result);

  return result;
}
