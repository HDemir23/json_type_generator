# JSON Type Generator CLI

A powerful CLI tool that generates type definitions from JSON files for multiple programming languages. Built with TypeScript and optimized for large files with intelligent sampling and caching.

## 🎯 Features

- **Multi-language Support**: Generate types for 10+ programming languages
- **Optimized Performance**: Smart sampling for large arrays, memoization, and lazy evaluation
- **Safe File Operations**: Backup creation, dry-run mode, and graceful error handling
- **Watch Mode**: Automatically regenerate types when JSON files change
- **Flexible Configuration**: Customizable sampling, nullable types, and strict mode
- **IDE Integration**: Ready for VS Code extensions and Cursor plugins

## 🚀 Supported Languages

| Language      | Extension | Example Output                                                                  |
| ------------- | --------- | ------------------------------------------------------------------------------- |
| TypeScript    | `.ts`     | `export type Root = { name: string; age: number; }`                             |
| JavaScript    | `.js`     | `/** @typedef {Object} Root @property {string} name */`                         |
| Go            | `.go`     | `type Root struct { Name string \`json:"name"\` }`                              |
| Rust          | `.rs`     | `#[derive(Debug, Serialize, Deserialize)] pub struct Root { pub name: String }` |
| C             | `.h`      | `typedef struct { char* name; } Root;`                                          |
| C++           | `.hpp`    | `class Root { public: std::string name; };`                                     |
| C#            | `.cs`     | `public class Root { [JsonProperty("name")] public string Name { get; set; } }` |
| Django/Python | `.py`     | `class Root(models.Model): name = models.CharField(max_length=255)`             |
| Swift         | `.swift`  | `struct Root: Codable { let name: String }`                                     |
| Objective-C   | `.h`      | `@interface Root : NSObject @property (nonatomic, strong) NSString* name; @end` |

## 📦 Installation

```bash
# Clone the repository
git clone <repository-url>
cd json-type-gen

# Install dependencies
npm install

# Make executable
chmod +x main.ts
```

## 🎮 Usage

### Basic Usage

```bash
# Generate TypeScript types
ts-node main.ts data.json ts

# Generate Go types with strict mode
ts-node main.ts data.json go --strict

# Generate Rust types with custom output
ts-node main.ts data.json rust --output types.rs
```

### Advanced Options

```bash
# Sample only first 5 elements in arrays
ts-node main.ts data.json ts --sample 5

# Enable nullable types
ts-node main.ts data.json ts --nullable

# Strict type checking for mixed arrays
ts-node main.ts data.json ts --strict

# Dry run (show output without writing)
ts-node main.ts data.json ts --dry-run

# Create backup before overwriting
ts-node main.ts data.json ts --backup

# Watch for file changes
ts-node main.ts data.json ts --watch
```

### CLI Options

| Option            | Short | Description                                  |
| ----------------- | ----- | -------------------------------------------- |
| `--lang <lang>`   | `-l`  | Specify target language                      |
| `--output <file>` | `-o`  | Specify output file                          |
| `--sample <size>` | `-s`  | Sample size for array inference (default: 3) |
| `--nullable`      | `-n`  | Enable nullable types                        |
| `--strict`        | `-t`  | Enable strict type checking                  |
| `--dry-run`       | `-d`  | Show output without writing to file          |
| `--backup`        | `-b`  | Create backup before overwriting             |
| `--watch`         | `-w`  | Watch for file changes and regenerate        |
| `--help`          | `-h`  | Show help message                            |

## 🔧 Configuration

### Type Inference Options

The tool supports various options for type inference:

- **Sample Size**: Control how many elements to sample from large arrays
- **Nullable Types**: Enable explicit null handling
- **Strict Mode**: Generate union types for mixed arrays
- **Max Depth**: Prevent deep recursion in nested objects

### File Writing Options

- **Safe Overwriting**: Only replaces content after the delimiter
- **Backup Creation**: Automatic backup before overwriting
- **Directory Creation**: Creates output directories if they don't exist
- **Error Handling**: Graceful handling of file I/O errors

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run specific test file
npm test tests/typeInferer.test.ts
```

## 📊 Performance Optimizations

### Large File Handling

- **Smart Sampling**: Only samples first N elements in arrays (configurable)
- **Memoization**: Caches type inference results
- **Lazy Evaluation**: Processes arrays on-demand
- **Depth Limiting**: Prevents infinite recursion

### Memory Management

- **Streaming**: Processes large JSON files efficiently
- **Garbage Collection**: Clears caches after processing
- **Error Recovery**: Continues processing on individual field errors

## 🔌 IDE Integration

### VS Code Extension

```json
{
  "name": "json-type-gen",
  "version": "1.0.0",
  "engines": {
    "vscode": "^1.60.0"
  },
  "activationEvents": ["onCommand:json-type-gen.generate"],
  "contributes": {
    "commands": [
      {
        "command": "json-type-gen.generate",
        "title": "Generate Types from JSON"
      }
    ]
  }
}
```

### Cursor Plugin

The tool is designed to work seamlessly with Cursor's AI features:

- **File Selection**: Right-click on JSON files to generate types
- **Language Selection**: Choose target language via UI
- **Output Integration**: Automatically insert generated types into files

## 🏗️ Architecture

### Modular Design

```
json-type-gen/
├── main.ts                 # CLI entry point
├── generators/             # Language-specific generators
│   ├── types.ts           # CodeGenerator interface
│   ├── tsGenerator.ts     # TypeScript generator
│   ├── goGenerator.ts     # Go generator
│   └── ...                # Other language generators
├── utils/                 # Core utilities
│   ├── typeInferer.ts    # Type inference logic
│   └── fileWriter.ts     # Safe file operations
└── tests/                # Unit tests
    ├── typeInferer.test.ts
    └── fileWriter.test.ts
```

### Extending with New Languages

To add support for a new language:

1. Create a new generator file in `generators/`
2. Implement the `CodeGenerator` interface
3. Add the generator to the `generators` object in `main.ts`
4. Add tests for the new generator

Example for Kotlin:

```typescript
// generators/kotlinGenerator.ts
import { CodeGenerator } from "./types";
import { TypeDefinition } from "../utils/typeInferer";

const mapTypeToKotlin = (type: string): string => {
  switch (type) {
    case "string":
      return "String";
    case "number":
      return "Double";
    case "boolean":
      return "Boolean";
    default:
      return "Any";
  }
};

export const kotlinGenerator: CodeGenerator = {
  generate: (def: TypeDefinition) => {
    const lines = Object.entries(def.fields).map(
      ([k, v]) => `    val ${k}: ${mapTypeToKotlin(v)}`
    );
    return `data class ${def.name}(\n${lines.join(",\n")}\n)`;
  },
  getFileExtension: () => "kt",
  getCommentStyle: () => "//",
};
```

## 🐛 Debugging

### Common Issues

1. **Large Array Processing**: Use `--sample` to limit array analysis
2. **Deep Recursion**: Adjust `maxDepth` in type inference options
3. **Mixed Types**: Use `--strict` for union types or default to `any`
4. **File Permissions**: Ensure write permissions for output directory

### Logging

The tool provides detailed logging:

```bash
# Enable verbose logging
DEBUG=* ts-node main.ts data.json ts

# Show type inference details
ts-node main.ts data.json ts --verbose
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Ensure all tests pass
5. Submit a pull request

### Development Setup

```bash
# Install dependencies
npm install

# Run linting
npm run lint

# Format code
npm run format

# Build project
npm run build
```

## 📄 License

MIT License - see LICENSE file for details.

## 🆘 Support

- **Issues**: Report bugs and feature requests on GitHub
- **Documentation**: Check the README and inline code comments
- **Examples**: See `sample.json` and test files for usage examples

---

**Happy Type Generating! 🎉**
