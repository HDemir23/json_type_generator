import { CodeGenerator } from "./types";
import { TypeDefinition } from "../utils/typeInferer";

const mapTypeToGo = (type: string): string => {
  switch (type) {
    case "string":
      return "string";
    case "number":
      return "float64";
    case "boolean":
      return "bool";
    case "null":
      return "interface{}";
    case "any":
      return "interface{}";
    case "object":
      return "map[string]interface{}";
    default:
      if (type.endsWith("[]")) {
        const elementType = mapTypeToGo(type.slice(0, -2));
        return `[]${elementType}`;
      }
      return "interface{}";
  }
};

export const goGenerator: CodeGenerator = {
  generate: (def: TypeDefinition) => {
    const lines = Object.entries(def.fields).map(
      ([k, v]) => `\t${k} ${mapTypeToGo(v)} \`json:"${k}"\``
    );
    return `type ${def.name} struct {\n${lines.join("\n")}\n}`;
  },
  getFileExtension: () => "go",
  getCommentStyle: () => "//",
};
