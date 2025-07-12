import * as fs from "fs";
import * as path from "path";

export interface FileWriterOptions {
  delimiter?: string;
  commentStyle?: string;
  backup?: boolean;
  dryRun?: boolean;
}

const defaultOptions: FileWriterOptions = {
  delimiter: "/* ---- Generated Below ---- */",
  commentStyle: "//",
  backup: false,
  dryRun: false,
};

export function writeToFileSafely(
  filePath: string,
  content: string,
  options: FileWriterOptions = {}
): void {
  const opts = { ...defaultOptions, ...options };

  try {
    // Validate file path
    if (!filePath || typeof filePath !== "string") {
      throw new Error("Invalid file path provided");
    }

    // Ensure directory exists
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    let existing = "";
    if (fs.existsSync(filePath)) {
      try {
        existing = fs.readFileSync(filePath, "utf-8");
      } catch (error) {
        console.warn(
          `Warning: Could not read existing file ${filePath}:`,
          error
        );
        existing = "";
      }
    }

    // Create backup if requested
    if (opts.backup && existing) {
      const backupPath = `${filePath}.backup`;
      try {
        fs.writeFileSync(backupPath, existing, "utf-8");
        console.log(`📦 Backup created: ${backupPath}`);
      } catch (error) {
        console.warn(`Warning: Could not create backup:`, error);
      }
    }

    let result: string;
    if (existing.includes(opts.delimiter!)) {
      // Replace content after delimiter
      const parts = existing.split(opts.delimiter!);
      result = parts[0] + opts.delimiter! + "\n\n" + content;
    } else {
      // Append to existing content
      result = existing + "\n\n" + opts.delimiter! + "\n\n" + content;
    }

    if (opts.dryRun) {
      console.log(`🔍 Dry run - would write to ${filePath}:`);
      console.log(result);
      return;
    }

    // Write file with error handling
    fs.writeFileSync(filePath, result, "utf-8");
    console.log(`✅ Written to ${filePath}`);
  } catch (error) {
    console.error(`❌ Failed to write to ${filePath}:`, error);
    throw error;
  }
}

export function validateJson(jsonString: string): boolean {
  try {
    JSON.parse(jsonString);
    return true;
  } catch (error) {
    console.error("❌ Invalid JSON:", error);
    return false;
  }
}

export function readJsonFile(filePath: string): any {
  try {
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }

    const content = fs.readFileSync(filePath, "utf-8");

    if (!validateJson(content)) {
      throw new Error("Invalid JSON content");
    }

    return JSON.parse(content);
  } catch (error) {
    console.error(`❌ Failed to read JSON file ${filePath}:`, error);
    throw error;
  }
}
