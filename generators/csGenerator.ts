import { CodeGenerator } from "./types";
import { TypeDefinition } from "../utils/typeInferer";

const mapTypeToCSharp = (type: string): string => {
  switch (type) {
    case "string":
      return "string";
    case "number":
      return "double";
    case "boolean":
      return "bool";
    case "null":
      return "object";
    case "any":
      return "object";
    case "object":
      return "object";
    default:
      if (type.endsWith("[]")) {
        const elementType = mapTypeToCSharp(type.slice(0, -2));
        return `${elementType}[]`;
      }
      return "object";
  }
};

export const csGenerator: CodeGenerator = {
  generate: (def: TypeDefinition) => {
    const lines = Object.entries(def.fields).map(
      ([k, v]) =>
        `    [JsonProperty("${k}")]\n    public ${mapTypeToCSharp(v)} ${
          k.charAt(0).toUpperCase() + k.slice(1)
        } { get; set; }`
    );
    return `public class ${def.name}\n{\n${lines.join("\n\n")}\n}`;
  },
  getFileExtension: () => "cs",
  getCommentStyle: () => "//",
};
