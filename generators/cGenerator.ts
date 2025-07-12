import { CodeGenerator } from "./types";
import { TypeDefinition } from "../utils/typeInferer";

const mapTypeToC = (type: string): string => {
  switch (type) {
    case "string":
      return "char*";
    case "number":
      return "double";
    case "boolean":
      return "int";
    case "null":
      return "void*";
    case "any":
      return "void*";
    case "object":
      return "void*";
    default:
      if (type.endsWith("[]")) {
        const elementType = mapTypeToC(type.slice(0, -2));
        return `${elementType}*`;
      }
      return "void*";
  }
};

export const cGenerator: CodeGenerator = {
  generate: (def: TypeDefinition) => {
    const lines = Object.entries(def.fields).map(
      ([k, v]) => `    ${mapTypeToC(v)} ${k};`
    );
    return `typedef struct {\n${lines.join("\n")}\n} ${def.name};`;
  },
  getFileExtension: () => "h",
  getCommentStyle: () => "//",
};
