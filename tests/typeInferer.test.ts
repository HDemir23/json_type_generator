import { inferType, extractFields, TypeInferenceOptions } from "../utils/typeInferer";

describe("Type Inferer", () => {
  describe("inferType", () => {
    it("should infer primitive types correctly", () => {
      expect(inferType("hello")).toBe("string");
      expect(inferType(42)).toBe("number");
      expect(inferType(true)).toBe("boolean");
      expect(inferType(null)).toBe("any");
    });

    it("should handle arrays", () => {
      expect(inferType([1, 2, 3])).toBe("number[]");
      expect(inferType(["a", "b", "c"])).toBe("string[]");
      expect(inferType([])).toBe("any[]");
    });

    it("should handle mixed arrays with strict mode", () => {
      const options: TypeInferenceOptions = { strict: true };
      expect(inferType([1, "hello", true], options)).toBe("(number | string | boolean)[]");
    });

    it("should handle mixed arrays without strict mode", () => {
      const options: TypeInferenceOptions = { strict: false };
      expect(inferType([1, "hello", true], options)).toBe("any[]");
    });

    it("should respect sample size for large arrays", () => {
      const largeArray = Array.from({ length: 100 }, (_, i) => i);
      const options: TypeInferenceOptions = { sampleSize: 5 };
      expect(inferType(largeArray, options)).toBe("number[]");
    });

    it("should handle nullable types", () => {
      const options: TypeInferenceOptions = { nullable: true };
      expect(inferType(null, options)).toBe("null");
    });

    it("should prevent deep recursion", () => {
      const deepObject = { a: { b: { c: { d: { e: 1 } } } } };
      const options: TypeInferenceOptions = { maxDepth: 2 };
      expect(inferType(deepObject, options)).toBe("any");
    });
  });

  describe("extractFields", () => {
    it("should extract fields from simple object", () => {
      const obj = {
        name: "John",
        age: 30,
        active: true
      };
      
      const result = extractFields(obj, "User");
      
      expect(result.name).toBe("User");
      expect(result.fields.name).toBe("string");
      expect(result.fields.age).toBe("number");
      expect(result.fields.active).toBe("boolean");
    });

    it("should handle nested objects", () => {
      const obj = {
        user: {
          name: "John",
          profile: {
            avatar: "url"
          }
        }
      };
      
      const result = extractFields(obj, "Root");
      
      expect(result.fields.user).toBe("object");
    });

    it("should handle arrays in objects", () => {
      const obj = {
        tags: ["tag1", "tag2"],
        scores: [1, 2, 3]
      };
      
      const result = extractFields(obj, "Data");
      
      expect(result.fields.tags).toBe("string[]");
      expect(result.fields.scores).toBe("number[]");
    });

    it("should handle error gracefully", () => {
      const obj = {
        valid: "string",
        invalid: undefined as any
      };
      
      const result = extractFields(obj, "Test");
      
      expect(result.fields.valid).toBe("string");
      expect(result.fields.invalid).toBe("any");
    });
  });
}); 