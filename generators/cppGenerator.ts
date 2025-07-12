import { CodeGenerator } from "./types";
import { TypeDefinition } from "../utils/typeInferer";

const mapTypeToCpp = (type: string): string => {
  switch (type) {
    case "string":
      return "std::string";
    case "number":
      return "double";
    case "boolean":
      return "bool";
    case "null":
      return "std::nullptr_t";
    case "any":
      return "nlohmann::json";
    case "object":
      return "nlohmann::json";
    default:
      if (type.endsWith("[]")) {
        const elementType = mapTypeToCpp(type.slice(0, -2));
        return `std::vector<${elementType}>`;
      }
      return "nlohmann::json";
  }
};

export const cppGenerator: CodeGenerator = {
  generate: (def: TypeDefinition) => {
    const lines = Object.entries(def.fields).map(
      ([k, v]) => `    ${mapTypeToCpp(v)} ${k};`
    );
    return `class ${def.name} {\npublic:\n${lines.join("\n")}\n};`;
  },
  getFileExtension: () => "hpp",
  getCommentStyle: () => "//",
};
