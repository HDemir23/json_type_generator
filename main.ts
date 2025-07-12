#!/usr/bin/env ts-node

import * as fs from "fs";
import * as path from "path";
import {
  extractFields,
  TypeInferenceOptions,
  clearDiscoveredTypes,
} from "./utils/typeInferer";
import {
  writeToFileSafely,
  readJsonFile,
  FileWriterOptions,
} from "./utils/fileWriter";

// Import all generators
import { tsGenerator } from "./generators/tsGenerator";
import { jsGenerator } from "./generators/jsGenerator";
import { goGenerator } from "./generators/goGenerator";
import { rustGenerator } from "./generators/rustGenerator";
import { cGenerator } from "./generators/cGenerator";
import { cppGenerator } from "./generators/cppGenerator";
import { csGenerator } from "./generators/csGenerator";
import { djangoGenerator } from "./generators/djangoGenerator";
import { swiftGenerator } from "./generators/swiftGenerator";
import { objectiveCGenerator } from "./generators/objectiveCGenerator";

// All available generators
const generators = {
  ts: tsGenerator,
  js: jsGenerator,
  go: goGenerator,
  rust: rustGenerator,
  c: cGenerator,
  cpp: cppGenerator,
  cs: csGenerator,
  django: djangoGenerator,
  swift: swiftGenerator,
  objectivec: objectiveCGenerator,
};

interface CliOptions {
  inputFile: string;
  language: string;
  outputFile?: string;
  sampleSize?: number;
  nullable?: boolean;
  strict?: boolean;
  dryRun?: boolean;
  backup?: boolean;
  watch?: boolean;
  help?: boolean;
}

function parseArguments(): CliOptions {
  const args = process.argv.slice(2);
  const options: CliOptions = {
    inputFile: "",
    language: "",
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === "--help" || arg === "-h") {
      options.help = true;
    } else if (arg === "--sample" || arg === "-s") {
      options.sampleSize = parseInt(args[++i]);
    } else if (arg === "--nullable" || arg === "-n") {
      options.nullable = true;
    } else if (arg === "--strict" || arg === "-t") {
      options.strict = true;
    } else if (arg === "--dry-run" || arg === "-d") {
      options.dryRun = true;
    } else if (arg === "--backup" || arg === "-b") {
      options.backup = true;
    } else if (arg === "--watch" || arg === "-w") {
      options.watch = true;
    } else if (arg === "--output" || arg === "-o") {
      options.outputFile = args[++i];
    } else if (arg === "--lang" || arg === "-l") {
      options.language = args[++i];
    } else if (!options.inputFile) {
      options.inputFile = arg;
    } else if (!options.language) {
      options.language = arg;
    } else if (!options.outputFile) {
      options.outputFile = arg;
    }
  }

  return options;
}

function showHelp(): void {
  console.log(`
🎯 JSON Type Generator CLI

Usage: ts-node main.ts <input.json> <language> [outputFile] [options]

Arguments:
  input.json     Path to the JSON file to analyze
  language       Target language (ts, js, go, rust, c, cpp, cs, django, swift, objectivec)
  outputFile     Output file path (optional)

Options:
  --lang, -l <lang>     Specify target language
  --output, -o <file>   Specify output file
  --sample, -s <size>   Sample size for array inference (default: 3)
  --nullable, -n        Enable nullable types
  --strict, -t          Enable strict type checking
  --dry-run, -d         Show output without writing to file
  --backup, -b          Create backup before overwriting
  --watch, -w           Watch for file changes and regenerate
  --help, -h            Show this help message

Examples:
  ts-node main.ts data.json ts
  ts-node main.ts data.json go --sample 5 --strict
  ts-node main.ts data.json rust --output types.rs --backup
  ts-node main.ts data.json swift --dry-run

Supported Languages:
  ts          TypeScript
  js          JavaScript (JSDoc)
  go          Go
  rust        Rust
  c           C
  cpp         C++
  cs          C#
  django      Django/Python
  swift       Swift
  objectivec  Objective-C
`);
}

function validateOptions(options: CliOptions): void {
  if (options.help) {
    showHelp();
    process.exit(0);
  }

  if (!options.inputFile) {
    console.error("❌ Error: Input file is required");
    showHelp();
    process.exit(1);
  }

  if (!options.language) {
    console.error("❌ Error: Language is required");
    showHelp();
    process.exit(1);
  }

  if (!generators[options.language as keyof typeof generators]) {
    console.error(`❌ Error: Unsupported language '${options.language}'`);
    console.error(`Supported languages: ${Object.keys(generators).join(", ")}`);
    process.exit(1);
  }

  if (!fs.existsSync(options.inputFile)) {
    console.error(`❌ Error: Input file '${options.inputFile}' not found`);
    process.exit(1);
  }
}

function generateTypes(options: CliOptions): void {
  try {
    console.log(`📖 Reading JSON file: ${options.inputFile}`);
    const json = readJsonFile(options.inputFile);

    // Clear discovered types cache before processing
    clearDiscoveredTypes();

    const rootObject =
      typeof json === "object" && !Array.isArray(json) ? json : { root: json };

    const typeOptions: TypeInferenceOptions = {
      sampleSize: options.sampleSize,
      nullable: options.nullable,
      strict: options.strict,
    };

    console.log(`🔍 Analyzing JSON structure...`);
    const def = extractFields(rootObject, "Root", typeOptions);

    const generator = generators[options.language as keyof typeof generators];
    console.log(`⚙️  Generating ${options.language.toUpperCase()} types...`);
    const code = generator.generate(def);

    const outputFile =
      options.outputFile || `types.generated.${generator.getFileExtension()}`;

    const fileOptions: FileWriterOptions = {
      dryRun: options.dryRun,
      backup: options.backup,
    };

    writeToFileSafely(outputFile, code, fileOptions);

    if (!options.dryRun) {
      console.log(
        `🎉 Successfully generated types for ${options.language.toUpperCase()}`
      );
    }
  } catch (error) {
    console.error("❌ Error generating types:", error);
    process.exit(1);
  }
}

function watchFile(options: CliOptions): void {
  console.log(`👀 Watching ${options.inputFile} for changes...`);

  let lastModified = fs.statSync(options.inputFile).mtime.getTime();

  const watcher = fs.watch(options.inputFile, (eventType) => {
    if (eventType === "change") {
      const currentModified = fs.statSync(options.inputFile).mtime.getTime();

      // Debounce rapid changes
      if (currentModified > lastModified + 100) {
        lastModified = currentModified;
        console.log(`🔄 File changed, regenerating types...`);
        generateTypes(options);
      }
    }
  });

  // Handle graceful shutdown
  process.on("SIGINT", () => {
    console.log("\n👋 Stopping file watcher...");
    watcher.close();
    process.exit(0);
  });
}

function main(): void {
  try {
    const options = parseArguments();
    validateOptions(options);

    if (options.watch) {
      watchFile(options);
    } else {
      generateTypes(options);
    }
  } catch (error) {
    console.error("❌ Unexpected error:", error);
    process.exit(1);
  }
}

// Run the CLI
if (require.main === module) {
  main();
}
