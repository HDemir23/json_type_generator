import { CodeGenerator } from "./types";
import { TypeDefinition } from "../utils/typeInferer";

const mapTypeToSwift = (type: string): string => {
  switch (type) {
    case "string":
      return "String";
    case "number":
      return "Double";
    case "boolean":
      return "Bool";
    case "null":
      return "String?";
    case "any":
      return "Any";
    case "object":
      return "Any";
    default:
      if (type.endsWith("[]")) {
        const elementType = mapTypeToSwift(type.slice(0, -2));
        return `[${elementType}]`;
      }
      return "Any";
  }
};

export const swiftGenerator: CodeGenerator = {
  generate: (def: TypeDefinition) => {
    const lines = Object.entries(def.fields).map(
      ([k, v]) => `    let ${k}: ${mapTypeToSwift(v)}`
    );
    return `struct ${def.name}: Codable {\n${lines.join("\n")}\n}`;
  },
  getFileExtension: () => "swift",
  getCommentStyle: () => "//",
};
