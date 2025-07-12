import * as fs from "fs";
import * as path from "path";
import { writeToFileSafely, validateJson, readJsonFile, FileWriterOptions } from "../utils/fileWriter";

// Mock fs module
jest.mock("fs");

describe("File Writer", () => {
  const mockFs = fs as jest.Mocked<typeof fs>;
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("validateJson", () => {
    it("should validate correct JSON", () => {
      expect(validateJson('{"name": "John"}')).toBe(true);
      expect(validateJson('{"numbers": [1, 2, 3]}')).toBe(true);
    });

    it("should reject invalid JSON", () => {
      expect(validateJson('{"name": "John"')).toBe(false);
      expect(validateJson('invalid json')).toBe(false);
    });
  });

  describe("readJsonFile", () => {
    it("should read and parse valid JSON file", () => {
      const mockContent = '{"name": "John", "age": 30}';
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue(mockContent);

      const result = readJsonFile("test.json");
      
      expect(result).toEqual({ name: "John", age: 30 });
      expect(mockFs.readFileSync).toHaveBeenCalledWith("test.json", "utf-8");
    });

    it("should throw error for non-existent file", () => {
      mockFs.existsSync.mockReturnValue(false);

      expect(() => readJsonFile("nonexistent.json")).toThrow("File not found");
    });

    it("should throw error for invalid JSON content", () => {
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue("invalid json");

      expect(() => readJsonFile("test.json")).toThrow("Invalid JSON content");
    });
  });

  describe("writeToFileSafely", () => {
    it("should write to new file", () => {
      mockFs.existsSync.mockReturnValue(false);
      mockFs.writeFileSync.mockImplementation(() => {});

      writeToFileSafely("test.ts", "export type Test = { name: string; }");

      expect(mockFs.writeFileSync).toHaveBeenCalledWith(
        "test.ts",
        expect.stringContaining("export type Test = { name: string; }"),
        "utf-8"
      );
    });

    it("should append to existing file without delimiter", () => {
      const existingContent = "// Existing content";
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue(existingContent);
      mockFs.writeFileSync.mockImplementation(() => {});

      writeToFileSafely("test.ts", "export type Test = { name: string; }");

      expect(mockFs.writeFileSync).toHaveBeenCalledWith(
        "test.ts",
        expect.stringContaining(existingContent),
        "utf-8"
      );
    });

    it("should replace content after delimiter", () => {
      const existingContent = "// Existing content\n/* ---- Generated Below ---- */\n// Old generated content";
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue(existingContent);
      mockFs.writeFileSync.mockImplementation(() => {});

      writeToFileSafely("test.ts", "export type Test = { name: string; }");

      const writtenContent = mockFs.writeFileSync.mock.calls[0][1] as string;
      expect(writtenContent).toContain("// Existing content");
      expect(writtenContent).toContain("export type Test = { name: string; }");
      expect(writtenContent).not.toContain("// Old generated content");
    });

    it("should create backup when requested", () => {
      const existingContent = "// Existing content";
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue(existingContent);
      mockFs.writeFileSync.mockImplementation(() => {});

      const options: FileWriterOptions = { backup: true };
      writeToFileSafely("test.ts", "export type Test = { name: string; }", options);

      expect(mockFs.writeFileSync).toHaveBeenCalledWith("test.ts.backup", existingContent, "utf-8");
    });

    it("should handle dry run mode", () => {
      const options: FileWriterOptions = { dryRun: true };
      
      // Mock console.log to capture output
      const consoleSpy = jest.spyOn(console, "log").mockImplementation(() => {});

      writeToFileSafely("test.ts", "export type Test = { name: string; }", options);

      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("Dry run"));
      expect(mockFs.writeFileSync).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    it("should handle file read errors gracefully", () => {
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockImplementation(() => {
        throw new Error("Read error");
      });
      mockFs.writeFileSync.mockImplementation(() => {});

      // Should not throw error
      expect(() => {
        writeToFileSafely("test.ts", "export type Test = { name: string; }");
      }).not.toThrow();
    });

    it("should create directory if it doesn't exist", () => {
      mockFs.existsSync.mockReturnValue(false);
      mockFs.writeFileSync.mockImplementation(() => {});

      writeToFileSafely("path/to/test.ts", "export type Test = { name: string; }");

      expect(mockFs.mkdirSync).toHaveBeenCalledWith("path/to", { recursive: true });
    });
  });
}); 